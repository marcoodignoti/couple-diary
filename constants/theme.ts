/**
 * Centralized theme system replacing NativeWind/Tailwind
 * Extracted from tailwind.config.js
 */

export const Colors = {
  primary: {
    DEFAULT: '#E879A1', // Vibrant Rose Pink (user)
    dark: '#D45D89',    // Darker Rose
  },
  secondary: {
    DEFAULT: '#FF8566', // Vibrant Coral (partner)
  },
  background: {
    light: '#FFFFFF', // Pure White
    dark: '#000000',  // Pure Black
  },
  surface: {
    light: '#FFFFFF',
    dark: '#1C1917',
  },
  text: {
    light: '#1C1917', // Nearly Black
    dark: '#FFFFFF',  // Pure White
  },
  espresso: '#3E2723',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  stone: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  // Accent colors for UI states
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
};

export const Spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 4,
  DEFAULT: 16, // 1rem
  md: 12,
  lg: 16,
  xl: 24,      // 1.5rem
  '2xl': 32,   // 2rem - Standard for Cards
  '3xl': 40,   // 2.5rem
  full: 9999,
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,  // Added for big headers
  '7xl': 72,  // Added for hero text
} as const;

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LineHeights = {
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// CSS boxShadow strings for React Native New Architecture
export const Shadows = {
  none: 'none',
  sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  DEFAULT: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
  lg: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
  xl: '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
  soft: '0px 10px 40px -10px rgba(192, 132, 124, 0.15)',
  card: '0px 4px 12px rgba(192, 132, 124, 0.1)',
  innerSoft: 'inset 0px 2px 4px rgba(0, 0, 0, 0.02)',
} as const;
