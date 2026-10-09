import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export const JONIHA_HUB = {
  name: 'Belzo Joniha Central Hub',
  code: 'BLZ-UP-JON01',
  latitude: 26.0350,
  longitude: 80.4650,
  serviceRadiusKm: 5.0,
  address: 'Joniha Chauraha, Bindki Road, Fatehpur, UP - 212635',
} as const;

/**
 * Calculates straight-line distance in kilometers using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in KM
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationState {
  coords: Coordinates | null;
  addressText: string;
  pincode: string;
  isServiceable: boolean;
  distanceFromHubKm: number | null;
  isLoading: boolean;
  permissionDenied: boolean;

  // Actions
  fetchCurrentLocation: () => Promise<void>;
  setManualLocation: (coords: Coordinates, addressName?: string, pincode?: string) => void;
  setDemoJonihaLocation: () => void;
  setOutOfZoneDemoLocation: () => void;
}

// Resilient storage adapter preventing crashes if storage unavailable
const safeAsyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {}
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {}
  },
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      coords: null,
      addressText: 'Shahbajpur, Joniha',
      pincode: '212635',
      isServiceable: true,
      distanceFromHubKm: 0.0,
      isLoading: false,
      permissionDenied: false,

      fetchCurrentLocation: async () => {
        set({ isLoading: true });

        try {
          // 1. Request foreground location permission
          const { status } = await Location.requestForegroundPermissionsAsync();

          if (status !== 'granted') {
            set({
              isLoading: false,
              permissionDenied: true,
              // If no coords stored previously, fallback to out-of-zone or default
              isServiceable: get().coords ? get().isServiceable : false,
            });
            return;
          }

          set({ permissionDenied: false });

          // 2. Fetch current coordinates with Balanced accuracy for speed & battery
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const currentCoords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // 3. Compute Haversine distance to Joniha Central Hub
          const distance = calculateHaversineDistanceKm(
            currentCoords.latitude,
            currentCoords.longitude,
            JONIHA_HUB.latitude,
            JONIHA_HUB.longitude
          );

          const isServiceable = distance <= JONIHA_HUB.serviceRadiusKm;

          // 4. Reverse geocode to extract human-readable address & postal code
          let addressText = isServiceable ? 'Shahbajpur, Joniha' : 'Outside Service Zone';
          let pincode = '212635';

          try {
            const geocoded = await Location.reverseGeocodeAsync({
              latitude: currentCoords.latitude,
              longitude: currentCoords.longitude,
            });

            if (geocoded && geocoded.length > 0) {
              const geo = geocoded[0];
              pincode = geo.postalCode || pincode;

              const streetOrName = geo.name || geo.street || '';
              const areaOrSubregion = geo.subregion || geo.district || '';
              const city = geo.city || '';

              const parts = [streetOrName, areaOrSubregion, city].filter(Boolean);
              if (parts.length > 0) {
                // Deduplicate consecutive identical names
                const uniqueParts = parts.filter(
                  (val, idx, arr) => arr.indexOf(val) === idx
                );
                addressText = uniqueParts.slice(0, 2).join(', ');
              }
            }
          } catch (geoErr) {
            console.warn('[useLocationStore] Reverse geocode fallback:', geoErr);
          }

          set({
            coords: currentCoords,
            addressText,
            pincode,
            distanceFromHubKm: distance,
            isServiceable,
            isLoading: false,
          });
        } catch (error) {
          console.warn('[useLocationStore] Error fetching location:', error);
          set({ isLoading: false });
        }
      },

      setManualLocation: (coords: Coordinates, addressName?: string, pincode?: string) => {
        const distance = calculateHaversineDistanceKm(
          coords.latitude,
          coords.longitude,
          JONIHA_HUB.latitude,
          JONIHA_HUB.longitude
        );
        const isServiceable = distance <= JONIHA_HUB.serviceRadiusKm;

        set({
          coords,
          addressText: addressName || (isServiceable ? 'Shahbajpur, Joniha' : 'External Location'),
          pincode: pincode || '212635',
          distanceFromHubKm: distance,
          isServiceable,
          isLoading: false,
          permissionDenied: false,
        });
      },

      setDemoJonihaLocation: () => {
        const demoCoords: Coordinates = {
          latitude: JONIHA_HUB.latitude,
          longitude: JONIHA_HUB.longitude,
        };
        set({
          coords: demoCoords,
          addressText: 'Shahbajpur, Joniha',
          pincode: '212635',
          distanceFromHubKm: 0.0,
          isServiceable: true,
          isLoading: false,
          permissionDenied: false,
        });
      },

      setOutOfZoneDemoLocation: () => {
        // Lucknow coordinates (~110 km from Joniha) for testing non-serviceable states
        const outOfZoneCoords: Coordinates = {
          latitude: 26.8467,
          longitude: 80.9462,
        };
        const distance = calculateHaversineDistanceKm(
          outOfZoneCoords.latitude,
          outOfZoneCoords.longitude,
          JONIHA_HUB.latitude,
          JONIHA_HUB.longitude
        );
        set({
          coords: outOfZoneCoords,
          addressText: 'Hazratganj, Lucknow',
          pincode: '226001',
          distanceFromHubKm: distance,
          isServiceable: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'belzo-device-location-storage',
      storage: createJSONStorage(() => safeAsyncStorage),
      partialize: (state) => ({
        coords: state.coords,
        addressText: state.addressText,
        pincode: state.pincode,
        isServiceable: state.isServiceable,
        distanceFromHubKm: state.distanceFromHubKm,
      }),
    }
  )
);
