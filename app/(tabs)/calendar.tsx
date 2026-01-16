import { Link, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Share, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Icon, IconName } from '../../components/ui/Icon';

import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton, SkeletonEntryCard } from '../../components/ui/Skeleton';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../constants/theme';
import { useMyEntries, usePartnerEntries } from '../../hooks/useEntryQueries';
import { useResponsive } from '../../hooks/useResponsive';
import { useStatusBarPadding } from '../../hooks/useStatusBarPadding';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';

const WEEKDAYS = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

export default function CalendarScreen() {
    const router = useRouter();
    const { user, partner } = useAuthStore();
    const { isDark, colors } = useTheme();
    const { contentMaxWidth, isTablet, isLandscape, horizontalPadding } = useResponsive();
    const statusBarPadding = useStatusBarPadding();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

    // React Query hooks - data is automatically cached
    const {
        data: entries = [],
        isLoading: entriesLoading,
        refetch: refetchEntries,
        isRefetching: isRefetchingEntries,
    } = useMyEntries(user?.id);

    const {
        data: partnerEntries = [],
        refetch: refetchPartner,
        isRefetching: isRefetchingPartner,
    } = usePartnerEntries(partner?.id);

    const isLoading = entriesLoading;
    const isRefreshing = isRefetchingEntries || isRefetchingPartner;

    useEffect(() => {
        const today = new Date();
        if (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth()) {
            setSelectedDay(today.getDate());
        } else {
            setSelectedDay(null);
        }
    }, [currentDate]);

    const handleRefresh = useCallback(async () => {
        await Promise.all([
            refetchEntries(),
            partner?.id ? refetchPartner() : Promise.resolve(),
        ]);
    }, [refetchEntries, refetchPartner, partner?.id]);

    const { year, month, daysInMonth, firstDayOfWeek, userEntryDates, partnerEntryDates } = useMemo(() => {
        const y = currentDate.getFullYear();
        const m = currentDate.getMonth();
        const days = new Date(y, m + 1, 0).getDate();
        const firstDay = new Date(y, m, 1).getDay();
        const myDates = new Set(entries.map(e => e.created_at.split('T')[0]));
        const theirDates = new Set(partnerEntries.filter(e => e.isUnlocked).map(e => e.created_at.split('T')[0]));
        return { year: y, month: m, daysInMonth: days, firstDayOfWeek: firstDay, userEntryDates: myDates, partnerEntryDates: theirDates };
    }, [currentDate, entries, partnerEntries]);

    const selectedDayEntries = useMemo(() => {
        if (selectedDay === null) return [];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
        const myEntries = entries.filter(e => e.created_at.startsWith(dateStr)).map(e => ({ ...e, type: 'mine' }));
        const theirEntries = partnerEntries.filter(e => e.created_at.startsWith(dateStr) && e.isUnlocked).map(e => ({ ...e, type: 'theirs' }));
        return [...myEntries, ...theirEntries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [selectedDay, year, month, entries, partnerEntries]);

    const getSelectedDateLabel = () => {
        if (selectedDay === null) return 'Seleziona un giorno';
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && selectedDay === today.getDate()) return 'Oggi';
        return `${selectedDay} ${MONTHS[month]}`;
    };

    const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const isToday = (day: number) => {
        const today = new Date();
        return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    };
    const getEntryDots = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return { hasMine: userEntryDates.has(dateStr), hasTheirs: partnerEntryDates.has(dateStr) };
    };

    const getMoodIcon = (mood: string | null): IconName => {
        switch (mood) {
            case 'happy': return 'sentiment-satisfied';
            case 'love': return 'favorite';
            case 'grateful': return 'volunteer-activism';
            case 'peaceful': return 'spa';
            case 'excited': return 'celebration';
            case 'sad': return 'sentiment-dissatisfied';
            case 'anxious': return 'psychology';
            case 'tired': return 'bedtime';
            default: return 'edit';
        }
    };

    const getMoodColor = (mood: string | null): string => {
        switch (mood) {
            case 'happy': return Colors.secondary.DEFAULT;
            case 'love': return Colors.primary.DEFAULT;
            case 'grateful': return '#14b8a6';
            case 'peaceful': return '#60a5fa';
            case 'excited': return '#f59e0b';
            case 'sad': return '#64748b';
            case 'anxious': return '#8b5cf6';
            case 'tired': return Colors.stone[400];
            default: return Colors.stone[400];
        }
    };

    // Loading State
    if (isLoading && entries.length === 0) {
        return (
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{ flex: 1, backgroundColor: colors.background }}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: statusBarPadding, paddingHorizontal: Spacing[5] }}
            >
                <View style={styles.loadingHeader}>
                    <Skeleton width={40} height={40} borderRadius={20} />
                    <View style={styles.loadingHeaderCenter}>
                        <Skeleton width={120} height={24} style={{ marginBottom: 4 }} />
                        <Skeleton width={80} height={14} />
                    </View>
                    <Skeleton width={40} height={40} borderRadius={20} />
                </View>
                <View style={[styles.calendarCard, { backgroundColor: isDark ? `${Colors.surface.dark}80` : 'rgba(255,255,255,0.6)' }]}>
                    <View style={styles.loadingWeekdays}>
                        {WEEKDAYS.map((_, i) => <Skeleton key={i} width={24} height={14} />)}
                    </View>
                    {[0, 1, 2, 3, 4].map(row => (
                        <View key={row} style={styles.loadingWeekRow}>
                            {[0, 1, 2, 3, 4, 5, 6].map(col => <Skeleton key={col} width={32} height={32} borderRadius={16} />)}
                        </View>
                    ))}
                </View>
                <SkeletonEntryCard />
                <SkeletonEntryCard />
            </ScrollView>
        );
    }

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
                {/* Month Header */}
                <Animated.View entering={FadeInDown.duration(600)} style={styles.monthHeader}>
                    <TouchableOpacity
                        onPress={goToPrevMonth}
                        style={[styles.navButton, { backgroundColor: isDark ? Colors.surface.dark : Colors.white, boxShadow: Shadows.sm } as ViewStyle]}
                    >
                        <Icon name="chevron-left" size={24} color={Colors.text.light} />
                    </TouchableOpacity>
                    <View style={styles.monthHeaderCenter}>
                        <Text selectable style={[styles.monthTitle, { color: isDark ? Colors.white : Colors.text.light }]}>{MONTHS[month]} {year}</Text>
                        <Text style={styles.monthSubtitle}>Ricordi</Text>
                    </View>
                    <TouchableOpacity
                        onPress={goToNextMonth}
                        style={[styles.navButton, { backgroundColor: isDark ? Colors.surface.dark : Colors.white, boxShadow: Shadows.sm } as ViewStyle]}
                    >
                        <Icon name="chevron-right" size={24} color={Colors.text.light} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Calendar Grid */}
                <Animated.View entering={FadeInDown.delay(100).duration(600)} style={[
                    styles.calendarCard,
                    {
                        backgroundColor: isDark ? `${Colors.surface.dark}80` : 'rgba(255,255,255,0.6)',
                        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
                        boxShadow: Shadows.sm,
                    } as ViewStyle
                ]}>
                    <View style={styles.weekdaysRow}>
                        {WEEKDAYS.map((d, i) => (
                            <Text key={i} style={styles.weekdayText}>{d}</Text>
                        ))}
                    </View>

                    <View style={styles.daysGrid}>
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <View key={`empty-${i}`} style={styles.dayCell} />
                        ))}

                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                            const today = isToday(day);
                            const isSelected = selectedDay === day;
                            const { hasMine, hasTheirs } = getEntryDots(day);

                            return (
                                <TouchableOpacity key={day} style={styles.dayCell} onPress={() => setSelectedDay(day)}>
                                    <View style={[
                                        styles.dayCircle,
                                        isSelected && { backgroundColor: Colors.primary.DEFAULT },
                                        !isSelected && today && { backgroundColor: `${Colors.primary.DEFAULT}33` }
                                    ]}>
                                        <Text style={[
                                            styles.dayText,
                                            { color: isSelected ? Colors.white : today ? Colors.primary.DEFAULT : (isDark ? Colors.text.dark : Colors.text.light) }
                                        ]}>{day}</Text>
                                    </View>
                                    <View style={styles.dotsRow}>
                                        {hasMine && <View style={[styles.dot, { backgroundColor: Colors.primary.DEFAULT }]} />}
                                        {hasTheirs && <View style={[styles.dot, { backgroundColor: Colors.secondary.DEFAULT }]} />}
                                    </View>
                                    {(!hasMine && !hasTheirs) && <View style={{ height: 6, marginTop: 4 }} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Legend */}
                    <View style={[styles.legend, { borderTopColor: isDark ? `${Colors.stone[800]}4D` : Colors.stone[100] }]}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.primary.DEFAULT }]} />
                            <Text style={styles.legendText}>Io</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.secondary.DEFAULT }]} />
                            <Text style={styles.legendText}>{partner?.name || 'Partner'}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Entries for Selected Day */}
                <View>
                    <View style={styles.entriesHeader}>
                        <Text selectable style={[styles.entriesTitle, { color: isDark ? Colors.white : Colors.text.light }]}>
                            {getSelectedDateLabel()}
                        </Text>
                        {selectedDayEntries.length > 0 && (
                            <Text style={[styles.entriesCount, { fontVariant: ['tabular-nums'] }]}>
                                {selectedDayEntries.length} {selectedDayEntries.length === 1 ? 'pensiero' : 'pensieri'}
                            </Text>
                        )}
                    </View>

                    {selectedDay === null ? (
                        <EmptyState icon="touch-app" title="Seleziona un giorno" description="Tocca un giorno nel calendario per vedere i ricordi." />
                    ) : selectedDayEntries.length > 0 ? (
                        <Animated.View layout={LinearTransition} style={styles.entriesList}>
                            {selectedDayEntries.map((entry: any, i) => {
                                const date = new Date(entry.created_at);
                                const timeStr = date.toLocaleTimeString('it-IT', { hour: 'numeric', minute: '2-digit' });
                                const isMine = entry.type === 'mine';

                                const entryHref = isMine ? `/entry/${entry.id}` : '/partner';
                                const handleShare = async () => {
                                    try {
                                        await Share.share({ message: entry.content, title: `Pensiero del ${timeStr}` });
                                    } catch (e) { }
                                };
                                return (
                                    <Link key={entry.id} href={entryHref as any} asChild>
                                        <Link.Trigger>
                                            <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
                                                <Animated.View
                                                    entering={FadeInDown.delay(100 + (i * 50)).duration(400)}
                                                    exiting={FadeOut.duration(200)}
                                                    style={[
                                                        styles.entryCard,
                                                        {
                                                            backgroundColor: isMine ? (isDark ? Colors.surface.dark : Colors.white) : (isDark ? `${Colors.surface.dark}CC` : 'rgba(255,255,255,0.8)'),
                                                            borderColor: isMine ? 'transparent' : `${Colors.secondary.DEFAULT}33`,
                                                            boxShadow: Shadows.sm,
                                                        } as ViewStyle
                                                    ]}>
                                                    <View style={[styles.entryDecoration, { backgroundColor: isMine ? `${Colors.primary.DEFAULT}0D` : `${Colors.secondary.DEFAULT}1A` }]} />

                                                    <View style={styles.entryMoodContainer}>
                                                        <Icon name={getMoodIcon(entry.mood)} size={28} color={getMoodColor(entry.mood)} />
                                                        <Text style={styles.entryTime}>{timeStr}</Text>
                                                    </View>

                                                    <View style={styles.entryContent}>
                                                        <View style={styles.entryContentHeader}>
                                                            <Text style={[styles.entryAuthor, { color: isMine ? Colors.primary.DEFAULT : Colors.secondary.DEFAULT }]}>
                                                                {isMine ? 'Io' : partner?.name || 'Partner'}
                                                            </Text>
                                                        </View>
                                                        <Text selectable style={[styles.entryText, { color: isDark ? Colors.text.dark : Colors.text.light }]} numberOfLines={3}>
                                                            {entry.content}
                                                        </Text>
                                                        {entry.photo_url && (
                                                            <View style={[styles.photoIndicator, { backgroundColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}>
                                                                <Icon name="image" size={12} color={Colors.stone[500]} />
                                                                <Text style={styles.photoIndicatorText}>Foto allegata</Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    <View style={styles.entryChevron}>
                                                        <Icon name="chevron-right" size={20} color={Colors.stone[300]} />
                                                    </View>
                                                </Animated.View>
                                            </Pressable>
                                        </Link.Trigger>
                                        <Link.Menu>
                                            <Link.MenuAction title="Condividi" icon="square.and.arrow.up" onPress={handleShare} />
                                        </Link.Menu>
                                        <Link.Preview />
                                    </Link>
                                );
                            })}
                        </Animated.View>
                    ) : (
                        <EmptyState icon="edit-off" title="Nessun ricordo" description={`Non avete scritto nulla il ${selectedDay} ${MONTHS[month]}.`} actionLabel="Scrivi un pensiero" onAction={() => router.push('/entry/new' as any)} />
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = {
    loadingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[6] } as ViewStyle,
    loadingHeaderCenter: { alignItems: 'center' } as ViewStyle,
    loadingWeekdays: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[4] } as ViewStyle,
    loadingWeekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[4] } as ViewStyle,
    monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[6] } as ViewStyle,
    navButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.full, borderCurve: 'continuous' } as ViewStyle,
    monthHeaderCenter: { alignItems: 'center' } as ViewStyle,
    monthTitle: { fontSize: FontSizes.xl, fontWeight: '700' } as TextStyle,
    monthSubtitle: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.primary.DEFAULT, textTransform: 'uppercase', letterSpacing: 2 } as TextStyle,
    calendarCard: { borderRadius: 32, borderCurve: 'continuous', padding: Spacing[5], marginBottom: Spacing[6], borderWidth: 1 } as ViewStyle,
    weekdaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[4], paddingHorizontal: Spacing[2] } as ViewStyle,
    weekdayText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.stone[400], width: 32, textAlign: 'center' } as TextStyle,
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' } as ViewStyle,
    dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: Spacing[2] } as ViewStyle,
    dayCircle: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.full } as ViewStyle,
    dayText: { fontSize: FontSizes.sm, fontWeight: '700' } as TextStyle,
    dotsRow: { flexDirection: 'row', gap: 2, marginTop: 4, height: 6, justifyContent: 'center' } as ViewStyle,
    dot: { width: 6, height: 6, borderRadius: BorderRadius.full } as ViewStyle,
    legend: { flexDirection: 'row', justifyContent: 'center', gap: Spacing[6], marginTop: Spacing[4], paddingTop: Spacing[4], borderTopWidth: 1 } as ViewStyle,
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] } as ViewStyle,
    legendDot: { width: 8, height: 8, borderRadius: BorderRadius.full } as ViewStyle,
    legendText: { fontSize: FontSizes.xs, color: Colors.stone[500], fontWeight: '500' } as TextStyle,
    entriesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing[4], paddingHorizontal: Spacing[2] } as ViewStyle,
    entriesTitle: { fontSize: FontSizes.xl, fontWeight: '700', textTransform: 'capitalize' } as TextStyle,
    entriesCount: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.stone[400] } as TextStyle,
    entriesList: { gap: Spacing[4] } as ViewStyle,
    entryCard: { padding: Spacing[5], borderRadius: BorderRadius.xl, borderCurve: 'continuous', flexDirection: 'row', gap: Spacing[4], position: 'relative', overflow: 'hidden', borderWidth: 1 } as ViewStyle,
    entryDecoration: { position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: BorderRadius.full, marginRight: -32, marginTop: -32 } as ViewStyle,
    entryMoodContainer: { alignItems: 'center', paddingTop: 4, width: 48 } as ViewStyle,
    entryTime: { fontSize: FontSizes.xs, fontWeight: '500', color: Colors.stone[400], marginTop: 4 } as TextStyle,
    entryContent: { flex: 1, zIndex: 10 } as ViewStyle,
    entryContentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } as ViewStyle,
    entryAuthor: { fontSize: FontSizes.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 } as TextStyle,
    entryText: { lineHeight: FontSizes.base * 1.625 } as TextStyle,
    photoIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing[2], gap: 4, alignSelf: 'flex-start', paddingHorizontal: Spacing[2], paddingVertical: 4, borderRadius: BorderRadius.md } as ViewStyle,
    photoIndicatorText: { fontSize: 10, color: Colors.stone[500], fontWeight: '500' } as TextStyle,
    entryChevron: { justifyContent: 'center' } as ViewStyle,
};
