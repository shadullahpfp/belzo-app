import { Platform, ViewStyle } from 'react-native';

/**
 * Belzo Cross-Platform Utility
 * Handles device, OS, and hardware differences between iOS and Android.
 */

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/**
 * Standard cross-platform shadow/elevation generator.
 * iOS uses shadowColor/Offset/Opacity/Radius while Android uses elevation.
 */
export function getElevation(level: 1 | 2 | 3 | 4 | 5): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#2A134D',
      shadowOffset: {
        width: 0,
        height: level * 2,
      },
      shadowOpacity: 0.08 + level * 0.03,
      shadowRadius: level * 3,
    },
    android: {
      elevation: level * 2,
    },
    default: {},
  }) as ViewStyle;
}

/**
 * Keyboard avoiding offset configuration per platform.
 * iOS requires vertical offset adjustments based on the status bar and header height,
 * whereas Android pan mode handles view adjustments automatically.
 */
export const keyboardAvoidingBehavior = Platform.select<'padding' | 'height' | undefined>({
  ios: 'padding',
  android: undefined,
});

/**
 * Platform-specific font weight mapping.
 * Android sometimes drops custom font weights if numeric strings aren't mapped properly.
 */
export function getFontFamily(weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular') {
  return Platform.select({
    ios: {
      fontFamily: 'System',
      fontWeight: weight === 'bold' ? '700' : weight === 'semibold' ? '600' : weight === 'medium' ? '500' : '400',
    },
    android: {
      fontFamily: weight === 'bold' ? 'PlusJakartaSans-Bold' : weight === 'semibold' ? 'PlusJakartaSans-SemiBold' : weight === 'medium' ? 'PlusJakartaSans-Medium' : 'PlusJakartaSans-Regular',
    },
    default: {
      fontFamily: 'sans-serif',
    },
  });
}
