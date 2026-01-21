import { useColorScheme } from 'react-native';
import { Colors, Shadows } from '../constants/theme';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  white: string;
  black: string;
  transparent: string;
  // Semantic colors
  success: string;
  error: string;
  warning: string;
}

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  shadows: typeof Shadows;
  // Dynamic Theme Support
  currentTheme: string;
  setTheme: (theme: string) => void;
  availableThemes: string[];
}

import { create } from 'zustand';

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'default',
  setTheme: (theme) => set({ theme }),
}));

/**
 * Hook providing theme-aware colors and shadows
 * Replaces NativeWind's dark: class-based approach
 */
export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors: ThemeColors = {
    primary: Colors.primary.DEFAULT,
    primaryDark: Colors.primary.dark,
    secondary: Colors.secondary.DEFAULT,
    background: isDark ? Colors.background.dark : Colors.background.light,
    surface: isDark ? Colors.surface.dark : Colors.surface.light,
    text: isDark ? Colors.text.dark : Colors.text.light,
    textSecondary: isDark ? Colors.stone[400] : Colors.stone[500],
    textMuted: isDark ? Colors.stone[500] : Colors.stone[400],
    border: isDark ? Colors.stone[700] : Colors.stone[200],
    borderLight: isDark ? Colors.stone[800] : Colors.stone[100],
    white: Colors.white,
    black: Colors.black,
    transparent: Colors.transparent,
    // Semantic colors
    success: Colors.success,
    error: Colors.error,
    warning: Colors.warning,
  };

  // Override primary/secondary based on theme
  // This is a simple implementation. In a real app, you'd map these to the theme string.
  // For MVP, if theme === 'pink', we stick to default pink. 
  // If theme === 'ocean', we might swap primary color.
  const { theme, setTheme } = useThemeStore();

  return {
    isDark,
    colors,
    shadows: Shadows,
    currentTheme: theme,
    setTheme,
    availableThemes: ['default', 'pink', 'ocean', 'midnight'],
  };
}

/**
 * Helper to create conditional styles based on dark mode
 */
export function createThemedStyles<T extends Record<string, any>>(
  lightStyles: T,
  darkStyles: Partial<T>
): (isDark: boolean) => T {
  return (isDark: boolean) => ({
    ...lightStyles,
    ...(isDark ? darkStyles : {}),
  });
}
