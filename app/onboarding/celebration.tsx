import { Icon } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { useTheme } from '../../hooks/useTheme';
import { Colors, BorderRadius, FontSizes, Spacing, Shadows } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';

// Helper component for floating hearts background
function CelebrationHeart({ style, delay }: { style: any, delay: number }) {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(delay, withRepeat(
            withTiming(-10, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        ));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }, { rotate: `${style.rotation || 0}deg` }]
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, style, animatedStyle]}>
            <Icon name={style.icon || "favorite"} size={style.size} color={style.color} />
        </Animated.View>
    );
}

export default function OnboardingCelebration() {
    const router = useRouter();
    const { partner } = useAuthStore();
    const { isDark, colors } = useTheme();

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ flexGrow: 1 }}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Animated.View entering={FadeInDown.duration(600)}>
                        <Text selectable style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.espresso }]}>
                            Siete Connessi!
                        </Text>
                        <Text selectable style={[styles.headerSubtitle, { color: isDark ? Colors.stone[300] : `${Colors.text.light}CC` }]}>
                            Ora sei collegato con {partner?.name || 'il tuo partner'}.
                        </Text>
                    </Animated.View>
                </View>

                {/* Main Card */}
                <View style={styles.cardContainer}>
                    <Animated.View
                        entering={FadeInDown.delay(300).duration(800)}
                        style={[
                            styles.mainCard,
                            {
                                backgroundColor: isDark ? '#3E2723' : Colors.espresso,
                                boxShadow: Shadows.soft,
                            } as ViewStyle
                        ]}
                    >
                        {/* Background Hearts */}
                        <CelebrationHeart delay={0} style={{ top: 32, left: 32, color: 'rgba(160, 93, 72, 0.4)', size: 32, rotation: -15 }} />
                        <CelebrationHeart delay={500} style={{ top: 80, left: 16, color: 'rgba(212, 175, 53, 0.2)', size: 16, icon: 'star', rotation: -45 }} />
                        <CelebrationHeart delay={200} style={{ top: 48, right: 40, color: 'rgba(160, 93, 72, 0.5)', size: 28, rotation: 25 }} />
                        <CelebrationHeart delay={800} style={{ bottom: 120, left: 40, color: 'rgba(160, 93, 72, 0.3)', size: 40, rotation: 10 }} />
                        <CelebrationHeart delay={100} style={{ bottom: 90, right: 60, color: 'rgba(212, 175, 53, 0.2)', size: 18, icon: 'star' }} />

                        <View style={styles.cardContent}>
                            <View style={styles.iconWrapper}>
                                <View style={styles.iconGlow} />
                                <Icon name="favorite" size={96} color={Colors.secondary.DEFAULT} />
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardLabel}>
                                    Il viaggio inizia
                                </Text>
                                <Text selectable style={styles.cardTitle}>
                                    Iniziate a scrivere
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => router.push('/(tabs)')}
                            style={[
                                styles.cardButton,
                                { boxShadow: Shadows.lg } as ViewStyle
                            ]}
                        >
                            <Icon name="menu-book" size={20} color={Colors.espresso} />
                            <Text style={styles.cardButtonText}>Vai al Diario</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = {
    container: {
        flex: 1,
        alignItems: 'center',
        paddingBottom: Spacing[8],
    } as ViewStyle,
    header: {
        width: '100%',
        paddingHorizontal: Spacing[6],
        paddingTop: Spacing[8],
        paddingBottom: Spacing[6],
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    } as ViewStyle,
    headerTitle: {
        fontSize: FontSizes['3xl'],
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: Spacing[2],
        textAlign: 'center',
    } as TextStyle,
    headerSubtitle: {
        fontSize: FontSizes.lg,
        fontWeight: '500',
        lineHeight: FontSizes.lg * 1.625,
        maxWidth: 320,
        marginHorizontal: 'auto',
        textAlign: 'center',
    } as TextStyle,
    cardContainer: {
        width: '100%',
        maxWidth: 400,
        paddingHorizontal: Spacing[6],
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing[4],
    } as ViewStyle,
    mainCard: {
        position: 'relative',
        width: '100%',
        aspectRatio: 4 / 5,
        borderRadius: 40,
        borderCurve: 'continuous',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing[8],
    } as ViewStyle,
    cardContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        zIndex: 10,
        gap: Spacing[8],
    } as ViewStyle,
    iconWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    iconGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `${Colors.secondary.DEFAULT}33`,
        borderRadius: BorderRadius.full,
        transform: [{ scale: 1.5 }],
    } as ViewStyle,
    cardTextContainer: {
        gap: Spacing[1],
        alignItems: 'center',
    } as ViewStyle,
    cardLabel: {
        color: 'rgba(255,255,255,0.72)',
        fontSize: FontSizes.sm,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
        opacity: 0.8,
    } as TextStyle,
    cardTitle: {
        color: Colors.white,
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
    } as TextStyle,
    cardButton: {
        width: '100%',
        backgroundColor: Colors.secondary.DEFAULT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing[4],
        paddingHorizontal: Spacing[8],
        borderRadius: BorderRadius.full,
        borderCurve: 'continuous',
        gap: Spacing[2],
        zIndex: 20,
        marginTop: Spacing[4],
    } as ViewStyle,
    cardButtonText: {
        color: Colors.espresso,
        fontWeight: '700',
        fontSize: FontSizes.base,
    } as TextStyle,
};
