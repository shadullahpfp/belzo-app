import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

export interface BottomCartPillProps {
  itemCount: number;
  totalPrice: number;
  etaMinutes?: number;
  onPress: () => void;
  bottomOffset?: number;
}

/**
 * BottomCartPill - Apple Capsule Floating Glass Cart Dock
 * Mounts with spring physics (damping: 22, stiffness: 280) and frosted dark acrylic background.
 */
export const BottomCartPill: React.FC<BottomCartPillProps> = ({
  itemCount,
  totalPrice,
  etaMinutes = 12,
  onPress,
  bottomOffset = 20,
}) => {
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (itemCount > 0) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          stiffness: 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 120,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [itemCount]);

  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onPress();
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handlePress}
        style={styles.capsule}
      >
        {/* Left Section: [X Items] ₹Total • ⚡ 11 MINS */}
        <View style={styles.leftSection}>
          <View style={styles.itemBadge}>
            <Text style={styles.itemCountText}>
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
            </Text>
          </View>
          <Text style={styles.totalPriceText}>
            ₹{totalPrice.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.bulletDot}>•</Text>
          <View style={styles.etaRow}>
            <Text style={styles.lightningIcon}>⚡</Text>
            <Text style={styles.etaText}>{etaMinutes} MINS</Text>
          </View>
        </View>

        {/* Right Section: View Bag ➔ */}
        <View style={styles.rightSection}>
          <Text style={styles.viewBagText}>View Bag</Text>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrowIcon}>➔</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 58,
    zIndex: 999,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 32,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  capsule: {
    flex: 1,
    borderRadius: 29, // 58px / 2 = 29px capsule
    backgroundColor: 'rgba(42, 19, 77, 0.95)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  itemCountText: {
    color: '#FAA307',
    fontSize: 11,
    fontWeight: '800',
  },
  totalPriceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  bulletDot: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  lightningIcon: {
    color: '#FF5E00',
    fontSize: 11,
  },
  etaText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewBagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF5E00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 1,
  },
});

export default BottomCartPill;
