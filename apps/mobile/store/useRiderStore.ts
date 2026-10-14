import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { supabase } from '../src/lib/supabase';

export interface RiderOrderItem {
  name: string;
  unit: string;
  quantity: number;
  checked: boolean;
}

export interface RiderOrder {
  id: string;
  short_code: string;
  status: 'ready_for_pickup' | 'out_for_delivery' | 'delivered';
  store_name: string;
  store_address: string;
  store_phone: string;
  store_latitude: number;
  store_longitude: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_latitude: number;
  customer_longitude: number;
  delivery_notes: string;
  delivery_pin: string;
  payout: number;
  distance_to_store: string;
  distance_to_customer: string;
  items: RiderOrderItem[];
}

export interface CompletedOrder {
  id: string;
  short_code: string;
  completed_at: string;
  payout: number;
  distance: string;
  customer_name: string;
}

export interface ShiftMetrics {
  todayEarnings: number;
  completedCount: number;
  rating: number;
  totalDistanceKm: number;
  basePay: number;
  surgePay: number;
  tips: number;
}

interface RiderState {
  isOnline: boolean;
  currentOrder: RiderOrder | null;
  incomingAlert: RiderOrder | null;
  shiftMetrics: ShiftMetrics;
  completedOrders: CompletedOrder[];
  
  // Actions
  toggleDutyStatus: (online?: boolean) => Promise<void>;
  setIncomingAlert: (order: RiderOrder | null) => void;
  acceptOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string) => void;
  toggleItemCheck: (index: number) => void;
  confirmPickup: (orderId: string) => Promise<void>;
  verifyPinAndDeliver: (orderId: string, inputPin: string) => Promise<boolean>;
}

export const useRiderStore = create<RiderState>((set, get) => ({
  isOnline: true,
  currentOrder: null,
  incomingAlert: null,
  shiftMetrics: {
    todayEarnings: 0,
    completedCount: 0,
    rating: 5.0,
    totalDistanceKm: 0,
    basePay: 0,
    surgePay: 0,
    tips: 0,
  },
  completedOrders: [],

  toggleDutyStatus: async (online?: boolean) => {
    const current = get().isOnline;
    const nextState = online !== undefined ? online : !current;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    set({ isOnline: nextState });

    // Sync to Supabase riders and profiles table
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        await supabase.from('riders').update({ is_online: nextState }).eq('id', userId);
        await supabase.from('profiles').update({ is_active: nextState }).eq('id', userId);
      }
    } catch {
      // Local optimistic update
    }
  },

  setIncomingAlert: (order: RiderOrder | null) => {
    set({ incomingAlert: order });
  },

  acceptOrder: async (orderId: string) => {
    const alert = get().incomingAlert;
    if (!alert || alert.id !== orderId) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const assignedOrder: RiderOrder = {
      ...alert,
      status: 'out_for_delivery',
    };

    set({
      currentOrder: assignedOrder,
      incomingAlert: null,
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      await supabase
        .from('orders')
        .update({
          status: 'out_for_delivery',
          ...(userId ? { rider_id: userId } : {}),
        })
        .eq('id', orderId);
    } catch {
      // Local state fallback
    }
  },

  rejectOrder: (orderId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    set({ incomingAlert: null });
  },

  toggleItemCheck: (index: number) => {
    const order = get().currentOrder;
    if (!order) return;

    try {
      Haptics.selectionAsync();
    } catch {}

    const updatedItems = [...order.items];
    if (updatedItems[index]) {
      updatedItems[index] = {
        ...updatedItems[index],
        checked: !updatedItems[index].checked
      };
      set({
        currentOrder: {
          ...order,
          items: updatedItems
        }
      });
    }
  },

  confirmPickup: async (orderId: string) => {
    const order = get().currentOrder;
    if (!order) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    set({
      currentOrder: {
        ...order,
        status: 'out_for_delivery'
      }
    });

    try {
      await supabase
        .from('orders')
        .update({ status: 'out_for_delivery' })
        .eq('id', orderId);
    } catch {
      // Fallback
    }
  },

  verifyPinAndDeliver: async (orderId: string, inputPin: string): Promise<boolean> => {
    const order = get().currentOrder;
    if (!order) return false;

    // PIN is valid if it matches order.delivery_pin or last 4 digits of customer phone
    const cleanPhone = order.customer_phone.replace(/\D/g, '');
    const phoneLast4 = cleanPhone.slice(-4);
    const isValid = inputPin === order.delivery_pin || (phoneLast4.length === 4 && inputPin === phoneLast4);

    if (!isValid) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      return false;
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const payout = order.payout || 65;
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newCompleted: CompletedOrder = {
      id: order.id,
      short_code: order.short_code,
      completed_at: timestamp,
      payout,
      distance: order.distance_to_customer,
      customer_name: order.customer_name
    };

    const currentMetrics = get().shiftMetrics;
    const updatedMetrics: ShiftMetrics = {
      ...currentMetrics,
      todayEarnings: currentMetrics.todayEarnings + payout,
      completedCount: currentMetrics.completedCount + 1,
      totalDistanceKm: +(currentMetrics.totalDistanceKm + 3.2).toFixed(1),
      basePay: currentMetrics.basePay + 45,
      surgePay: currentMetrics.surgePay + 20
    };

    set({
      currentOrder: null,
      shiftMetrics: updatedMetrics,
      completedOrders: [newCompleted, ...get().completedOrders]
    });

    try {
      await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId);
    } catch {
      // Fallback
    }

    return true;
  },
}));
