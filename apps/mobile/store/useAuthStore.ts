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
  user: User | { id: string; phone?: string; email?: string } | null;
  profile: UserProfile | null;
  rider: RiderData | null;
  role: 'customer' | 'rider' | 'store_operator' | 'admin' | null;
  isLoading: boolean;
  isProfileSheetOpen: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  setUser: (user: any) => void;
  setProfile: (profile: UserProfile | null) => void;
  setRider: (rider: RiderData | null) => void;
  setRole: (role: 'customer' | 'rider' | 'store_operator' | 'admin' | null) => void;
  setIsProfileSheetOpen: (open: boolean) => void;
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

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setRider: (rider) => set({ rider }),
  setRole: (role) => set({ role }),
  setIsProfileSheetOpen: (isProfileSheetOpen) => set({ isProfileSheetOpen }),

  fetchProfile: async (userId: string, roleHint?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        const userProfile = data as UserProfile;
        const assignedRole = (userProfile.role || roleHint || 'customer') as any;
        set({
          profile: userProfile,
          role: assignedRole,
          isLoading: false,
          isProfileSheetOpen: !userProfile.full_name || userProfile.full_name.trim() === '',
        });

        if (assignedRole === 'rider') {
          await get().fetchRiderData(userId);
        }

        return userProfile;
      } else {
        // Fallback for new or offline profiles
        const currentUser = get().user;
        const fallbackProfile: UserProfile = {
          id: userId,
          phone: (currentUser as any)?.phone || '+91 98765 43210',
          full_name: null,
          role: (roleHint as any) || 'customer',
          is_active: true,
        };
        set({
          profile: fallbackProfile,
          role: (roleHint as any) || 'customer',
          isLoading: false,
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
        .eq('id', riderId)
        .maybeSingle();

      if (data && !error) {
        const riderInfo: RiderData = {
          id: data.id,
          vehicle_type: data.vehicle_type || 'Motorcycle',
          vehicle_number: data.vehicle_number || 'UP-71-AB-1234',
          license_number: data.license_number || null,
          is_online: data.is_online ?? true,
          rating: Number(data.rating) || 4.95,
          total_deliveries: data.total_deliveries || 18,
        };
        set({ rider: riderInfo });
        return riderInfo;
      } else {
        const defaultRider: RiderData = {
          id: riderId,
          vehicle_type: 'Motorcycle',
          vehicle_number: 'UP-71-AB-1234',
          is_online: true,
          rating: 4.95,
          total_deliveries: 18,
        };
        set({ rider: defaultRider });
        return defaultRider;
      }
    } catch {
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

    // Optimistic update
    set({
      profile: mergedProfile,
      role: mergedProfile.role,
      isProfileSheetOpen: false,
    });

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
        console.warn('Supabase profile upsert warning:', error.message);
      }
      return true;
    } catch (err) {
      console.warn('Supabase profile update exception:', err);
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
      console.warn('Rider update exception:', err);
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

    // Check Supabase for real existing profile for this demo account
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', demoId)
        .maybeSingle();

      if (existing) {
        set({
          profile: existing as UserProfile,
          isProfileSheetOpen: !existing.full_name || existing.full_name.trim() === '',
        });
        if (newRole === 'rider') {
          await get().fetchRiderData(demoId);
        }
      } else {
        const newProfile: UserProfile = {
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
        };
        set({
          profile: newProfile,
          isProfileSheetOpen: newRole === 'customer',
        });
        if (newRole === 'rider') {
          await get().fetchRiderData(demoId);
        }
      }
    } catch {
      set({
        profile: {
          id: demoId,
          phone: fullPhone,
          full_name: null,
          role: newRole,
          is_active: true,
        },
        isProfileSheetOpen: newRole === 'customer',
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
