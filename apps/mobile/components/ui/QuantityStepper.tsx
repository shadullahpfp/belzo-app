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

export interface QuantityStepperProps {
  quantity: number;
  stock: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}

/**
 * App Store "GET"-Style Quantity Stepper
 * Idle: 72px pill with rgba(116,116,128,0.10) fill and bold orange #FF5E00 "ADD"
 * Active: Springs to 88px solid #FF5E00 with white counters and haptics
 */
export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  stock,
  onIncrement,
  onDecrement,
  disabled = false,
}) => {
  const isOutOfStock = stock <= 0;
  const isMaxStock = quantity >= stock;
  const inCart = quantity > 0;

  // Animated width: 72px when idle, 88px when active
  const widthAnim = useRef(new Animated.Value(inCart ? 88 : 72)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: inCart ? 88 : 72,
      damping: 18,
      stiffness: 180,
      useNativeDriver: false,
    }).start();
  }, [inCart]);

  const triggerBounce = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 70,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 220,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleIncrement = async () => {
    if (isMaxStock || disabled) return;
    triggerBounce();
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onIncrement();
  };

  const handleDecrement = async () => {
    if (disabled) return;
    triggerBounce();
    try {
      if (quantity === 1) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}
    onDecrement();
  };

  if (isOutOfStock) {
    return (
      <View style={styles.outOfStockBadge}>
        <Text style={styles.outOfStockText}>SOLD OUT</Text>
      </View>
    );
  }

  // State 1: App Store "GET" style idle button
  if (!inCart) {
    return (
      <Animated.View style={{ width: widthAnim }}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleIncrement}
            disabled={disabled}
            style={styles.getButton}
          >
            <Text style={styles.getButtonText}>ADD</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  }

  // State 2: Active Stepper Capsule
  return (
    <Animated.View style={{ width: widthAnim }}>
      <Animated.View
        style={[
          styles.activeContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDecrement}
          disabled={disabled}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          style={styles.stepAction}
        >
          <Text style={styles.stepActionText}>—</Text>
        </TouchableOpacity>

        <View style={styles.quantityWrapper}>
          <Text style={styles.quantityText}>{quantity}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleIncrement}
          disabled={isMaxStock || disabled}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          style={[styles.stepAction, isMaxStock && styles.disabledPlus]}
        >
          <Text style={[styles.stepActionText, isMaxStock && styles.disabledPlusText]}>
            +
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  getButton: {
    height: 32,
    backgroundColor: 'rgba(116, 116, 128, 0.10)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getButtonText: {
    color: '#FF5E00',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  activeContainer: {
    height: 32,
    backgroundColor: '#FF5E00',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#FF5E00',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  stepAction: {
    width: 22,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledPlus: {
    opacity: 0.35,
  },
  disabledPlusText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  quantityWrapper: {
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  outOfStockBadge: {
    height: 30,
    paddingHorizontal: 8,
    backgroundColor: '#FFEBEA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: '#FF3B30',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default QuantityStepper;
