/**
 * frontend/src/core/theme/index.ts
 * Enterprise Universal Theme System
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { sizes } from './sizes';
import { elevation } from './elevation';
import { gradients } from './gradients';
import { animations } from './animations';

export { colors, typography, spacing, radius, sizes, elevation, gradients, animations };

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  sizes,
  shadow: elevation,
  elevation,
  gradients,
  animations,
} as const;

export type Theme = typeof theme;
export default theme;
