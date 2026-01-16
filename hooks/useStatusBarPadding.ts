import { StatusBar } from 'react-native';
import { Spacing } from '../constants/theme';

/**
 * Returns the top padding needed to avoid status bar overlap.
 * Android: StatusBar height + base padding
 * iOS/Web: Base padding only (handled by contentInsetAdjustmentBehavior)
 */
export function useStatusBarPadding(): number {
    if (process.env.EXPO_OS === 'android') {
        return (StatusBar.currentHeight ?? 24) + Spacing[4];
    }
    return Spacing[4];
}
