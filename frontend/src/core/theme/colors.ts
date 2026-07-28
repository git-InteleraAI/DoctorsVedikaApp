/**
 * frontend/src/core/theme/colors.ts
 */

export const colors = {
  primary: '#00A8B5',
  primaryLight: '#26C6DA',
  secondary: '#0F224A',
  accent: '#00A8B5',
  accentSoft: '#E0F7FA',
  background: '#FFFFFF',
  surface: '#F5F8F8',
  card: '#FFFFFF',
  border: '#E3E9EA',
  textPrimary: '#0E2229',
  textSecondary: '#6B7C80',
  textInverse: '#FFFFFF',
  success: '#1FA35C',
  warning: '#D9A441',
  danger: '#D64545',
  disabled: '#C9D3D4',
} as const;

export type Colors = typeof colors;
