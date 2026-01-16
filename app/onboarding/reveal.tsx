import { Icon } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TextStyle, TouchableOpacity, useWindowDimensions, View, ViewStyle } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

function FloatingHeart({ delay, style }: { delay: number, style: any }) {
    const translateY = useSharedValue(0);

    React.useEffect(() => {
        translateY.value = withDelay(delay, withRepeat(
            withTiming(-15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        ));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
    }));

    return (
        <Animated.View style={[style, animatedStyle]}>
            <Icon name="favorite" size={style.fontSize || 24} color={Colors.secondary.DEFAULT} style={{ opacity: style.opacity || 1 }} />
        </Animated.View>
    );
}

export default function OnboardingReveal() {
    const router = useRouter();
    const { isDark, colors } = useTheme();
    const { width } = useWindowDimensions();

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ flexGrow: 1 }}
        >
            <View style={styles.container}>
                {/* Top Section: Pagination */}
                <View style={styles.paginationContainer}>
                    <View style={styles.pagination}>
                        <View style={[styles.paginationDot, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : Colors.stone[300] }]} />
                        <View style={[styles.paginationDot, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : Colors.stone[300] }]} />
                        <View style={[styles.paginationDotActive, { backgroundColor: isDark ? Colors.white : Colors.stone[900] }]} />
                    </View>
                </View>

                {/* Middle Section: Visual Illustration */}
                <View style={styles.illustrationContainer}>
                    {/* Floating Elements Background */}
                    <View style={styles.floatingContainer}>
                        <FloatingHeart delay={0} style={{ position: 'absolute', top: '20%', left: '15%', fontSize: 30 }} />
                        <FloatingHeart delay={500} style={{ position: 'absolute', top: '15%', right: '20%', fontSize: 24 }} />
                        <FloatingHeart delay={1000} style={{ position: 'absolute', bottom: '25%', left: '10%', fontSize: 20, opacity: 0.8 }} />
                        <FloatingHeart delay={1500} style={{ position: 'absolute', bottom: '30%', right: '10%', fontSize: 36, opacity: 0.6 }} />
                    </View>

                    <Animated.View
                        entering={FadeIn.duration(800)}
                        style={[
                            styles.card,
                            {
                                backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                                boxShadow: Shadows.soft,
                            } as ViewStyle
                        ]}
                    >
                        {/* Card Header/Visual */}
                        <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.background.light }]}>
                            <Icon name="lock-open" size={48} color={Colors.primary.DEFAULT} />
                        </View>

                        {/* Card Text */}
                        <View style={styles.cardTextContainer}>
                            <Text selectable style={[styles.cardTitle, { color: isDark ? Colors.white : Colors.text.light }]}>
                                Sbloccato
                            </Text>
                            {/* Placeholder lines */}
                            <View style={[styles.placeholderLine, styles.placeholderLine1, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.stone[100] }]} />
                            <View style={[styles.placeholderLine, styles.placeholderLine2, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.stone[100] }]} />
                            <View style={[styles.placeholderLine, styles.placeholderLine3, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : Colors.stone[100] }]} />
                        </View>

                        {/* Decorative corner accent */}
                        <View style={styles.cornerAccent} />
                    </Animated.View>
                </View>

                {/* Bottom Section */}
                <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.bottomSection}>
                    <View style={styles.bottomContent}>
                        <Text selectable style={[styles.title, { color: isDark ? Colors.white : Colors.text.light }]}>
                            Rivelazione Domenicale
                        </Text>
                        <Text selectable style={[styles.subtitle, { color: isDark ? `${Colors.text.dark}B3` : `${Colors.text.light}B3` }]}>
                            Ogni domenica mattina, prenditi un caffè e leggi cosa ha fatto sorridere il tuo partner durante la settimana.
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => router.push('/(auth)/register' as any)}
                            style={[
                                styles.button,
                                {
                                    backgroundColor: isDark ? Colors.primary.dark : Colors.primary.DEFAULT,
                                    boxShadow: `0px 10px 30px ${Colors.primary.DEFAULT}33`,
                                } as ViewStyle
                            ]}
                        >
                            <Text style={styles.buttonText}>
                                Crea Account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </ScrollView>
    );
}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'column',
    } as ViewStyle,
    paginationContainer: {
        width: '100%',
        paddingTop: Spacing[6],
        paddingHorizontal: Spacing[6],
        alignItems: 'center',
    } as ViewStyle,
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[3],
    } as ViewStyle,
    paginationDot: {
        height: 8,
        width: 8,
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    paginationDotActive: {
        height: 8,
        width: 32,
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    illustrationContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
        padding: Spacing[6],
    } as ViewStyle,
    floatingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    } as ViewStyle,
    card: {
        position: 'relative',
        borderRadius: 32,
        borderCurve: 'continuous',
        padding: Spacing[8],
        width: 256,
        aspectRatio: 3 / 4,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing[6],
        zIndex: 10,
    } as ViewStyle,
    iconCircle: {
        height: 96,
        width: 96,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing[2],
    } as ViewStyle,
    cardTextContainer: {
        alignItems: 'center',
        gap: Spacing[2],
    } as ViewStyle,
    cardTitle: {
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
        letterSpacing: -0.5,
    } as TextStyle,
    placeholderLine: {
        height: 6,
        borderRadius: BorderRadius.full,
        marginTop: Spacing[3],
    } as ViewStyle,
    placeholderLine1: {
        width: 48,
    } as ViewStyle,
    placeholderLine2: {
        width: 80,
    } as ViewStyle,
    placeholderLine3: {
        width: 64,
    } as ViewStyle,
    cornerAccent: {
        position: 'absolute',
        top: Spacing[6],
        right: Spacing[6],
        height: 8,
        width: 8,
        backgroundColor: Colors.secondary.DEFAULT,
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    bottomSection: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: Spacing[8],
        paddingTop: Spacing[2],
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    } as ViewStyle,
    bottomContent: {
        maxWidth: 400,
        width: '100%',
        paddingHorizontal: Spacing[6],
        alignItems: 'center',
    } as ViewStyle,
    title: {
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 38,
        paddingBottom: Spacing[3],
        textAlign: 'center',
    } as TextStyle,
    subtitle: {
        fontSize: FontSizes.base,
        fontWeight: '500',
        lineHeight: FontSizes.base * 1.625,
        paddingBottom: Spacing[8],
        textAlign: 'center',
        paddingHorizontal: Spacing[4],
    } as TextStyle,
    button: {
        width: '100%',
        height: 56,
        borderRadius: BorderRadius.full,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    buttonText: {
        color: Colors.white,
        fontSize: FontSizes.lg,
        fontWeight: '700',
        letterSpacing: 0.5,
    } as TextStyle,
};
