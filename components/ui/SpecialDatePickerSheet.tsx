import BottomSheet from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { forwardRef, useState } from 'react';
import { Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';
import { NativeBottomSheet } from './NativeBottomSheet';

interface SpecialDatePickerSheetProps {
  /**
   * Initial date
   */
  initialDate?: Date;

  /**
   * Callback when date is selected
   */
  onDateSelected: (date: Date) => void;

  /**
   * Callback when date is removed (cleared)
   */
  onRemoveDate?: () => void;

  /**
   * Callback when sheet is closed
   */
  onClose?: () => void;
}

/**
 * Minimal date picker bottom sheet with iOS wheel picker style
 */
export const SpecialDatePickerSheet = forwardRef<BottomSheet, SpecialDatePickerSheetProps>(
  ({ initialDate, onDateSelected, onRemoveDate, onClose }, ref) => {
    const { isDark } = useTheme();
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());

    const handleDateChange = (event: any, date?: Date) => {
      if (date) {
        setSelectedDate(date);
      }
    };

    const handleClose = () => {
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.close();
      }
      onClose?.();
    };

    const handleConfirm = () => {
      onDateSelected(selectedDate);
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.close();
      }
    };

    const handleRemove = () => {
      onRemoveDate?.();
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.close();
      }
    };

    return (
      <NativeBottomSheet
        ref={ref}
        snapPoints={['55%']}
        enablePanDownToClose
        showCloseButton={false}
      >
        {/* Custom Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.headerButton}>
            <Icon name="close" size={24} color={isDark ? Colors.white : Colors.stone[600]} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: isDark ? Colors.white : Colors.text.light }]}>
              Seleziona Data
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? Colors.stone[400] : Colors.stone[500] }]}>
              Puoi cambiarlo in seguito
            </Text>
          </View>

          <Pressable onPress={handleConfirm} style={styles.headerButton}>
            <Icon name="check" size={24} color="#C0847C" />
          </Pressable>
        </View>

        {/* Date Picker */}
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            minimumDate={new Date()}
            textColor={isDark ? Colors.white : Colors.text.light}
            style={styles.picker}
          />
        </View>

        {/* Remove date button - only shows when date is already set */}
        {onRemoveDate && (
          <Pressable
            onPress={handleRemove}
            style={({ pressed }) => [
              styles.removeButton,
              {
                backgroundColor: isDark ? Colors.stone[800] : Colors.stone[100],
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Icon name="delete" size={18} color={Colors.error} />
            <Text style={[styles.removeButtonText, { color: Colors.error }]}>
              Rimuovi data
            </Text>
          </Pressable>
        )}
      </NativeBottomSheet>
    );
  }
);

SpecialDatePickerSheet.displayName = 'SpecialDatePickerSheet';

const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4], // ensuring top padding
    paddingBottom: Spacing[2],
  } as ViewStyle,
  headerButton: {
    width: 40, // Slightly smaller
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(120, 120, 128, 0.08)', // More subtle
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  headerCenter: {
    position: 'absolute', // Absolute centering ensures it's dead center regardless of button widths
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none', // pass through touches
    zIndex: -1,
  } as ViewStyle,
  title: {
    fontSize: FontSizes.base, // Smaller (16)
    fontWeight: '600',
  } as TextStyle,
  subtitle: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  } as TextStyle,
  pickerContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
  } as ViewStyle,
  picker: {
    width: '100%',
    height: 200,
  } as ViewStyle,
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[3],
    borderRadius: BorderRadius.xl,
    gap: Spacing[2],
    marginTop: Spacing[4],
    marginHorizontal: Spacing[4],
  } as ViewStyle,
  removeButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  } as TextStyle,
};
