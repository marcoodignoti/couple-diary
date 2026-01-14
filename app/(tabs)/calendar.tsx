import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuthStore } from '../../stores/authStore';
import { useEntryStore } from '../../stores/entryStore';
import { CALENDAR_COLORS } from '../../utils/constants';
import { toISODateString } from '../../utils/dates';

interface MarkedDates {
    [date: string]: {
        selected?: boolean;
        selectedColor?: string;
        marked?: boolean;
        dotColor?: string;
    };
}

export default function CalendarScreen() {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const { user, partner } = useAuthStore();
    const { entries, partnerEntries, fetchMyEntries, fetchPartnerEntries } = useEntryStore();

    useEffect(() => {
        if (user?.id) {
            fetchMyEntries(user.id);
        }
        if (partner?.id) {
            fetchPartnerEntries(partner.id);
        }
    }, [user?.id, partner?.id]);

    // Build marked dates map
    const markedDates = useMemo(() => {
        const dates: MarkedDates = {};

        // Create sets of dates each person wrote
        const userDates = new Set(
            entries.map(e => toISODateString(new Date(e.created_at)))
        );
        const partnerDates = new Set(
            partnerEntries.map(e => toISODateString(new Date(e.created_at)))
        );

        // Combine all dates
        const allDates = new Set([...userDates, ...partnerDates]);

        allDates.forEach(date => {
            const userWrote = userDates.has(date);
            const partnerWrote = partnerDates.has(date);

            let color = CALENDAR_COLORS.none;
            if (userWrote && partnerWrote) {
                color = CALENDAR_COLORS.both; // Gold - both wrote!
            } else if (userWrote || partnerWrote) {
                color = CALENDAR_COLORS.single; // Blue - one wrote
            }

            dates[date] = {
                selected: true,
                selectedColor: color,
            };
        });

        // Highlight selected date
        if (selectedDate) {
            dates[selectedDate] = {
                ...dates[selectedDate],
                selected: true,
                selectedColor: dates[selectedDate]?.selectedColor || '#E8B4B8',
            };
        }

        return dates;
    }, [entries, partnerEntries, selectedDate]);

    // Get entries for selected date
    const selectedDateEntries = useMemo(() => {
        if (!selectedDate) return { user: null, partner: null };

        const userEntry = entries.find(e =>
            toISODateString(new Date(e.created_at)) === selectedDate
        );
        const partnerEntry = partnerEntries.find(e =>
            toISODateString(new Date(e.created_at)) === selectedDate
        );

        return { user: userEntry, partner: partnerEntry };
    }, [selectedDate, entries, partnerEntries]);

    // Count streaks (days both wrote)
    const streakCount = useMemo(() => {
        const userDates = new Set(
            entries.map(e => toISODateString(new Date(e.created_at)))
        );
        const partnerDates = new Set(
            partnerEntries.map(e => toISODateString(new Date(e.created_at)))
        );

        let count = 0;
        userDates.forEach(date => {
            if (partnerDates.has(date)) count++;
        });

        return count;
    }, [entries, partnerEntries]);

    const handleDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Stats */}
            <View style={styles.statsRow}>
                <GlassCard style={styles.statCard}>
                    <Text style={styles.statNumber}>{entries.length}</Text>
                    <Text style={styles.statLabel}>I tuoi pensieri</Text>
                </GlassCard>
                <GlassCard style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: CALENDAR_COLORS.both }]}>
                        {streakCount}
                    </Text>
                    <Text style={styles.statLabel}>Giorni insieme ✨</Text>
                </GlassCard>
                <GlassCard style={styles.statCard}>
                    <Text style={styles.statNumber}>{partnerEntries.length}</Text>
                    <Text style={styles.statLabel}>Dal partner</Text>
                </GlassCard>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CALENDAR_COLORS.single }]} />
                    <Text style={styles.legendText}>Uno di voi</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CALENDAR_COLORS.both }]} />
                    <Text style={styles.legendText}>Entrambi ✨</Text>
                </View>
            </View>

            {/* Calendar */}
            <View style={styles.calendarContainer}>
                <Calendar
                    markedDates={markedDates}
                    onDayPress={handleDayPress}
                    theme={{
                        backgroundColor: 'transparent',
                        calendarBackground: 'transparent',
                        textSectionTitleColor: '#7F8C8D',
                        selectedDayBackgroundColor: '#E8B4B8',
                        selectedDayTextColor: '#FFF',
                        todayTextColor: '#E8B4B8',
                        dayTextColor: '#2C3E50',
                        textDisabledColor: '#D1D5DB',
                        arrowColor: '#E8B4B8',
                        monthTextColor: '#2C3E50',
                        textMonthFontWeight: '600',
                        textDayFontSize: 16,
                        textMonthFontSize: 18,
                    }}
                />
            </View>

            {/* Selected date info */}
            {selectedDate && (
                <GlassCard>
                    <Text style={styles.selectedDateTitle}>
                        📅 {new Date(selectedDate).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </Text>

                    <View style={styles.dayEntries}>
                        <View style={styles.dayEntry}>
                            <Text style={styles.dayEntryIcon}>
                                {selectedDateEntries.user ? '✅' : '❌'}
                            </Text>
                            <Text style={styles.dayEntryText}>
                                Tu {selectedDateEntries.user ? 'hai scritto' : 'non hai scritto'}
                            </Text>
                        </View>

                        {partner && (
                            <View style={styles.dayEntry}>
                                <Text style={styles.dayEntryIcon}>
                                    {selectedDateEntries.partner ? '✅' : '❌'}
                                </Text>
                                <Text style={styles.dayEntryText}>
                                    {partner.name} {selectedDateEntries.partner ? 'ha scritto' : 'non ha scritto'}
                                </Text>
                            </View>
                        )}
                    </View>
                </GlassCard>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6',
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#E8B4B8',
    },
    statLabel: {
        fontSize: 10,
        color: '#7F8C8D',
        marginTop: 4,
        textAlign: 'center',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#7F8C8D',
    },
    calendarContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
    },
    selectedDateTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 12,
        textTransform: 'capitalize',
    },
    dayEntries: {
        gap: 8,
    },
    dayEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dayEntryIcon: {
        fontSize: 18,
    },
    dayEntryText: {
        fontSize: 14,
        color: '#2C3E50',
    },
});
