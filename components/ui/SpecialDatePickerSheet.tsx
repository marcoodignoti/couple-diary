import BottomSheet from '@gorhom/bottom-sheet';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Platform, Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
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

  /**
   * Allow selecting dates in the past (for anniversaries)
   */
  allowPastDates?: boolean;
}

// Custom ref interface matching BottomSheet methods we actually use
interface DatePickerSheetRef {
  expand: () => void;
  close: () => void;
}

/**
 * Date picker that uses:
 * - iOS: Bottom sheet with inline spinner picker
 * - Android: Imperative API (native dialog) - cleaner, no layout jumps
 */
export const SpecialDatePickerSheet = forwardRef<DatePickerSheetRef, SpecialDatePickerSheetProps>(
  ({ initialDate, onDateSelected, onRemoveDate, onClose, allowPastDates = false }, ref) => {
    const { isDark } = useTheme();
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
    const bottomSheetRef = useRef<BottomSheet>(null);

    // Android: Imperative date picker callback handler
    const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
      if (event.type === 'set' && date) {
        setSelectedDate(date);
        onDateSelected(date);
      }
      // 'dismissed' type means user cancelled - no action needed
    };

    // Android: Open native date picker dialog
    const openAndroidPicker = () => {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        ...(allowPastDates ? {} : { minimumDate: new Date() }),
        onChange: handleAndroidChange,
      });
    };

    // Android: Show options when date already selected (change or remove)
    const showAndroidOptions = () => {
      Alert.alert(
        'Data Speciale',
        'Cosa vuoi fare?',
        [
          { text: 'Annulla', style: 'cancel' },
          {
            text: 'Rimuovi Data',
            style: 'destructive',
            onPress: () => onRemoveDate?.(),
          },
          {
            text: 'Cambia Data',
            onPress: openAndroidPicker,
          },
        ]
      );
    };

    // Expose expand/close methods via ref
    useImperativeHandle(ref, () => ({
      expand: () => {
        if (Platform.OS === 'android') {
          // Android: If date already set and can be removed, show options
          if (onRemoveDate) {
            showAndroidOptions();
          } else {
            // First time selecting - just open picker
            openAndroidPicker();
          }
        } else {
          // iOS: Open bottom sheet with spinner
          bottomSheetRef.current?.expand();
        }
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
    }));

    // iOS: Component date change handler
    const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
      if (date) {
        setSelectedDate(date);
      }
    };

    const handleClose = () => {
      bottomSheetRef.current?.close();
      onClose?.();
    };

    const handleConfirm = () => {
      onDateSelected(selectedDate);
      bottomSheetRef.current?.close();
    };

    const handleRemove = () => {
      onRemoveDate?.();
      bottomSheetRef.current?.close();
    };

    // Android: No UI needed - picker opens imperatively via ref.expand()
    if (Platform.OS === 'android') {
      return null;
    }

    // iOS: Bottom sheet with inline spinner
    return (
      <NativeBottomSheet
        ref={bottomSheetRef}
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

        {/* Date Picker - iOS only, spinner display */}
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            {...(allowPastDates ? {} : { minimumDate: new Date() })}
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
    paddingTop: Spacing[4],
    paddingBottom: Spacing[2],
  } as ViewStyle,
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(120, 120, 128, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: -1,
  } as ViewStyle,
  title: {
    fontSize: FontSizes.base,
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
