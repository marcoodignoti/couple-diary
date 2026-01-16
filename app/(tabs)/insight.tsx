import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon } from '../../components/ui/Icon';

import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../constants/theme';
import { getWeeklyProgressFromEntries, useMyEntries, usePartnerEntries } from '../../hooks/useEntryQueries';
import { useStatusBarPadding } from '../../hooks/useStatusBarPadding';
import { useTheme } from '../../hooks/useTheme';
import { addReaction } from '../../services/reactionService';
import { useAuthStore } from '../../stores/authStore';

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👏', '🔥'];

// Mock entry for testing reveal flow without spoiling real data
const MOCK_PARTNER_ENTRY = {
    id: 'test-entry-123',
    content: 'Questa è una voce di test per verificare il flusso di reveal settimanale. Il tuo vero contenuto del partner non verrà mostrato durante il test. 💕',
    user_id: 'mock-partner',
    mood: 'happy' as const,
    created_at: new Date().toISOString(),
    photo_url: null,
    is_special_date: false,
};

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

    // DEV TEST MODE - simulates Sunday reveal with mock data
    const [isTestMode, setIsTestMode] = useState(false);
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

    // Check if reveal is unlocked: Sunday after 10:00 AM OR test mode enabled
    const now = new Date();
    const isRevealUnlocked = (now.getDay() === 0 && now.getHours() >= 10) || isTestMode;

    // Get unlockable content - use mock data in test mode
    const activePartnerEntry = isTestMode
        ? MOCK_PARTNER_ENTRY
        : (partnerEntries.length > 0 ? partnerEntries[0] : null);

    const handleReaction = async (emoji: string) => {
        if (!activePartnerEntry || !user?.id) return;

        // Toggle off if same emoji clicked
        if (selectedReaction === emoji) {
            setSelectedReaction(null);
            return;
        }

        // In test mode, just show a simulated reaction
        if (isTestMode) {
            setSelectedReaction(emoji);
            alert(`[TEST] Reazione simulata: ${emoji}`);
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

            {/* DEV TEST MODE TOGGLE - Remove in production */}
            {__DEV__ && (
                <TouchableOpacity
                    onPress={() => setIsTestMode(!isTestMode)}
                    style={[
                        styles.testModeButton,
                        {
                            backgroundColor: isTestMode ? Colors.primary.DEFAULT : (isDark ? Colors.stone[800] : Colors.stone[200]),
                        }
                    ]}
                    activeOpacity={0.8}
                >
                    <Icon name={isTestMode ? 'visibility' : 'visibility-off'} size={16} color={isTestMode ? Colors.white : Colors.stone[500]} />
                    <Text style={[styles.testModeText, { color: isTestMode ? Colors.white : Colors.stone[500] }]}>
                        {isTestMode ? 'Test Mode ON' : 'Test Reveal'}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Weekly Reveal Button */}
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.revealSection}>
                <TouchableOpacity
                    onPress={() => router.push(isTestMode ? '/reveal?test=true' : '/reveal')}
                    disabled={!isRevealUnlocked && !isTestMode}
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

const styles = {
    header: {
        paddingHorizontal: Spacing[6],
        marginBottom: Spacing[8],
        marginTop: Spacing[2],
    } as ViewStyle,
    headerLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: `${Colors.primary.DEFAULT}CC`,
        marginBottom: Spacing[2],
    } as TextStyle,
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
    revealCard: {
        backgroundColor: Colors.espresso,
        borderRadius: 32,
        borderCurve: 'continuous',
        padding: Spacing[6],
        position: 'relative',
        overflow: 'hidden',
        flex: 1,
        minHeight: 300,
        borderWidth: 1,
        borderColor: Colors.stone[800],
    } as ViewStyle,
    decorativeBlob1: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 192,
        height: 192,
        backgroundColor: `${Colors.secondary.DEFAULT}1A`,
        borderRadius: BorderRadius.full,
        marginRight: -80,
        marginTop: -80,
        opacity: 0.5,
    } as ViewStyle,
    decorativeBlob2: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 128,
        height: 128,
        backgroundColor: `${Colors.primary.DEFAULT}1A`,
        borderRadius: BorderRadius.full,
        marginLeft: -40,
        marginBottom: -40,
        opacity: 0.5,
    } as ViewStyle,
    revealContent: {
        position: 'relative',
        zIndex: 10,
        flexDirection: 'column',
        flex: 1,
        height: '100%',
    } as ViewStyle,
    revealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing[6],
    } as ViewStyle,
    revealBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: Spacing[3],
        paddingVertical: Spacing[1.5],
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    } as ViewStyle,
    revealBadgeText: {
        color: Colors.secondary.DEFAULT,
        fontSize: FontSizes.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    } as TextStyle,
    revealBody: {
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
    } as ViewStyle,
    centeredContent: {
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    noPartnerText: {
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: Spacing[4],
        fontSize: FontSizes.base,
    } as TextStyle,
    inviteButton: {
        backgroundColor: Colors.primary.DEFAULT,
        paddingHorizontal: Spacing[6],
        paddingVertical: Spacing[3],
        borderRadius: BorderRadius.xl,
    } as ViewStyle,
    inviteButtonText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSizes.base,
    } as TextStyle,
    partnerLabel: {
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
        lineHeight: FontSizes['2xl'] * 1.1,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: Spacing[4],
    } as TextStyle,
    partnerContent: {
        fontSize: FontSizes.lg,
        lineHeight: FontSizes.lg * 1.625,
        color: Colors.stone[300],
    } as TextStyle,
    reactionBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing[3],
        marginTop: Spacing[6],
    } as ViewStyle,
    reactionButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    } as ViewStyle,
    reactionEmoji: {
        fontSize: FontSizes.xl,
    } as TextStyle,
    reactionButtonSelected: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderColor: Colors.primary.DEFAULT,
        borderWidth: 2,
        transform: [{ scale: 1.1 }],
    } as ViewStyle,
    reactionEmojiSelected: {
        fontSize: FontSizes.xl * 1.1,
    } as TextStyle,
    readMoreButton: {
        marginTop: Spacing[6],
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[2],
        borderRadius: BorderRadius.lg,
    } as ViewStyle,
    readMoreText: {
        color: Colors.white,
        fontWeight: '500',
        fontSize: FontSizes.base,
    } as TextStyle,
    noEntryText: {
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        fontSize: FontSizes.base,
    } as TextStyle,
    lockedPreview: {
        gap: Spacing[4],
        opacity: 0.2,
    } as ViewStyle,
    lockedPreviewTitle: {
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
        lineHeight: FontSizes['2xl'] * 1.1,
        color: 'rgba(255,255,255,0.9)',
    } as TextStyle,
    lockedPreviewContent: {
        fontSize: FontSizes.lg,
        lineHeight: FontSizes.lg * 1.625,
        color: Colors.stone[300],
    } as TextStyle,
    lockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    } as ViewStyle,
    lockIconContainer: {
        backgroundColor: `${Colors.secondary.DEFAULT}1A`,
        padding: Spacing[5],
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: `${Colors.secondary.DEFAULT}33`,
        marginBottom: Spacing[3],
    } as ViewStyle,
    lockBadge: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[2],
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    } as ViewStyle,
    lockBadgeText: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: Colors.secondary.DEFAULT,
        textTransform: 'uppercase',
        letterSpacing: 1,
    } as TextStyle,
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
    testModeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: Spacing[2],
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[2],
        borderRadius: BorderRadius.full,
        marginBottom: Spacing[4],
    } as ViewStyle,
    testModeText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
    } as TextStyle,
};
