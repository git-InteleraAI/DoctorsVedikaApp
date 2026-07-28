/**
 * frontend/src/core/theme/radius.ts
 */

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export type Radius = typeof radius;
