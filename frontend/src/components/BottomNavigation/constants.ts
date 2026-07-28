/**
 * frontend/src/components/BottomNavigation/constants.ts
 * Design system tokens & geometry constants for Edge-to-Edge Rectangular Navigation Bar
 */

export const NAV_DESIGN_TOKENS = {
  // Colors
  barBackground: '#FFFFFF',
  primaryTeal: '#00A8B5',
  inactiveIcon: '#64748B',
  activeIcon: '#FFFFFF',
  activeLabel: '#00A8B5',
  inactiveLabel: '#64748B',
  
  // Dimensions for Perfect Rectangular Edge-to-Edge Bar
  barBaseHeight: 68,
  floatingButtonSize: 50,
  floatingButtonLift: 10,
  borderRadius: 0,
  horizontalMargin: 0,
  bottomMargin: 0,
  inactiveIconSize: 38,
  activeIconSize: 44,

  // Animation Durations & Springs
  springConfig: {
    damping: 18,
    stiffness: 180,
    mass: 0.7,
  },
} as const;

export type NavTabItem = {
  key: string;
  name: string;
  label: string;
  iconName: string;
  iconType: 'ionicons' | 'feather';
};
