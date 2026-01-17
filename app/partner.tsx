import { BlurView } from 'expo-blur';
import { Link, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Share, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { EmptyState } from '../components/ui/EmptyState';
import { Icon, IconName } from '../components/ui/Icon';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../constants/theme';
import { usePartnerEntries } from '../hooks/useEntryQueries';
import { useStatusBarPadding } from '../hooks/useStatusBarPadding';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../stores/authStore';
import type { Mood } from '../types';

const getMoodIcon = (mood: Mood | null): IconName => {
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

const getMoodColor = (mood: Mood | null): string => {
    switch (mood) {
        case 'happy': return '#D4AF37';
        case 'love': return '#C0847C';
        case 'grateful': return '#14b8a6';
        case 'peaceful': return '#60a5fa';
        case 'excited': return '#f59e0b';
        case 'sad': return '#64748b';
        case 'anxious': return '#8b5cf6';
        case 'tired': return '#a8a29e';
        default: return '#a8a29e';
    }
};

export default function PartnerEntriesScreen() {
    const router = useRouter();
    const { partner } = useAuthStore();
    const { isDark, colors } = useTheme();
    const statusBarPadding = useStatusBarPadding();

    // React Query hook - data is automatically cached and refetched
    const {
        data: partnerEntries = [],
        isLoading,
        refetch,
        isRefetching,
    } = usePartnerEntries(partner?.id);

    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(withTiming(1.1, { duration: 1500 }), -1, true);
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const { unlockedEntries, lockedEntries, nextUnlockDate } = useMemo(() => {
        const unlocked = partnerEntries.filter(e => e.isUnlocked);
        const locked = partnerEntries.filter(e => !e.isUnlocked);

        // Find the nearest unlock date
        const nextDate = locked.length > 0
            ? new Date(locked.reduce((min, e) => e.unlock_date < min ? e.unlock_date : min, locked[0].unlock_date))
            : null;

        return { unlockedEntries: unlocked, lockedEntries: locked, nextUnlockDate: nextDate };
    }, [partnerEntries]);

    const animatedLockStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    const formatUnlockDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today!';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        return dayName;
    };

    // Not connected to partner
    if (!partner) {
        return (
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{ flex: 1, backgroundColor: colors.background }}
                contentContainerStyle={{ flex: 1 }}
            >
                <View style={[styles.header, { borderBottomColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={isDark ? Colors.white : Colors.text.light} />
                        <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.text.light }]}>Partner's Diary</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.emptyContainer}>
                    <EmptyState
                        icon="people"
                        title="Connect with your partner"
                        description="Link with your partner to see their diary entries."
                        actionLabel="Connect Now"
                        onAction={() => router.push('/onboarding/invite' as any)}
                    />
                </View>
            </ScrollView>
        );
    }

    // Loading
    if (isLoading && partnerEntries.length === 0) {
        return (
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{ flex: 1, backgroundColor: colors.background }}
            >
                <View style={[styles.header, { borderBottomColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}>
                    <View style={styles.backButton}>
                        <Skeleton width={24} height={24} borderRadius={12} />
                        <Skeleton width={140} height={24} />
                    </View>
                </View>
                <View style={{ padding: Spacing[5] }}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ paddingHorizontal: Spacing[5], paddingBottom: 120, paddingTop: statusBarPadding }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={Colors.primary.DEFAULT} />}
        >
            {/* Header */}
            <View style={[styles.headerInline, { borderBottomColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={isDark ? Colors.white : Colors.text.light} />
                    <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.text.light }]}>{partner.name}'s Diary</Text>
                </TouchableOpacity>
            </View>

            {/* Locked Entries Section */}
            {lockedEntries.length > 0 && (
                <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="lock" size={20} color={Colors.secondary.DEFAULT} />
                        <Text style={[styles.sectionTitle, { color: isDark ? Colors.white : Colors.text.light }]}>
                            Waiting to Unlock
                        </Text>
                        {nextUnlockDate && (
                            <View style={styles.unlockBadge}>
                                <Text style={styles.unlockBadgeText}>{formatUnlockDate(nextUnlockDate)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Locked Entry Cards */}
                    <View style={styles.entriesContainer}>
                        {lockedEntries.slice(0, 3).map((entry) => (
                            <View
                                key={entry.id}
                                style={[
                                    styles.lockedCard,
                                    {
                                        backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                                        borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                                    }
                                ]}
                            >
                                <View style={[styles.lockedCardHeader, { borderBottomColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}>
                                    <View style={styles.moodRow}>
                                        <Icon name={getMoodIcon(entry.mood)} size={20} color={getMoodColor(entry.mood)} />
                                        <Text selectable style={styles.dateText}>
                                            {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </Text>
                                    </View>
                                    <View style={styles.lockInfo}>
                                        <Icon name="lock" size={14} color={Colors.stone[400]} />
                                        <Text style={styles.unlockText}>
                                            Unlocks {new Date(entry.unlock_date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.blurContainer}>
                                    <View style={styles.placeholderContent}>
                                        <View style={[styles.placeholderLine, { backgroundColor: isDark ? Colors.stone[700] : Colors.stone[200], width: '100%' }]} />
                                        <View style={[styles.placeholderLine, { backgroundColor: isDark ? Colors.stone[700] : Colors.stone[200], width: '80%' }]} />
                                        <View style={[styles.placeholderLine, { backgroundColor: isDark ? Colors.stone[700] : Colors.stone[200], width: '60%' }]} />
                                    </View>
                                    <BlurView intensity={15} tint={isDark ? 'dark' : 'light'} style={styles.blurOverlay}>
                                        <Animated.View style={animatedLockStyle}>
                                            <View style={[styles.lockIconBg, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)' }]}>
                                                <Icon name="lock" size={24} color={Colors.primary.DEFAULT} />
                                            </View>
                                        </Animated.View>
                                    </BlurView>
                                </View>
                            </View>
                        ))}

                        {lockedEntries.length > 3 && (
                            <Text style={styles.moreText}>
                                +{lockedEntries.length - 3} more entries waiting
                            </Text>
                        )}
                    </View>
                </Animated.View>
            )}

            {/* Unlocked Entries Section */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <View style={styles.sectionHeader}>
                    <Icon name="lock-open" size={20} color={Colors.primary.DEFAULT} />
                    <Text style={[styles.sectionTitle, { color: isDark ? Colors.white : Colors.text.light }]}>
                        Unlocked Entries
                    </Text>
                    {unlockedEntries.length > 0 && (
                        <View style={styles.countBadge}>
                            <Text style={[styles.countBadgeText, { fontVariant: ['tabular-nums'] }]}>{unlockedEntries.length}</Text>
                        </View>
                    )}
                </View>

                {unlockedEntries.length > 0 ? (
                    <Animated.View layout={LinearTransition} style={styles.entriesContainer}>
                        {unlockedEntries.map((entry, i) => {
                            const handleShare = async () => {
                                try {
                                    await Share.share({ message: entry.content, title: `${partner?.name}'s thought` });
                                } catch (e) { }
                            };
                            return (
                                <Link key={entry.id} href={`/entry/partner/${entry.id}` as any} asChild>
                                    <Link.Trigger>
                                        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
                                            <Animated.View
                                                entering={FadeIn.delay(100 * i).duration(300)}
                                                exiting={FadeOut.duration(200)}
                                                style={[
                                                    styles.entryCard,
                                                    {
                                                        backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                                                        borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                                                        boxShadow: Shadows.sm,
                                                    } as ViewStyle
                                                ]}
                                            >
                                                <View style={styles.entryHeader}>
                                                    <View>
                                                        <Text selectable style={styles.entryDate}>
                                                            {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                                        </Text>
                                                        <Text selectable style={styles.entryTime}>
                                                            {new Date(entry.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                        </Text>
                                                    </View>
                                                    <Icon name={getMoodIcon(entry.mood)} size={28} color={getMoodColor(entry.mood)} />
                                                </View>
                                                <Text selectable style={[styles.entryContent, { color: isDark ? Colors.text.dark : Colors.text.light }]} numberOfLines={4}>
                                                    {entry.content}
                                                </Text>
                                                <View style={styles.readMoreRow}>
                                                    <Text style={styles.readMoreText}>Read more</Text>
                                                    <Icon name="chevron-right" size={16} color={Colors.stone[300]} />
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
                    <EmptyState
                        icon="hourglass-empty"
                        title="No entries unlocked yet"
                        description={`${partner.name}'s entries will unlock every Sunday. Check back soon!`}
                    />
                )}
            </Animated.View>
        </ScrollView>
    );
}

const styles = {
    header: {
        paddingHorizontal: Spacing[5],
        paddingVertical: Spacing[3],
        borderBottomWidth: 1,
    } as ViewStyle,
    headerInline: {
        paddingBottom: Spacing[3],
        borderBottomWidth: 1,
        marginBottom: Spacing[4],
    } as ViewStyle,
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[2],
    } as ViewStyle,
    headerTitle: {
        fontWeight: '700',
        fontSize: FontSizes.lg,
    } as TextStyle,
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing[8],
    } as ViewStyle,
    section: {
        marginBottom: Spacing[8],
    } as ViewStyle,
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[2],
        marginBottom: Spacing[4],
    } as ViewStyle,
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
    } as TextStyle,
    unlockBadge: {
        backgroundColor: `${Colors.secondary.DEFAULT}1A`,
        paddingHorizontal: Spacing[2],
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
        marginLeft: 'auto',
    } as ViewStyle,
    unlockBadgeText: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        color: Colors.secondary.DEFAULT,
    } as TextStyle,
    countBadge: {
        backgroundColor: `${Colors.primary.DEFAULT}1A`,
        paddingHorizontal: Spacing[2],
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
        marginLeft: 'auto',
    } as ViewStyle,
    countBadgeText: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        color: Colors.primary.DEFAULT,
    } as TextStyle,
    entriesContainer: {
        gap: Spacing[4],
    } as ViewStyle,
    lockedCard: {
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        overflow: 'hidden',
        borderWidth: 1,
    } as ViewStyle,
    lockedCardHeader: {
        padding: Spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    } as ViewStyle,
    moodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[2],
    } as ViewStyle,
    dateText: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        color: Colors.stone[500],
    } as TextStyle,
    lockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[1],
    } as ViewStyle,
    unlockText: {
        fontSize: FontSizes.xs,
        color: Colors.stone[400],
    } as TextStyle,
    blurContainer: {
        position: 'relative',
        height: 96,
    } as ViewStyle,
    placeholderContent: {
        padding: Spacing[4],
        gap: Spacing[2],
        opacity: 0.5,
    } as ViewStyle,
    placeholderLine: {
        height: 12,
        borderRadius: BorderRadius.sm,
    } as ViewStyle,
    blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    lockIconBg: {
        padding: Spacing[3],
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    moreText: {
        textAlign: 'center',
        fontSize: FontSizes.sm,
        color: Colors.stone[400],
    } as TextStyle,
    entryCard: {
        padding: Spacing[5],
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        borderWidth: 1,
    } as ViewStyle,
    entryHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: Spacing[3],
    } as ViewStyle,
    entryDate: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: Colors.primary.DEFAULT,
    } as TextStyle,
    entryTime: {
        fontSize: FontSizes.xs,
        color: Colors.stone[400],
        marginTop: 2,
    } as TextStyle,
    entryContent: {
        lineHeight: FontSizes.base * 1.625,
        fontSize: FontSizes.base,
    } as TextStyle,
    readMoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: Spacing[3],
    } as ViewStyle,
    readMoreText: {
        fontSize: FontSizes.xs,
        color: Colors.stone[400],
        marginRight: Spacing[1],
    } as TextStyle,
};
