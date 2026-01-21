import BottomSheet from '@gorhom/bottom-sheet';
import React, { forwardRef } from 'react';
import { Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import type { Mood } from '../../types';
import { MOODS } from '../../utils/constants';
import { NativeBottomSheet } from './NativeBottomSheet';

interface MoodPickerSheetProps {
  /**
   * Currently selected mood
   */
  selectedMood: Mood | null;

  /**
   * Callback when mood is selected
   */
  onSelect: (mood: Mood | null) => void;

  /**
   * Callback when sheet is closed
   */
  onClose?: () => void;
}

/**
 * Native bottom sheet for mood selection
 *
 * Features:
 * - Grid layout with emoji + label
 * - Visual feedback for selection
 * - Auto-close on selection (optional)
 * - Dark mode support
 * - Native animations
 *
 * @example
 * ```tsx
 * const moodSheetRef = useRef<BottomSheet>(null);
 *
 * // Open sheet
 * moodSheetRef.current?.snapToIndex(0);
 *
 * <MoodPickerSheet
 *   ref={moodSheetRef}
 *   selectedMood={mood}
 *   onSelect={(mood) => {
 *     setMood(mood);
 *     moodSheetRef.current?.close();
 *   }}
 * />
 * ```
 */
export const MoodPickerSheet = forwardRef<BottomSheet, MoodPickerSheetProps>(
  ({ selectedMood, onSelect, onClose }, ref) => {
    const { isDark } = useTheme();

    const handleMoodPress = (moodId: Mood) => {
      // Toggle selection if same mood is pressed
      const newMood = selectedMood === moodId ? null : moodId;
      onSelect(newMood);

      // Optional: auto-close after selection
      // setTimeout(() => {
      //   if (ref && typeof ref !== 'function' && ref.current) {
      //     ref.current.close();
      //   }
      // }, 150);
    };

    return (
      <NativeBottomSheet
        ref={ref}
        title="Come ti senti oggi?"
        subtitle="Seleziona un mood per il tuo diario"
        onClose={onClose}
        snapPoints={['65%']}
        enablePanDownToClose
      >
        <View style={styles.grid}>
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.id;

            return (
              <Pressable
                key={mood.id}
                onPress={() => handleMoodPress(mood.id as Mood)}
                style={({ pressed }) => [
                  styles.moodItem,
                  {
                    backgroundColor: isSelected
                      ? Colors.primary.DEFAULT
                      : isDark
                        ? Colors.stone[800]
                        : Colors.white,
                    borderWidth: 2,
                    borderColor: isSelected
                      ? Colors.primary.DEFAULT
                      : isDark
                        ? Colors.stone[700]
                        : Colors.stone[200],
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={mood.label}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={styles.emoji}>{mood.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    {
                      color: isSelected
                        ? Colors.white
                        : isDark
                          ? Colors.stone[300]
                          : Colors.text.light,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {mood.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Helper text */}
        <View style={styles.helperContainer}>
          <Text
            style={[
              styles.helperText,
              { color: isDark ? Colors.stone[400] : Colors.stone[500] },
            ]}
          >
            {selectedMood
              ? 'Tocca di nuovo per deselezionare'
              : 'Scegli il mood che rispecchia il tuo stato d\'animo'}
          </Text>
        </View>
      </NativeBottomSheet>
    );
  }
);

MoodPickerSheet.displayName = 'MoodPickerSheet';

const styles = {
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    marginBottom: Spacing[6],
  } as ViewStyle,
  moodItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[4],
    borderRadius: BorderRadius.xl,
    borderCurve: 'continuous',
    width: '22%',
    minWidth: 70,
    aspectRatio: 1,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  } as ViewStyle,
  emoji: {
    fontSize: 32,
    marginBottom: Spacing[2],
  } as TextStyle,
  moodLabel: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    letterSpacing: 0.2,
  } as TextStyle,
  helperContainer: {
    alignItems: 'center',
    marginTop: Spacing[2],
  } as ViewStyle,
  helperText: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    fontWeight: '500',
  } as TextStyle,
};
