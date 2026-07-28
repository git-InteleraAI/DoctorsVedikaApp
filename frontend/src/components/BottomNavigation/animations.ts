/**
 * frontend/src/components/BottomNavigation/animations.ts
 * Animation helper & spring config hooks for 60 FPS fluid motion
 */
import {
  withSpring,
  withTiming,
  withSequence,
  Easing,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { NAV_DESIGN_TOKENS } from './constants';

export const SPRING_CONFIG = {
  damping: 16,
  stiffness: 170,
  mass: 0.65,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

export const BOUNCE_SPRING_CONFIG = {
  damping: 12,
  stiffness: 220,
  mass: 0.5,
};

export function useTabItemAnimation(isActive: boolean) {
  const scale = useSharedValue(isActive ? 1 : 0.9);
  const opacity = useSharedValue(isActive ? 1 : 0.6);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isActive ? 1.08 : 0.92, SPRING_CONFIG),
        },
      ],
      opacity: withTiming(isActive ? 1 : 0.65, { duration: 250 }),
    };
  }, [isActive]);

  return animatedStyle;
}
