import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon } from '../../components/ui/Icon';

import { Colors, Shadows } from '../../constants/theme';
import { getWeeklyProgressFromEntries, useMyEntries, usePartnerEntries } from '../../hooks/useEntryQueries';
import { useStatusBarPadding } from '../../hooks/useStatusBarPadding';
import { useTheme } from '../../hooks/useTheme';
import { addReaction } from '../../services/reactionService';
import { useAuthStore } from '../../stores/authStore';

function Bar({ isCompleted, dayLabel, isDark }: { isCompleted: boolean; dayLabel: string; isDark: boolean }) {
    return (
        <View style={styles.barContainer}>
            <View style={[styles.barTrack, { backgroundColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}>
                {isCompleted && (
                    <View style={styles.barFill} />
                )}
            </View>
            <Text style={[styles.barLabel, { color: isCompleted ? Colors.primary.DEFAULT : Colors.stone[300] }]}>
                {dayLabel}
            </Text>
        </View>
    );
}

export default function InsightScreen() {
    const router = useRouter();
    const { user, partner } = useAuthStore();
    const { isDark, colors } = useTheme();
    const statusBarPadding = useStatusBarPadding();

    // Track which reaction the user selected
    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

    // React Query hooks - data is automatically cached and refetched
    const { data: entries = [] } = useMyEntries(user?.id);
    const { data: partnerEntries = [] } = usePartnerEntries(partner?.id);

    // Compute weekly progress from cached entries
    const weeklyProgress = useMemo(() => {
        if (!user?.id) return Array(7).fill(false);
        return getWeeklyProgressFromEntries(entries, user.id);
    }, [entries, user?.id]);

    const weekDays = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
    const completedDaysCount = weeklyProgress.filter(d => d).length;

    // Check if reveal is unlocked: Sunday after 10:00 AM
    const now = new Date();
    const isRevealUnlocked = now.getDay() === 0 && now.getHours() >= 10;

    // Get unlockable content
    const activePartnerEntry = partnerEntries.length > 0 ? partnerEntries[0] : null;

    const handleReaction = async (emoji: string) => {
        if (!activePartnerEntry || !user?.id) return;

        // Toggle off if same emoji clicked
        if (selectedReaction === emoji) {
            setSelectedReaction(null);
            return;
        }

        try {
            await addReaction(
                activePartnerEntry.id,
                user.id,
                'note',
                undefined,
                undefined,
                emoji
            );
            setSelectedReaction(emoji);
            alert(`Reazione inviata: ${emoji}`);
        } catch (error) {
            console.error('Failed to react:', error);
        }
    };

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120, paddingTop: statusBarPadding }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
                <View>
                    <Text selectable style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.text.light }]}>
                        I progressi di{'\n'}{user?.name || 'Te'}
                    </Text>
                </View>
            </Animated.View>

            {/* Chart Section */}
            <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.chartSection}>
                <View style={styles.chartHeader}>
                    <View style={styles.unlockStatus}>
                        {isRevealUnlocked ? (
                            <>
                                <Icon name="lock-open" size={16} color="#4ade80" />
                                <Text style={styles.unlockedText}>Sbloccato!</Text>
                            </>
                        ) : (
                            <>
                                <Icon name="lock-clock" size={16} color={Colors.secondary.DEFAULT} />
                                <Text style={styles.lockedText}>Sblocca Domenica</Text>
                            </>
                        )}
                    </View>
                    <View style={styles.progressCounter}>
                        <Text style={{ fontVariant: ['tabular-nums'], flexDirection: 'row' }}>
                            <Text style={styles.progressNumber}>{completedDaysCount}</Text>
                            <Text style={[styles.progressLabel, { color: isDark ? `${Colors.text.dark}99` : `${Colors.text.light}99` }]}>/7 giorni</Text>
                        </Text>
                    </View>
                </View>

                <View style={[
                    styles.chartCard,
                    {
                        backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                        borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                        boxShadow: Shadows.sm,
                    } as ViewStyle
                ]}>
                    <View style={styles.barsContainer}>
                        {weeklyProgress.map((isCompleted, i) => (
                            <Bar key={i} isCompleted={isCompleted} dayLabel={weekDays[i]} isDark={isDark} />
                        ))}
                    </View>
                </View>
            </Animated.View>

            {/* Weekly Reveal Button */}
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.revealSection}>
                <TouchableOpacity
                    onPress={() => router.push('/reveal')}
                    disabled={!isRevealUnlocked}
                    style={[
                        styles.revealButton,
                        {
                            backgroundColor: isRevealUnlocked ? Colors.primary.DEFAULT : (isDark ? Colors.stone[800] : Colors.stone[200]),
                            boxShadow: isRevealUnlocked ? Shadows.lg : 'none',
                        } as ViewStyle
                    ]}
                    activeOpacity={0.8}
                >
                    <View style={styles.revealButtonContent}>
                        <Icon
                            name={isRevealUnlocked ? 'lock-open' : 'lock'}
                            size={28}
                            color={isRevealUnlocked ? Colors.white : Colors.stone[400]}
                        />
                        <View style={styles.revealButtonText}>
                            <Text style={[
                                styles.revealButtonTitle,
                                { color: isRevealUnlocked ? Colors.white : (isDark ? Colors.stone[400] : Colors.stone[500]) }
                            ]}>
                                {isRevealUnlocked ? 'Rivela Settimanale' : 'Bloccato'}
                            </Text>
                            <Text style={[
                                styles.revealButtonSubtitle,
                                { color: isRevealUnlocked ? 'rgba(255,255,255,0.7)' : Colors.stone[400] }
                            ]}>
                                {isRevealUnlocked
                                    ? 'Scopri cosa ha scritto il tuo partner!'
                                    : 'Disponibile Domenica alle 10:00'}
                            </Text>
                        </View>
                        {isRevealUnlocked && (
                            <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </ScrollView >
    );
}

