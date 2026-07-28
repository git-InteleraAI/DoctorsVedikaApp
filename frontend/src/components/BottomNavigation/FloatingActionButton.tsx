/**
 * frontend/src/components/BottomNavigation/FloatingActionButton.tsx
 * Floating circular active button with Shrink & Pop Scale-Out transition animation
 */
import React from 'react';
import { Pressable } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { styles } from './styles';
import { NAV_DESIGN_TOKENS, NavTabItem } from './constants';
import { SPRING_CONFIG } from './animations';

interface FloatingActionButtonProps {
  targetLeft: number;
  scale?: SharedValue<number>;
  activeTab: NavTabItem;
  renderIcon: (color: string, size: number) => React.ReactNode;
  onPress?: () => void;
}

export function FloatingActionButton({
  targetLeft,
  scale,
  activeTab,
  renderIcon,
  onPress,
}: FloatingActionButtonProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: withSpring(targetLeft, SPRING_CONFIG),
      transform: [{ scale: scale ? scale.value : 1 }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.floatingButton,
        {
          top: -NAV_DESIGN_TOKENS.floatingButtonLift,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.floatingButtonInner,
          { transform: [{ scale: pressed ? 0.92 : 1 }] },
        ]}
      >
        {renderIcon(NAV_DESIGN_TOKENS.activeIcon, NAV_DESIGN_TOKENS.activeIconSize)}
      </Pressable>
    </Animated.View>
  );
}

