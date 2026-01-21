import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Icon, IconName } from '../../components/ui/Icon';

import { EmptyState } from '../../components/ui/EmptyState';
import { HeroCard } from '../../components/ui/HeroCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../constants/theme';
import { useMyEntries, usePartnerEntries } from '../../hooks/useEntryQueries';
import { useResponsive } from '../../hooks/useResponsive';
import { useStatusBarPadding } from '../../hooks/useStatusBarPadding';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';

const WEEKDAYS = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
const MONTHS = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

// Mood to icon mapping
const getMoodIcon = (mood: string): IconName => {
    switch (mood) {
        case 'happy': return 'sentiment-satisfied';
        case 'love': return 'favorite';
        case 'calm': return 'spa';
        case 'sad': return 'sentiment-dissatisfied';
        case 'excited': return 'celebration';
        case 'tired': return 'bedtime';
        case 'angry': return 'bolt';
        case 'anxious': return 'help';
        default: return 'auto-awesome';
    }
};

export default function CalendarScreen() {
    const router = useRouter();
    const { user, partner } = useAuthStore();
    const { isDark, colors } = useTheme();
    const { contentMaxWidth, isTablet, horizontalPadding } = useResponsive();
    const statusBarPadding = useStatusBarPadding();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

    // Fetch entries using React Query
    const {
        data: entries = [],
        isLoading: entriesLoading,
        refetch: refetchFn1,
        isRefetching: r1
    } = useMyEntries(user?.id);

    const {
        data: partnerEntries = [],
        refetch: refetchFn2,
        isRefetching: r2
    } = usePartnerEntries(partner?.id);

    const isRefreshing = r1 || r2;

    // Pull-to-refresh handler
    const handleRefresh = useCallback(async () => {
        await Promise.all([
            refetchFn1(),
            partner?.id ? refetchFn2() : Promise.resolve()
        ]);
    }, [refetchFn1, refetchFn2, partner?.id]);

    const { year, month, daysInMonth, firstDayOfWeek, userEntryDates, partnerEntryDates } = useMemo(() => {
        const y = currentDate.getFullYear();
        const m = currentDate.getMonth();
        const days = new Date(y, m + 1, 0).getDate();
        const firstDay = new Date(y, m, 1).getDay();

        const myDates = new Set(entries.map(e => e.created_at.split('T')[0]));
        const theirDates = new Set(partnerEntries.filter(e => e.isUnlocked).map(e => e.created_at.split('T')[0]));

        return {
            year: y,
            month: m,
            daysInMonth: days,
            firstDayOfWeek: firstDay,
            userEntryDates: myDates,
            partnerEntryDates: theirDates
        };
    }, [currentDate, entries, partnerEntries]);

    const selectedDayEntries = useMemo(() => {
        if (selectedDay === null) return [];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

        const myEntriesForDay = entries
            .filter(e => e.created_at.startsWith(dateStr))
            .map(e => ({ ...e, type: 'mine' }));

        const theirEntriesForDay = partnerEntries
            .filter(e => e.created_at.startsWith(dateStr) && e.isUnlocked)
            .map(e => ({ ...e, type: 'theirs' }));

        return [...myEntriesForDay, ...theirEntriesForDay].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [selectedDay, year, month, entries, partnerEntries]);

    const isToday = (day: number) => {
        const today = new Date();
        return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Abbiamo ${entries.length + partnerEntries.length} ricordi insieme su Couple Diary! ❤️`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const getMoodIcon = (mood: string | null): IconName => {
        switch (mood) {
            case 'happy': return 'sentiment-satisfied';
            case 'love': return 'favorite';
            case 'calm': return 'spa';
            case 'sad': return 'sentiment-dissatisfied';
            case 'excited': return 'celebration';
            case 'tired': return 'bedtime';
            default: return 'edit';
        }
    };

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{
                paddingBottom: 120,
                paddingTop: statusBarPadding,
                paddingHorizontal: horizontalPadding,
                alignItems: isTablet ? 'center' : undefined,
            }}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary.DEFAULT} />}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ width: '100%', maxWidth: contentMaxWidth }}>
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: isDark ? Colors.white : Colors.text.light }]}>I Nostri Ricordi</Text>
                        <Text style={[styles.subtitle, { color: Colors.stone[400] }]}>
                            {entries.length + partnerEntries.filter(e => e.isUnlocked).length} momenti condivisi
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleShare}
                        style={[styles.shareBtn, { backgroundColor: isDark ? Colors.surface.dark : Colors.white, boxShadow: Shadows.sm } as ViewStyle]}
                    >
                        <Icon name="share" size={20} color={Colors.primary.DEFAULT} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Calendar Grid */}
                <Animated.View entering={FadeInDown.delay(100).duration(600)} style={[
                    styles.calendarCard,
                    {
                        backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                        borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                        boxShadow: Shadows.md,
                    } as ViewStyle
                ]}>
                    <View style={styles.calendarNav}>
                        <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))} style={styles.navBtn}>
                            <Icon name="chevron-left" size={24} color={Colors.stone[400]} />
                        </TouchableOpacity>
                        <Text style={[styles.monthText, { color: isDark ? Colors.white : Colors.text.light }]}>
                            {MONTHS[month]} {year}
                        </Text>
                        <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))} style={styles.navBtn}>
                            <Icon name="chevron-right" size={24} color={Colors.stone[400]} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekdays}>
                        {WEEKDAYS.map((day, i) => (
                            <Text key={i} style={styles.weekdayText}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.daysGrid}>
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <View key={`empty-${i}`} style={styles.dayCell} />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const today = isToday(day);
                            const selected = selectedDay === day;
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const hasUserEntry = userEntryDates.has(dateStr);
                            const hasPartnerEntry = partnerEntryDates.has(dateStr);

                            return (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => setSelectedDay(day)}
                                    style={styles.dayCell}
                                >
                                    <View style={[
                                        styles.dayNumContainer,
                                        selected && { backgroundColor: Colors.primary.DEFAULT },
                                        !selected && today && { backgroundColor: `${Colors.primary.DEFAULT}22` },
                                    ]}>
                                        <Text style={[
                                            styles.dayText,
                                            { color: isDark ? Colors.text.dark : Colors.text.light },
                                            selected && { color: Colors.white, fontWeight: '700' },
                                            !selected && today && { color: Colors.primary.DEFAULT, fontWeight: '700' },
                                        ]}>
                                            {day}
                                        </Text>
                                    </View>
                                    <View style={styles.indicators}>
                                        {hasUserEntry && (
                                            <View style={[
                                                styles.dot,
                                                {
                                                    backgroundColor: Colors.primary.DEFAULT,
                                                    boxShadow: `0px 2px 3px ${Colors.primary.DEFAULT}4D`,
                                                    elevation: 2
                                                }
                                            ]} />
                                        )}
                                        {hasPartnerEntry && (
                                            <View style={[
                                                styles.dot,
                                                {
                                                    backgroundColor: Colors.secondary.DEFAULT,
                                                    boxShadow: `0px 2px 3px ${Colors.secondary.DEFAULT}4D`,
                                                    elevation: 2
                                                }
                                            ]} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Day Entries List */}
                <View style={styles.entriesSection}>
                    <Text style={[styles.sectionTitle, { color: isDark ? Colors.stone[400] : Colors.stone[500] }]}>
                        {selectedDay === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                            ? 'Oggi'
                            : `${selectedDay} ${MONTHS[month]} ${year}`
                        }
                    </Text>

                    {entriesLoading ? (
                        <View style={{ gap: Spacing[2] }}>
                            <Skeleton height={80} borderRadius={BorderRadius['2xl']} />
                            <Skeleton height={80} borderRadius={BorderRadius['2xl']} />
                        </View>
                    ) : selectedDayEntries.length > 0 ? (
                        <View style={{ gap: Spacing[3] }}>
                            {selectedDayEntries.map((entry: any, index) => {
                                const isOwn = entry.type === 'mine';
                                const themeColor = isOwn ? Colors.primary.DEFAULT : Colors.secondary.DEFAULT;
                                const glowColor = isOwn ? 'rgba(232, 121, 161, 0.4)' : 'rgba(255, 133, 102, 0.4)';
                                const moodIcon: IconName = entry.mood ? getMoodIcon(entry.mood) : 'auto-awesome';
                                const time = new Date(entry.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <Animated.View
                                        key={entry.id}
                                        entering={FadeInDown.delay(index * 80).duration(400)}
                                        layout={LinearTransition}
                                    >
                                        <HeroCard
                                            title={isOwn ? `Tu • ${time}` : `${partner?.name || 'Partner'} • ${time}`}
                                            content={entry.content}
                                            themeColor={themeColor}
                                            glowColor={glowColor}
                                            icon={moodIcon}
                                            size="compact"
                                            onPress={() => router.push(`/entry/${entry.id}` as any)}
                                        />
                                    </Animated.View>
                                );
                            })}
                        </View>
                    ) : (
                        <EmptyState
                            icon="event-note"
                            title="Nessun ricordo"
                            description="Non ci sono pensieri salvati per questo giorno."
                            actionLabel="Scrivi Ora"
                            onAction={() => router.push('/entry/new' as any)}
                        />
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing[6],
    },
    title: {
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
    },
    subtitle: {
        fontSize: FontSizes.sm,
    },
    shareBtn: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarCard: {
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        padding: Spacing[5],
        borderWidth: 1,
        marginBottom: Spacing[8],
    },
    calendarNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing[4],
    },
    navBtn: {
        padding: Spacing[2],
    },
    monthText: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    weekdays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: Spacing[2],
    },
    weekdayText: {
        color: Colors.stone[400],
        fontSize: FontSizes.xs,
        fontWeight: '600',
        width: 40,
        textAlign: 'center',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
    },
    dayNumContainer: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        fontSize: FontSizes.sm,
    },
    indicators: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 2,
        height: 4,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: BorderRadius.full,
    },
    entriesSection: {
        marginBottom: Spacing[6],
    },
    sectionTitle: {
        fontSize: FontSizes.base,
        fontWeight: '600',
        marginBottom: Spacing[4],
        textTransform: 'capitalize',
    },
});
