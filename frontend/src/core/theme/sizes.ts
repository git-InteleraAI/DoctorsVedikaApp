/**
 * frontend/src/core/theme/sizes.ts
 */

export const sizes = {
  headerHeight: 56,
  bottomTabHeight: 64,
  avatarSm: 32,
  avatarMd: 48,
  avatarLg: 80,
  buttonHeight: 48,
  inputHeight: 48,
} as const;

export type Sizes = typeof sizes;
