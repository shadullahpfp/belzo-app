import { create } from 'zustand';
import { supabase } from '../src/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  phone: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role: 'customer' | 'rider' | 'store_operator' | 'admin';
  is_active?: boolean;
  default_address?: any;
}

export interface RiderData {
  id: string;
  vehicle_type: string;
  vehicle_number: string;
  license_number?: string | null;
  is_online: boolean;
  rating: number;
  total_deliveries?: number;
}

interface AuthState {
  session: Session | null;
  user: User | { id: string; phone?: string; email?: string } | any | null;
  profile: UserProfile | null;
  rider: RiderData | null;
  role: 'customer' | 'rider' | 'store_operator' | 'admin' | null;
  isLoading: boolean;
  isProfileSheetOpen: boolean;
  isProfileIncomplete: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  setUser: (user: any) => void;
  setProfile: (profile: UserProfile | null) => void;
  setRider: (rider: RiderData | null) => void;
  setRole: (role: 'customer' | 'rider' | 'store_operator' | 'admin' | null) => void;
  setIsProfileSheetOpen: (open: boolean) => void;
  setIsProfileIncomplete: (incomplete: boolean) => void;
  syncClerkUser: (clerkUser: any) => Promise<UserProfile | null>;
  fetchProfile: (userId: string, roleHint?: string) => Promise<UserProfile | null>;
  fetchRiderData: (riderId: string) => Promise<RiderData | null>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateRiderDetails: (updates: Partial<RiderData>) => Promise<boolean>;
  setDemoAuth: (role: 'customer' | 'rider', phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  rider: null,
  role: null,
  isLoading: true,
  isProfileSheetOpen: false,
  isProfileIncomplete: false,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setRider: (rider) => set({ rider }),
  setRole: (role) => set({ role }),
  setIsProfileSheetOpen: (isProfileSheetOpen) => set({ isProfileSheetOpen }),
  setIsProfileIncomplete: (isProfileIncomplete) => set({ isProfileIncomplete }),

  syncClerkUser: async (clerkUser: any) => {
    if (!clerkUser) return null;
    const userId = clerkUser.id;
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      null;
    const fullName =
      clerkUser.fullName ||
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      'Belzo Member';
    const avatarUrl = clerkUser.imageUrl || null;

    set({
      user: {
        id: userId,
        email,
        fullName,
        imageUrl: avatarUrl,
      } as any,
    });

    try {
      // Upsert into Supabase public.profiles
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            email,
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select()
        .maybeSingle();

      const phoneNumber = data?.phone || data?.phone_number || null;
      const hasValidPhone = !!phoneNumber && phoneNumber.trim().length >= 10;
      const hasValidAddress = !!data?.default_address;
      const isIncomplete = !hasValidPhone || !hasValidAddress;

      let effectiveRole = (data?.role as any) || 'customer';
      if (effectiveRole === 'rider') {
        const { data: riderRow } = await supabase
          .from('riders')
          .select('*')
          .or(`id.eq.${userId},user_id.eq.${userId}`)
          .maybeSingle();

        if (riderRow && riderRow.is_approved) {
          effectiveRole = 'rider';
          set({
            rider: {
              id: riderRow.id,
              vehicle_type: riderRow.vehicle_type || 'Motorcycle',
              vehicle_number: riderRow.vehicle_number || '',
              license_number: riderRow.license_number || null,
              is_online: riderRow.is_online ?? true,
              rating: Number(riderRow.rating) || 5.0,
              total_deliveries: riderRow.total_deliveries || 0,
            },
          });
        } else {
          effectiveRole = 'customer';
          set({ rider: null });
        }
      }

      const userProfile: UserProfile = {
        id: userId,
        phone: phoneNumber || '',
        full_name: data?.full_name || fullName,
        email,
        avatar_url: avatarUrl,
        role: effectiveRole,
        is_active: data?.is_active ?? true,
        default_address: data?.default_address || null,
      };

      set({
        profile: userProfile,
        role: effectiveRole,
        isLoading: false,
        isProfileIncomplete: isIncomplete,
        isProfileSheetOpen: isIncomplete,
      });

      return userProfile;
    } catch (err) {
      console.warn('Supabase Clerk profile sync note:', err);
      const fallbackProfile: UserProfile = {
        id: userId,
        phone: '',
        full_name: fullName,
        email,
        avatar_url: avatarUrl,
        role: 'customer',
        is_active: true,
      };
      set({
        profile: fallbackProfile,
        role: 'customer',
        rider: null,
        isLoading: false,
        isProfileIncomplete: true,
        isProfileSheetOpen: true,
      });
      return fallbackProfile;
    }
  },

  fetchProfile: async (userId: string, roleHint?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        const userProfile = data as UserProfile;
        let assignedRole = (userProfile.role || roleHint || 'customer') as any;
        const phoneNumber = (data as any)?.phone || (data as any)?.phone_number || null;
        const hasValidPhone = !!phoneNumber && phoneNumber.trim().length >= 10;
        const hasValidAddress = !!(data as any)?.default_address;
        const isIncomplete = !hasValidPhone || !hasValidAddress || !userProfile.full_name;

        if (assignedRole === 'rider') {
          const riderInfo = await get().fetchRiderData(userId);
          if (!riderInfo) {
            assignedRole = 'customer';
          }
        }

        userProfile.role = assignedRole;

        set({
          profile: userProfile,
          role: assignedRole,
          isLoading: false,
          isProfileIncomplete: isIncomplete,
          isProfileSheetOpen: isIncomplete,
        });

        return userProfile;
      } else {
        // Fallback for new or offline profiles
        const currentUser = get().user;
        const fallbackProfile: UserProfile = {
          id: userId,
          phone: (currentUser as any)?.phone || '',
          full_name: (currentUser as any)?.fullName || null,
          role: 'customer',
          is_active: true,
        };
        set({
          profile: fallbackProfile,
          role: 'customer',
          rider: null,
          isLoading: false,
          isProfileIncomplete: true,
          isProfileSheetOpen: true,
        });
        return fallbackProfile;
      }
    } catch (err) {
      console.warn('Profile fetch note:', err);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRiderData: async (riderId: string) => {
    try {
      const { data, error } = await supabase
        .from('riders')
        .select('*')
        .or(`id.eq.${riderId},user_id.eq.${riderId}`)
        .maybeSingle();

      if (data && !error && data.is_approved) {
        const riderInfo: RiderData = {
          id: data.id,
          vehicle_type: data.vehicle_type || 'Motorcycle',
          vehicle_number: data.vehicle_number || '',
          license_number: data.license_number || null,
          is_online: data.is_online ?? true,
          rating: Number(data.rating) || 5.0,
          total_deliveries: data.total_deliveries || 0,
        };
        set({ rider: riderInfo, role: 'rider' });
        return riderInfo;
      } else {
        set({ rider: null, role: 'customer' });
        return null;
      }
    } catch {
      set({ rider: null, role: 'customer' });
      return null;
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const currentProfile = get().profile;
    const currentUser = get().user;
    const userId = currentProfile?.id || (currentUser as any)?.id;
    if (!userId) return false;

    const baseProfile: UserProfile = currentProfile || {
      id: userId,
      phone: (currentUser as any)?.phone || '+91 98765 43210',
      full_name: null,
      role: get().role || 'customer',
    };

    const mergedProfile: UserProfile = {
      ...baseProfile,
      ...updates,
      id: userId,
      phone: updates.phone ?? baseProfile.phone,
      full_name: updates.full_name !== undefined ? updates.full_name : baseProfile.full_name,
      role: updates.role ?? baseProfile.role,
    };

    const hasValidPhone = !!mergedProfile.phone && mergedProfile.phone.trim().length >= 10;
    const hasValidAddress = !!mergedProfile.default_address;
    const isIncomplete = !hasValidPhone || !hasValidAddress || !mergedProfile.full_name;

    // Optimistic update
    set({
      profile: mergedProfile,
      role: mergedProfile.role,
      isProfileIncomplete: isIncomplete,
      isProfileSheetOpen: isIncomplete ? get().isProfileSheetOpen : false,
    });

    // Skip Supabase write for demo accounts (IDs not in auth.users — FK violation)
    const isDemoId = userId.startsWith('d0000000-');
    if (isDemoId) return true;

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        phone: mergedProfile.phone,
        full_name: mergedProfile.full_name,
        role: mergedProfile.role,
        default_address: mergedProfile.default_address,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        // Non-fatal: profile is already updated in local state
        console.warn('Supabase profile upsert (non-fatal):', error.message);
      }
      return true;
    } catch (err) {
      console.warn('Supabase profile update (non-fatal):', err);
      return true;
    }
  },

