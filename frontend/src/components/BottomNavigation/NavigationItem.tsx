/**
 * frontend/src/components/BottomNavigation/NavigationItem.tsx
 * Individual Tab Pressable component with animated scale & label opacity
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from './styles';
import { NAV_DESIGN_TOKENS, NavTabItem } from './constants';

interface NavigationItemProps {
  item: NavTabItem;
  isActive: boolean;
  onPress: () => void;
  renderIcon: (color: string, size: number) => React.ReactNode;
}

export function NavigationItem({
  item,
  isActive,
  onPress,
  renderIcon,
}: NavigationItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      android_ripple={{ color: 'transparent' }}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.tabItemContainer,
            { transform: [{ scale: pressed ? 0.92 : 1 }] },
          ]}
        >
          {/* Top Slot: Render Icon when tab is inactive */}
          <View style={styles.iconSlot}>
            {!isActive && renderIcon(NAV_DESIGN_TOKENS.inactiveIcon, NAV_DESIGN_TOKENS.inactiveIconSize)}
          </View>

          {/* Bottom Slot: Label Text */}
          <Text
            style={[
              styles.label,
              isActive ? styles.labelActive : styles.labelInactive,
            ]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
