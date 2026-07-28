/**
 * frontend/src/components/BottomNavigation/styles.ts
 * StyleSheet definitions for Perfect Rectangular Edge-to-Edge Navigation Bar
 */
import { StyleSheet } from 'react-native';
import { NAV_DESIGN_TOKENS } from './constants';

export const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'stretch',
    zIndex: 1000,
  },
  container: {
    position: 'relative',
    width: '100%',
    marginHorizontal: 0,
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    overflow: 'visible',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
  },
  tabRow: {
    flexDirection: 'row',
    height: NAV_DESIGN_TOKENS.barBaseHeight,
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  tabItem: {
    flex: 1,
    height: NAV_DESIGN_TOKENS.barBaseHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  labelInactive: {
    color: NAV_DESIGN_TOKENS.inactiveLabel,
    fontWeight: '500',
  },
  labelActive: {
    color: NAV_DESIGN_TOKENS.activeLabel,
    fontWeight: '700',
  },
  floatingButton: {
    position: 'absolute',
    width: NAV_DESIGN_TOKENS.floatingButtonSize,
    height: NAV_DESIGN_TOKENS.floatingButtonSize,
    borderRadius: NAV_DESIGN_TOKENS.floatingButtonSize / 2,
    backgroundColor: NAV_DESIGN_TOKENS.primaryTeal,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: NAV_DESIGN_TOKENS.primaryTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 16,
  },
  floatingButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: NAV_DESIGN_TOKENS.floatingButtonSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