  updateRiderDetails: async (updates: Partial<RiderData>) => {
    const currentRider = get().rider;
    const currentProfile = get().profile;
    const riderId = currentRider?.id || currentProfile?.id;
    if (!riderId) return false;

    const mergedRider: RiderData = {
      ...(currentRider || {
        id: riderId,
        vehicle_type: 'Motorcycle',
        vehicle_number: 'UP-71-AB-1234',
        is_online: true,
        rating: 4.95,
      }),
      ...updates,
    };

    set({ rider: mergedRider });

    // Skip Supabase write for demo accounts
    const isDemoId = riderId.startsWith('d0000000-');
    if (isDemoId) return true;

    try {
      await supabase.from('riders').upsert({
        id: riderId,
        vehicle_type: mergedRider.vehicle_type,
        vehicle_number: mergedRider.vehicle_number,
        is_online: mergedRider.is_online,
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.warn('Rider update (non-fatal):', err);
      return true;
    }
  },

  setDemoAuth: async (newRole: 'customer' | 'rider', phone = '9876543210') => {
    const demoId =
      newRole === 'rider'
        ? 'd0000000-0000-0000-0000-000000000002'
        : 'd0000000-0000-0000-0000-000000000001';

    const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    const demoUser = {
      id: demoId,
      phone: fullPhone,
      email: `${phone}@belzo.internal`,
    };

    set({
      user: demoUser as any,
      role: newRole,
      isLoading: false,
    });

    // Demo accounts: skip Supabase DB read/write — demo IDs don't exist in auth.users
    // and foreign key constraint would cause an unhandled exception (error boundary popup).
    set({
      profile: {
        id: demoId,
        phone: fullPhone,
        full_name: null,
        role: newRole,
        is_active: true,
        default_address: {
          city: 'Bindki',
          area: 'Joniha Chauraha',
          address: 'Ward No. 4, Shahbajpur, Joniha, Bindki (212635)',
        },
      },
      isProfileSheetOpen: newRole === 'customer',
    });
    if (newRole === 'rider') {
      set({
        rider: {
          id: demoId,
          vehicle_type: 'Motorcycle',
          vehicle_number: 'UP-71-AB-1234',
          is_online: true,
          rating: 4.95,
          total_deliveries: 18,
        },
      });
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    set({
      session: null,
      user: null,
      profile: null,
      rider: null,
      role: null,
      isLoading: false,
      isProfileSheetOpen: false,
    });
  },
}));