import { TextStyle } from 'react-native';
import { BorderRadius, FontSizes, Spacing } from '../../constants/theme';

const styles = {
    header: {
        paddingHorizontal: Spacing[6],
        marginBottom: Spacing[8],
        marginTop: Spacing[2],
    } as ViewStyle,
    headerTitle: {
        fontSize: FontSizes['3xl'],
        fontWeight: '800',
        lineHeight: FontSizes['3xl'] * 1.1,
    } as TextStyle,
    chartSection: {
        paddingHorizontal: Spacing[6],
        marginBottom: Spacing[8],
    } as ViewStyle,
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: Spacing[4],
    } as ViewStyle,
    unlockStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[1],
    } as ViewStyle,
    unlockedText: {
        color: '#4ade80',
        fontWeight: '700',
        fontSize: FontSizes.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    } as TextStyle,
    lockedText: {
        color: Colors.secondary.DEFAULT,
        fontWeight: '700',
        fontSize: FontSizes.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    } as TextStyle,
    progressCounter: {
        alignItems: 'flex-end',
    } as ViewStyle,
    progressNumber: {
        fontSize: FontSizes['3xl'],
        fontWeight: '900',
        color: Colors.primary.DEFAULT,
    } as TextStyle,
    progressLabel: {
        fontWeight: '500',
    } as TextStyle,
    chartCard: {
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        padding: Spacing[5],
        borderWidth: 1,
        height: 240,
    } as ViewStyle,
    barsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: '100%',
        gap: Spacing[2],
        paddingBottom: Spacing[2],
    } as ViewStyle,
    barContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: Spacing[2],
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
    } as ViewStyle,
    barTrack: {
        width: '100%',
        maxWidth: 40,
        borderRadius: BorderRadius.lg,
        position: 'relative',
        alignItems: 'flex-end',
        overflow: 'hidden',
        height: '80%',
    } as ViewStyle,
    barFill: {
        width: '100%',
        backgroundColor: Colors.primary.DEFAULT,
        borderRadius: BorderRadius.lg,
        height: '100%',
        position: 'absolute',
        bottom: 0,
    } as ViewStyle,
    barLabel: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
    } as TextStyle,
    revealSection: {
        paddingHorizontal: Spacing[6],
        flex: 1,
    } as ViewStyle,
    revealButton: {
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        padding: Spacing[5],
    } as ViewStyle,
    revealButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[4],
    } as ViewStyle,
    revealButtonText: {
        flex: 1,
    } as ViewStyle,
    revealButtonTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        marginBottom: Spacing[1],
    } as TextStyle,
    revealButtonSubtitle: {
        fontSize: FontSizes.sm,
    } as TextStyle,
};
