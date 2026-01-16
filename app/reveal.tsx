import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    ImageStyle,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeOut,
} from 'react-native-reanimated';

import { Icon } from '../components/ui/Icon';
import { BorderRadius, Colors, FontSizes, Spacing } from '../constants/theme';
import { usePartnerEntries } from '../hooks/useEntryQueries';
import { useTheme } from '../hooks/useTheme';
import { addReaction } from '../services/reactionService';
import { useAuthStore } from '../stores/authStore';
import type { Entry, Mood } from '../types';

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👏', '🔥'];
const STEP_DURATION = 15000; // 15 seconds
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock entries for test mode
const MOCK_ENTRIES: Entry[] = [
    {
        id: 'test-1',
        user_id: 'mock-partner',
        content: 'Oggi è stata una giornata speciale. Ho pensato tanto a noi e a quanto sono grato di averti nella mia vita. 💕',
        mood: 'love' as Mood,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        photo_url: null,
        is_special_date: false,
        unlock_date: new Date().toISOString(),
    },
    {
        id: 'test-2',
        user_id: 'mock-partner',
        content: 'Il lavoro è stato stressante ma pensare a te mi ha fatto sentire meglio. Non vedo l\'ora di vederti! ✨',
        mood: 'grateful' as Mood,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        photo_url: null,
        is_special_date: false,
        unlock_date: new Date().toISOString(),
    },
    {
        id: 'test-3',
        user_id: 'mock-partner',
        content: 'Che bella serata insieme! Questi momenti sono i più preziosi. Ti amo tanto. 🌟',
        mood: 'happy' as Mood,
        created_at: new Date().toISOString(),
        photo_url: null,
        is_special_date: true,
        unlock_date: new Date().toISOString(),
    },
];

const MOOD_CONFIG: Record<Mood, { icon: string; color: string; label: string }> = {
    happy: { icon: 'sentiment-satisfied', color: '#D4AF37', label: 'Felice' },
    love: { icon: 'favorite', color: '#C0847C', label: 'Amato' },
    grateful: { icon: 'volunteer-activism', color: '#14b8a6', label: 'Grato' },
    peaceful: { icon: 'spa', color: '#60a5fa', label: 'Sereno' },
    excited: { icon: 'celebration', color: '#f59e0b', label: 'Emozionato' },
    sad: { icon: 'sentiment-dissatisfied', color: '#64748b', label: 'Triste' },
    anxious: { icon: 'psychology', color: '#8b5cf6', label: 'Ansioso' },
    tired: { icon: 'bedtime', color: '#a8a29e', label: 'Stanco' },
};

// Progress bar component
function ProgressBars({
    totalSteps,
    currentStep,
    progress,
}: {
    totalSteps: number;
    currentStep: number;
    progress: number;
}) {
    return (
        <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
                <View key={index} style={styles.progressBarWrapper}>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: index < currentStep
                                        ? '100%'
                                        : index === currentStep
                                            ? `${progress * 100}%`
                                            : '0%',
                                },
                            ]}
                        />
                    </View>
                </View>
            ))}
        </View>
    );
}



