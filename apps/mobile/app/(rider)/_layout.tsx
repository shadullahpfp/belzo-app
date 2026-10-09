import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useRiderStore, RiderOrder } from '../../store/useRiderStore';

export default function RiderLayout() {
  const { setIncomingAlert, isOnline } = useRiderStore();

  useEffect(() => {
    if (!isOnline) return;

    // Realtime channel for order dispatch events
    const channel = supabase
      .channel('rider-order-dispatch')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async (payload: any) => {
          const newOrder = payload.new;
          if (!newOrder) return;

          // If order is ready for courier dispatch
          if (newOrder.status === 'ready' || newOrder.status === 'ready_for_pickup') {
            const formattedOrder: RiderOrder = {
              id: newOrder.id,
              short_code: `BLZ-${newOrder.id.substring(0, 4).toUpperCase()}`,
              status: 'ready_for_pickup',
              store_name: 'Belzo Joniha Central Hub 01',
              store_address: 'Joniha Chauraha, Bindki Road, Fatehpur (212635)',
              store_phone: '+91 98765 00001',
              store_latitude: 26.0350,
              store_longitude: 80.4650,
              customer_name: 'Customer',
              customer_phone: '+91 98765 11223',
              customer_address: newOrder.delivery_address || 'Ward No. 4, Shahbajpur, Joniha, Bindki',
              customer_latitude: 26.0365,
              customer_longitude: 80.4672,
              delivery_notes: 'Leave with security if not available',
              delivery_pin: newOrder.delivery_pin || '1234',
              payout: 65,
              distance_to_store: '0.8 km',
              distance_to_customer: '1.4 km',
              items: [
                { name: 'Dairy & Grocery Basket', unit: '1 Pack', quantity: 1, checked: false }
              ]
            };
            setIncomingAlert(formattedOrder);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F2F2F7' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="active-order" />
      <Stack.Screen name="earnings" />
    </Stack>
  );
}
