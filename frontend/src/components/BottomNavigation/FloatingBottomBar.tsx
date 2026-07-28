/**
 * frontend/src/components/BottomNavigation/FloatingBottomBar.tsx
 * Edge-to-Edge Navigation Bar with Shrink & Pop Scale-Out Circular Ball Transition
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, LayoutChangeEvent, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingActionButton } from './FloatingActionButton';
import { NavigationItem } from './NavigationItem';
import { styles } from './styles';
import { NAV_DESIGN_TOKENS, NavTabItem } from './constants';
import { SPRING_CONFIG } from './animations';

export interface FloatingBottomBarProps {
  state: { index: number; routes: { name: string; key: string }[] };
  navigation: { emit: Function; navigate: Function };
  tabs: NavTabItem[];
  renderTabIcon: (name: string, isFocused: boolean, size: number) => React.ReactNode;
}

export function FloatingBottomBar({
  state,
  navigation,
  tabs,
  renderTabIcon,
}: FloatingBottomBarProps) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const [barWidth, setBarWidth] = useState(screenWidth);

  const activeW = barWidth > 0 ? barWidth : screenWidth;
  const activeTabWidth = activeW / tabs.length;

  const animIndex = useSharedValue(state.index);
  const animScale = useSharedValue(1);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setBarWidth(w);
  }, []);

  useEffect(() => {
    animScale.value = withSequence(
      withTiming(0, { duration: 130 }),
      withTiming(0, { duration: 0 }, () => {
        animIndex.value = state.index;
      }),
      withSpring(1, SPRING_CONFIG)
    );
  }, [state.index, animIndex, animScale]);

  const targetLeft =
    activeTabWidth * state.index +
    activeTabWidth / 2 -
    NAV_DESIGN_TOKENS.floatingButtonSize / 2;

  const safeBottom = Math.max(insets.bottom, 0);
  const totalBarHeight = NAV_DESIGN_TOKENS.barBaseHeight + safeBottom;

  return (
    <View style={styles.outerWrapper} pointerEvents="box-none">
      <View
        style={[
          styles.container,
          {
            height: totalBarHeight,
            paddingBottom: safeBottom,
          },
        ]}
        onLayout={onLayout}
        pointerEvents="box-none"
      >
        <View style={styles.tabRow}>
          {tabs.map((tab, idx) => {
            const isActive = state.index === idx;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: state.routes[idx]?.key || tab.key,
                canPreventDefault: true,
              });

              if (!isActive && !event.defaultPrevented) {
                navigation.navigate(tab.name);
              }
            };

            return (
              <NavigationItem
                key={tab.name}
                item={tab}
                isActive={isActive}
                onPress={onPress}
                renderIcon={(color, size) => renderTabIcon(tab.name, false, size)}
              />
            );
          })}
        </View>

        <FloatingActionButton
          targetLeft={targetLeft}
          scale={animScale}
          activeTab={tabs[state.index]}
          renderIcon={(color, size) =>
            renderTabIcon(tabs[state.index].name, true, size)
          }
          onPress={() => {
            const activeRoute = state.routes[state.index];
            if (activeRoute) {
              navigation.navigate(activeRoute.name);
            }
          }}
        />
      </View>
    </View>
  );
}

