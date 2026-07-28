/**
 * frontend/src/core/theme/elevation.ts
 */

export const elevation = {
  card: {
    shadowColor: '#0E2229',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export type Elevation = typeof elevation;
