import React, { forwardRef, useState } from 'react';
import { Platform, Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomSheet from '@gorhom/bottom-sheet';
import { Colors, BorderRadius, FontSizes, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { NativeBottomSheet } from './NativeBottomSheet';
import { Icon } from './Icon';

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
   * Callback when sheet is closed
   */
  onClose?: () => void;
}

/**
 * Native date picker bottom sheet for special dates
 *
 * Features:
 * - Native date picker (iOS wheel, Android calendar)
 * - Quick date suggestions (birthday, anniversary, etc.)
 * - Custom date selection
 * - Future dates only
 *
 * @example
 * ```tsx
 * const dateSheetRef = useRef<BottomSheet>(null);
 *
 * <SpecialDatePickerSheet
 *   ref={dateSheetRef}
 *   onDateSelected={(date) => setSpecialDate(date)}
 * />
 * ```
 */
export const SpecialDatePickerSheet = forwardRef<BottomSheet, SpecialDatePickerSheetProps>(
  ({ initialDate, onDateSelected, onClose }, ref) => {
    const { isDark } = useTheme();
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
    const [showPicker, setShowPicker] = useState(false);

    // Quick date suggestions
    const getQuickDates = () => {
      const today = new Date();
      const suggestions = [];

      // Tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      suggestions.push({ label: 'Domani', date: tomorrow, icon: 'today' });

      // This weekend (next Saturday)
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + daysUntilSaturday);
      suggestions.push({ label: 'Questo Weekend', date: saturday, icon: 'weekend' });

      // Next week
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      suggestions.push({ label: 'Prossima Settimana', date: nextWeek, icon: 'event' });

      // Next month
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      suggestions.push({ label: 'Prossimo Mese', date: nextMonth, icon: 'calendar-month' });

      return suggestions;
    };

    const quickDates = getQuickDates();

    const handleQuickDatePress = (date: Date) => {
      setSelectedDate(date);
      onDateSelected(date);
      // Close sheet
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.close();
      }
    };

    const handleCustomDatePress = () => {
      setShowPicker(true);
    };

    const handleDateChange = (event: any, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }

      if (date) {
        setSelectedDate(date);
        if (Platform.OS === 'android') {
          onDateSelected(date);
          // Close sheet on Android
          if (ref && typeof ref !== 'function' && ref.current) {
            ref.current.close();
          }
        }
      }
    };

    const handleConfirm = () => {
      onDateSelected(selectedDate);
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.close();
      }
    };

    return (
      <NativeBottomSheet
        ref={ref}
        title="Data Speciale"
        subtitle="Quando dovrebbe sbloccarsi questa voce?"
        onClose={onClose}
        snapPoints={['70%']}
        enablePanDownToClose
      >
        {/* Quick date suggestions */}
        <View style={styles.quickDatesContainer}>
          <Text
            style={[
              styles.sectionLabel,
              { color: isDark ? Colors.stone[300] : Colors.text.light },
            ]}
          >
            Suggerimenti rapidi
          </Text>
          <View style={styles.quickDatesGrid}>
            {quickDates.map((suggestion, index) => (
              <Pressable
                key={index}
                onPress={() => handleQuickDatePress(suggestion.date)}
                style={({ pressed }) => [
                  styles.quickDateCard,
                  {
                    backgroundColor: isDark ? Colors.stone[800] : Colors.white,
                    borderColor: isDark ? Colors.stone[700] : Colors.stone[200],
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Icon
                  name={suggestion.icon}
                  size={24}
                  color={Colors.primary.DEFAULT}
                />
                <Text
                  style={[
                    styles.quickDateLabel,
                    { color: isDark ? Colors.white : Colors.text.light },
                  ]}
                >
                  {suggestion.label}
                </Text>
                <Text
                  style={[
                    styles.quickDateValue,
                    { color: isDark ? Colors.stone[400] : Colors.stone[500] },
                  ]}
                >
                  {suggestion.date.toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Custom date picker */}
        <View style={styles.customDateContainer}>
          <Text
            style={[
              styles.sectionLabel,
              { color: isDark ? Colors.stone[300] : Colors.text.light },
            ]}
          >
            O scegli una data personalizzata
          </Text>

          <Pressable
            onPress={handleCustomDatePress}
            style={({ pressed }) => [
              styles.customDateButton,
              {
                backgroundColor: isDark ? Colors.stone[800] : Colors.white,
                borderColor: isDark ? Colors.stone[700] : Colors.stone[200],
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Icon name="calendar-today" size={20} color={Colors.primary.DEFAULT} />
            <Text
              style={[
                styles.customDateText,
                { color: isDark ? Colors.white : Colors.text.light },
              ]}
            >
              {selectedDate.toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </Pressable>

          {/* iOS inline picker */}
          {showPicker && Platform.OS === 'ios' && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                textColor={isDark ? Colors.white : Colors.text.light}
              />
              <Pressable
                onPress={handleConfirm}
                style={[
                  styles.confirmButton,
                  { backgroundColor: Colors.primary.DEFAULT },
                ]}
              >
                <Text style={styles.confirmButtonText}>Conferma</Text>
              </Pressable>
            </View>
          )}

          {/* Android picker (modal) */}
          {showPicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
      </NativeBottomSheet>
    );
  }
);

SpecialDatePickerSheet.displayName = 'SpecialDatePickerSheet';

const styles = {
  quickDatesContainer: {
    marginBottom: Spacing[6],
  } as ViewStyle,
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing[3],
  } as TextStyle,
  quickDatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  } as ViewStyle,
  quickDateCard: {
    width: '47%',
    padding: Spacing[4],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    alignItems: 'center',
    gap: Spacing[2],
  } as ViewStyle,
  quickDateLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  quickDateValue: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  } as TextStyle,
  customDateContainer: {
    marginTop: Spacing[4],
  } as ViewStyle,
  customDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    gap: Spacing[3],
  } as ViewStyle,
  customDateText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    flex: 1,
  } as TextStyle,
  pickerContainer: {
    marginTop: Spacing[4],
  } as ViewStyle,
  confirmButton: {
    padding: Spacing[4],
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginTop: Spacing[4],
  } as ViewStyle,
  confirmButtonText: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontWeight: '700',
  } as TextStyle,
};