export default function RevealScreen() {
    const router = useRouter();
    const { test } = useLocalSearchParams<{ test?: string }>();
    const isTestMode = test === 'true';

    const { user, partner } = useAuthStore();
    const { isDark } = useTheme();
    const { data: partnerEntries = [] } = usePartnerEntries(partner?.id);

    // Get entries for this week or mock entries
    const entries = useMemo(() => {
        if (isTestMode) return MOCK_ENTRIES;
        // Filter entries from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return partnerEntries.filter(e => new Date(e.created_at) >= weekAgo);
    }, [isTestMode, partnerEntries]);

    // Total steps = intro + entries + finale
    const totalSteps = 1 + entries.length + 1;

    const [currentStep, setCurrentStep] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [selectedReactions, setSelectedReactions] = useState<Record<string, string>>({});
    const [progress, setProgress] = useState(0);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const remainingTimeRef = useRef<number>(STEP_DURATION);

    // Determine if current step should auto-advance
    // Determine if current step should auto-advance
    const isLastStep = currentStep === totalSteps - 1;
    // Allow timer to run even on last step to animate the bar (but navigation won't happen)
    const shouldAutoAdvance = !isPaused;

    const goToNextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    // Timer logic
    useEffect(() => {
        if (!shouldAutoAdvance) {
            return;
        }

        startTimeRef.current = Date.now();

        const tick = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min(elapsed / remainingTimeRef.current, 1);
            setProgress(newProgress);

            if (newProgress >= 1) {
                if (isLastStep) {
                    router.back();
                } else {
                    goToNextStep();
                }
            } else {
                timerRef.current = setTimeout(tick, 50);
            }
        };

        timerRef.current = setTimeout(tick, 50);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [currentStep, isPaused, shouldAutoAdvance]);

    // Reset progress on step change
    useEffect(() => {
        setProgress(0);
        remainingTimeRef.current = STEP_DURATION;
    }, [currentStep]);

    const handleLeftTap = () => {
        if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleRightTap = () => {
        if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleCenterTap = () => {
        if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        if (isPaused) {
            // Resume
            setIsPaused(false);
        } else {
            // Pause
            const elapsed = Date.now() - startTimeRef.current;
            remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
            setIsPaused(true);
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    };

    const handleReaction = async (entryId: string, emoji: string) => {
        if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Toggle off if same emoji
        if (selectedReactions[entryId] === emoji) {
            setSelectedReactions(prev => {
                const next = { ...prev };
                delete next[entryId];
                return next;
            });
            return;
        }

        setSelectedReactions(prev => ({ ...prev, [entryId]: emoji }));

        if (isTestMode) {
            alert(`[TEST] Reazione: ${emoji}`);
            return;
        }

        try {
            await addReaction(entryId, user?.id || '', 'note', undefined, undefined, emoji);
        } catch (error) {
            console.error('Failed to react:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    // Get current entry (for entry steps)
    const currentEntryIndex = currentStep - 1;
    const currentEntry = entries[currentEntryIndex];

    const renderStepContent = () => {
        // Intro step
        if (currentStep === 0) {
            return (
                <Animated.View
                    entering={FadeIn.duration(600)}
                    exiting={FadeOut.duration(300)}
                    style={styles.centeredContent}
                    pointerEvents="none"
                >
                    <View style={styles.iconContainer}>
                        <Icon name="lock-open" size={64} color={Colors.secondary.DEFAULT} />
                    </View>
                    <Text style={styles.introTitle}>
                        Pronto a scoprire cosa ha scritto il tuo partner?
                    </Text>
                    <Text style={styles.introSubtitle}>
                        {entries.length} {entries.length === 1 ? 'pensiero' : 'pensieri'} da scoprire
                    </Text>
                    {isPaused && (
                        <Animated.View entering={FadeIn} style={styles.pausedBadge}>
                            <Icon name="pause" size={16} color={Colors.white} />
                            <Text style={styles.pausedText}>In pausa</Text>
                        </Animated.View>
                    )}
                </Animated.View>
            );
        }

        // Finale step
        if (currentStep === totalSteps - 1) {
            return (
                <Animated.View
                    entering={FadeInDown.duration(600)}
                    style={styles.centeredContent}
                    pointerEvents="none"
                >
                    <Text style={styles.finaleEmoji}>💕</Text>
                    <Text style={styles.finaleTitle}>Hai visto tutto!</Text>
                    <Text style={styles.finaleSubtitle}>
                        Torna domenica prossima per altri pensieri
                    </Text>
                </Animated.View>
            );
        }

        // Entry step
        if (currentEntry) {
            const moodData = currentEntry.mood ? MOOD_CONFIG[currentEntry.mood] : null;
            const selectedEmoji = selectedReactions[currentEntry.id];

            return (
                <Animated.View
                    entering={FadeInDown.duration(500)}
                    exiting={FadeOut.duration(200)}
                    style={styles.entryContent}
                    pointerEvents="box-none"
                >
                    {/* Partner label */}
                    <Text style={styles.partnerLabel} pointerEvents="none">
                        Da {isTestMode ? 'Partner' : partner?.name}:
                    </Text>

                    {/* Date */}
                    <Text style={styles.entryDate} pointerEvents="none">
                        {formatDate(currentEntry.created_at)}
                    </Text>

                    {/* Mood badge */}
                    {moodData && (
                        <View style={styles.moodBadge} pointerEvents="none">
                            <Icon name={moodData.icon as any} size={20} color={moodData.color} />
                            <Text style={[styles.moodText, { color: moodData.color }]}>
                                {moodData.label}
                            </Text>
                        </View>
                    )}

                    {/* Entry content */}
                    <View style={styles.entryCard} pointerEvents="none">
                        <Text style={styles.entryText}>
                            "{currentEntry.content}"
                        </Text>
                    </View>

                    {/* Photo */}
                    {currentEntry.photo_url && (
                        <Image
                            source={{ uri: currentEntry.photo_url }}
                            style={styles.entryPhoto}
                            resizeMode="cover"
                        />
                    )}

                    {/* Reactions - MUST BE AUTO INTERACTIVE */}
                    <View style={styles.reactionSection} pointerEvents="auto">
                        <Text style={styles.reactionLabel}>Come ti fa sentire?</Text>
                        <View style={styles.reactionBar}>
                            {REACTION_EMOJIS.map((emoji) => (
                                <TouchableOpacity
                                    key={emoji}
                                    onPress={() => handleReaction(currentEntry.id, emoji)}
                                    style={[
                                        styles.reactionButton,
                                        selectedEmoji === emoji && styles.reactionButtonSelected,
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.reactionEmoji,
                                        selectedEmoji === emoji && styles.reactionEmojiSelected,
                                    ]}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Paused indicator */}
                    {isPaused && (
                        <Animated.View entering={FadeIn} style={styles.pausedBadge}>
                            <Icon name="pause" size={16} color={Colors.white} />
                            <Text style={styles.pausedText}>In pausa</Text>
                        </Animated.View>
                    )}
                </Animated.View>
            );
        }

        return null;
    };

    return (
        <View style={styles.container}>
            {/* Background gradient */}
            <View style={styles.gradientBg} />

            {/* Progress bars */}
            <ProgressBars
                totalSteps={totalSteps}
                currentStep={currentStep}
                progress={progress}
            />

            {/* Close button - RESTORED */}
            <TouchableOpacity
                onPress={() => router.back()}
                style={styles.closeButton}
                activeOpacity={0.7}
            >
                <Icon name="close" size={28} color={Colors.white} />
            </TouchableOpacity>

            {/* Touch Zones Layer - behind interactive content but capturing taps on empty space */}
            <View style={styles.touchLayer}>
                <TouchableOpacity activeOpacity={1} style={styles.touchZoneLeft} onPress={handleLeftTap} />
                <TouchableOpacity activeOpacity={1} style={styles.touchZoneCenter} onPress={handleCenterTap} />
                <TouchableOpacity activeOpacity={1} style={styles.touchZoneRight} onPress={handleRightTap} />
            </View>

            {/* Main content area - pointerEvents box-none allows touches to pass through empty space to touch layer */}
            <View style={styles.contentArea} pointerEvents="box-none">
                {renderStepContent()}
            </View>
        </View>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: Colors.primary.dark,
    } as ViewStyle,
    touchLayer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        zIndex: 5, // Above background, below content
    } as ViewStyle,
    touchZoneLeft: {
        width: '33%',
        height: '100%',
    } as ViewStyle,
    touchZoneCenter: {
        width: '34%',
        height: '100%',
    } as ViewStyle,
    touchZoneRight: {
        width: '33%',
        height: '100%',
    } as ViewStyle,
    gradientBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.primary.DEFAULT,
        opacity: 0.9,
        zIndex: 1,
    } as ViewStyle,
    progressContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing[4],
        paddingTop: 60,
        gap: Spacing[1],
        zIndex: 10,
    } as ViewStyle,
    progressBarWrapper: {
        flex: 1,
    } as ViewStyle,
    progressBarBg: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    } as ViewStyle,
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.white,
        borderRadius: 2,
    } as ViewStyle,
    closeButton: {
        position: 'absolute',
        top: 70,
        right: Spacing[4],
        zIndex: 50, // Higher than touch zones
        padding: Spacing[2],
    } as ViewStyle,
    contentArea: {
        flex: 1,
        paddingHorizontal: Spacing[6],
        paddingTop: Spacing[8],
        paddingBottom: Spacing[8],
        zIndex: 10, // Higher than touch layer so buttons work
    } as ViewStyle,
    navHints: {
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0,
        bottom: 100,
        flexDirection: 'row',
    } as ViewStyle,
    navLeft: {
        flex: 1,
    } as ViewStyle,
    navRight: {
        flex: 1,
    } as ViewStyle,
    centeredContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing[8],
    } as ViewStyle,
    introTitle: {
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
        color: Colors.white,
        textAlign: 'center',
        marginBottom: Spacing[4],
        lineHeight: FontSizes['2xl'] * 1.3,
    } as TextStyle,
    introSubtitle: {
        fontSize: FontSizes.lg,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    } as TextStyle,
    pausedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[2],
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[2],
        borderRadius: BorderRadius.full,
        position: 'absolute',
        bottom: Spacing[8],
    } as ViewStyle,
    pausedText: {
        color: Colors.white,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    } as TextStyle,
    entryContent: {
        flex: 1,
        paddingTop: Spacing[4],
    } as ViewStyle,
    partnerLabel: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.white,
        marginBottom: Spacing[2],
    } as TextStyle,
    entryDate: {
        fontSize: FontSizes.sm,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: Spacing[4],
        textTransform: 'capitalize',
    } as TextStyle,
    moodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[2],
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: Spacing[3],
        paddingVertical: Spacing[1.5],
        borderRadius: BorderRadius.full,
        alignSelf: 'flex-start',
        marginBottom: Spacing[4],
    } as ViewStyle,
    moodText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
    } as TextStyle,
    entryCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing[5],
        marginBottom: Spacing[4],
    } as ViewStyle,
    entryText: {
        fontSize: FontSizes.lg,
        lineHeight: FontSizes.lg * 1.6,
        color: Colors.white,
        fontStyle: 'italic',
    } as TextStyle,
    entryPhoto: {
        width: '100%',
        height: 200,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing[4],
    } as ImageStyle,
    reactionSection: {
        marginTop: 'auto',
    } as ViewStyle,
    reactionLabel: {
        fontSize: FontSizes.base,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: Spacing[3],
        textAlign: 'center',
    } as TextStyle,
    reactionBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing[3],
    } as ViewStyle,
    reactionButton: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    reactionButtonSelected: {
        backgroundColor: 'rgba(255,255,255,0.35)',
        transform: [{ scale: 1.15 }],
        borderWidth: 2,
        borderColor: Colors.white,
    } as ViewStyle,
    reactionEmoji: {
        fontSize: FontSizes.xl,
    } as TextStyle,
    reactionEmojiSelected: {
        fontSize: FontSizes.xl * 1.1,
    } as TextStyle,
    finaleEmoji: {
        fontSize: 80,
        marginBottom: Spacing[6],
    } as TextStyle,
    finaleTitle: {
        fontSize: FontSizes['3xl'],
        fontWeight: '700',
        color: Colors.white,
        marginBottom: Spacing[3],
    } as TextStyle,
    finaleSubtitle: {
        fontSize: FontSizes.base,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: Spacing[8],
    } as TextStyle,
    finaleButton: {
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing[8],
        paddingVertical: Spacing[4],
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    finaleButtonText: {
        color: Colors.primary.DEFAULT,
        fontWeight: '700',
        fontSize: FontSizes.lg,
    } as TextStyle,
    confettiContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
        overflow: 'hidden',
    } as ViewStyle,
    confettiParticle: {
        position: 'absolute',
        fontSize: 24,
    } as TextStyle,
};
