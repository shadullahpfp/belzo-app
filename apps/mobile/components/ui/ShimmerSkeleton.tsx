import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface ShimmerSkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Apple-Grade ShimmerSkeleton
 * Smooth 1.1s linear sweep (#E5E5EA ➔ #F2F2F7 ➔ #E5E5EA) with zero spinning indicators.
 */
export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1100, // 1.1s linear sweep
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 260],
  });

  return (
    <View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['#E5E5EA', '#F2F2F7', '#E5E5EA']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

/**
 * Preset 1: ProductCardSkeleton (Editorial 20px squircle)
 */
export const ProductCardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.cardContainer, style]}>
      {/* 1:1 Aspect Ratio Image */}
      <ShimmerSkeleton width="100%" height={130} borderRadius={16} />
      <View style={styles.cardSpacingTop}>
        <ShimmerSkeleton width="40%" height={12} borderRadius={4} />
      </View>
      <View style={styles.cardSpacingSmall}>
        <ShimmerSkeleton width="90%" height={16} borderRadius={4} />
      </View>
      <View style={styles.cardBottomRow}>
        <ShimmerSkeleton width="35%" height={20} borderRadius={6} />
        <ShimmerSkeleton width={72} height={32} borderRadius={16} />
      </View>
    </View>
  );
};

/**
 * Preset 2: CategoryCircleSkeleton (64px Avatar)
 */
export const CategoryCircleSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.categoryContainer, style]}>
      <ShimmerSkeleton width={64} height={64} borderRadius={32} />
      <View style={styles.categorySpacingTop}>
        <ShimmerSkeleton width={52} height={11} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#E5E5EA',
    overflow: 'hidden',
    position: 'relative',
  },
  cardContainer: {
    width: 164,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  cardSpacingTop: {
    marginTop: 10,
  },
  cardSpacingSmall: {
    marginTop: 6,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  categoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
  },
  categorySpacingTop: {
    marginTop: 8,
  },
});

export default ShimmerSkeleton;
