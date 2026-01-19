import BottomSheet from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback } from 'react';
import { Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';
import { NativeBottomSheet } from './NativeBottomSheet';

export interface ActionSheetOption {
  /**
   * Option label
   */
  label: string;

  /**
   * Icon name from Material Icons
   */
  icon?: string;

  /**
   * Action to perform when option is selected
   */
  onPress: () => void;

  /**
   * Option style - 'default', 'destructive', or 'cancel'
   */
  variant?: 'default' | 'destructive' | 'cancel';

  /**
   * Disable the option
   */
  disabled?: boolean;
}

interface ActionSheetProps {
  /**
   * Title shown at the top
   */
  title?: string;

  /**
   * Optional message/description
   */
  message?: string;

  /**
   * List of action options
   */
  options: ActionSheetOption[];

  /**
   * Callback when sheet is closed
   */
  onClose?: () => void;
}

/**
 * Native action sheet component following iOS UIActionSheet and Android Bottom Sheet guidelines
 *
 * Features:
 * - iOS-style action list
 * - Material Design for Android
 * - Destructive action styling
 * - Cancel option (bottom on iOS, integrated on Android)
 * - Icon support
 *
 * @example
 * ```tsx
 * const actionSheetRef = useRef<BottomSheet>(null);
 *
 * <ActionSheet
 *   ref={actionSheetRef}
 *   title="Seleziona un'azione"
 *   options={[
 *     { label: 'Modifica', icon: 'edit', onPress: () => {} },
 *     { label: 'Elimina', icon: 'delete', variant: 'destructive', onPress: () => {} },
 *     { label: 'Annulla', variant: 'cancel', onPress: () => {} },
 *   ]}
 * />
 * ```
 */
export const ActionSheet = forwardRef<BottomSheet, ActionSheetProps>(
  ({ title, message, options, onClose }, ref) => {
    const { isDark, colors } = useTheme();

    // Separate cancel option (iOS pattern)
    const cancelOption = options.find(opt => opt.variant === 'cancel');
    const actionOptions = options.filter(opt => opt.variant !== 'cancel');

    const handleOptionPress = useCallback(
      (option: ActionSheetOption) => {
        option.onPress();
        // Close sheet after action
        if (ref && typeof ref !== 'function' && ref.current) {
          ref.current.close();
        }
      },
      [ref]
    );

    const renderOption = (option: ActionSheetOption, index: number) => {
      const isDestructive = option.variant === 'destructive';
      const isDisabled = option.disabled;

      const textColor = isDestructive
        ? Colors.error
        : isDisabled
          ? isDark
            ? Colors.stone[600]
            : Colors.stone[400]
          : isDark
            ? Colors.white
            : Colors.text.light;

      return (
        <Pressable
          key={`${option.label}-${index}`}
          onPress={() => !isDisabled && handleOptionPress(option)}
          disabled={isDisabled}
          style={({ pressed }) => [
            styles.option,
            {
              backgroundColor: pressed
                ? isDark
                  ? Colors.stone[800]
                  : Colors.stone[50]
                : 'transparent',
              opacity: isDisabled ? 0.5 : 1,
            },
          ]}
        >
          {option.icon && (
            <View style={styles.iconContainer}>
              <Icon name={option.icon} size={22} color={textColor} />
            </View>
          )}
          <Text style={[styles.optionLabel, { color: textColor }]}>
            {option.label}
          </Text>
        </Pressable>
      );
    };

    return (
      <NativeBottomSheet
        ref={ref}
        title={title}
        subtitle={message}
        showCloseButton={false}
        onClose={onClose}
        snapPoints={['CONTENT_HEIGHT']}
        enableDynamicSizing
        enablePanDownToClose
      >
        <View style={styles.optionsContainer}>
          {/* Action options */}
          {actionOptions.map((option, index) => renderOption(option, index))}

          {/* Separator before cancel (iOS pattern) */}
          {cancelOption && process.env.EXPO_OS === 'ios' && (
            <View
              style={[
                styles.separator,
                {
                  backgroundColor: isDark ? Colors.stone[700] : Colors.stone[200],
                  marginVertical: Spacing[2],
                },
              ]}
            />
          )}

          {/* Cancel option */}
          {cancelOption && renderOption(cancelOption, actionOptions.length)}
        </View>
      </NativeBottomSheet>
    );
  }
);

ActionSheet.displayName = 'ActionSheet';

const styles = {
  optionsContainer: {
    gap: Spacing[1],
  } as ViewStyle,
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.lg,
    minHeight: 56,
  } as ViewStyle,
  iconContainer: {
    width: 28,
    marginRight: Spacing[3],
    alignItems: 'center',
  } as ViewStyle,
  optionLabel: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    flex: 1,
  } as TextStyle,
  separator: {
    height: 1,
    width: '100%',
  } as ViewStyle,
};
