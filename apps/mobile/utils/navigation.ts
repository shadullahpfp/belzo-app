import { Linking, Platform } from 'react-native';

/**
 * Platform-aware Turn-by-Turn GPS Navigation deep linking
 * iOS: Apple Maps (maps://)
 * Android: Google Maps Navigation Intent (google.navigation:q=)
 * Web/Fallback: Google Maps Web Directions
 */
export async function openTurnByTurnNavigation(
  latitude: number,
  longitude: number,
  label: string = 'Destination'
): Promise<void> {
  const encodedLabel = encodeURIComponent(label);

  if (Platform.OS === 'ios') {
    const appleMapsUrl = `maps://?daddr=${latitude},${longitude}&dirflg=d&q=${encodedLabel}`;
    const canOpenApple = await Linking.canOpenURL(appleMapsUrl);
    if (canOpenApple) {
      await Linking.openURL(appleMapsUrl);
      return;
    }
  } else if (Platform.OS === 'android') {
    const googleNavUrl = `google.navigation:q=${latitude},${longitude}&mode=d`;
    const canOpenGoogleNav = await Linking.canOpenURL(googleNavUrl);
    if (canOpenGoogleNav) {
      await Linking.openURL(googleNavUrl);
      return;
    }
  }

  // Universal browser / Google Maps web fallback
  const webFallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodedLabel}`;
  await Linking.openURL(webFallbackUrl);
}
