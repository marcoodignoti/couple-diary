import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ImageStyle, ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon } from '../../components/ui/Icon';

import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function OnboardingSecret() {
    const router = useRouter();
    const { isDark, colors } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.push('/(tabs)')}>
                    <Text style={[styles.skipText, { color: isDark ? `${Colors.text.dark}80` : `${Colors.text.light}80` }]}>
                        Salta
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingHorizontal: Spacing[6] }}
            >
                {/* Hero Visual: The Foggy Card */}
                <Animated.View entering={FadeInDown.duration(800)} style={styles.heroContainer}>
                    {/* Decorative background blob */}
                    <View style={[styles.decorativeBlob, { backgroundColor: `${Colors.primary.DEFAULT}1A` }]} />

                    <View style={[
                        styles.card,
                        {
                            backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                            borderColor: isDark ? Colors.stone[800] : Colors.stone[200],
                            boxShadow: Shadows.soft,
                        } as ViewStyle
                    ]}>
                        {/* Card Header */}
                        <View style={[styles.cardHeader, { borderBottomColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}>
                            <View style={styles.cardHeaderLeft}>
                                <View style={[styles.avatar, { borderColor: isDark ? Colors.stone[700] : Colors.white }]}>
                                    <Image
                                        source={{ uri: 'https://ui-avatars.com/api/?name=Alex&background=random' }}
                                        style={styles.avatarImage}
                                        contentFit="cover"
                                        transition={200}
                                    />
                                </View>
                                <View>
                                    <Text style={[styles.cardTitle, { color: isDark ? Colors.text.dark : Colors.text.light }]}>
                                        Diario di Alex
                                    </Text>
                                    <Text style={[styles.cardSubtitle, { color: isDark ? `${Colors.text.dark}99` : `${Colors.text.light}99` }]}>
                                        Oggi, 09:41
                                    </Text>
                                </View>
                            </View>
                            <Icon name="favorite" size={20} color={Colors.primary.DEFAULT} />
                        </View>

                        {/* Card Body (Simulated Diary) */}
                        <View style={styles.cardBody}>
                            <View style={styles.skeletonLines}>
                                <View style={[styles.skeletonLine, styles.skeletonLine75, { backgroundColor: isDark ? Colors.stone[700] : Colors.stone[100] }]} />
                                <View style={[styles.skeletonLine, styles.skeletonLine100, { backgroundColor: isDark ? Colors.stone[700] : Colors.stone[100] }]} />
                                <View style={[styles.skeletonLine, styles.skeletonLine85, { backgroundColor: isDark ? Colors.stone[700] : Colors.stone[100] }]} />
                                <View style={[styles.skeletonLine, styles.skeletonLine100, { backgroundColor: isDark ? Colors.stone[700] : Colors.stone[100] }]} />
                                <View style={[styles.skeletonImage, { backgroundColor: isDark ? `${Colors.stone[800]}80` : Colors.stone[50] }]} />
                            </View>

                            {/* The Foggy Effect Overlay */}
                            <BlurView intensity={20} tint="light" style={styles.blurOverlay}>
                                <View style={[styles.blurBackground, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)' }]} />
                                <View style={styles.lockContainer}>
                                    <View style={[
                                        styles.lockIcon,
                                        {
                                            backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                                            boxShadow: Shadows.lg,
                                        } as ViewStyle
                                    ]}>
                                        <Icon name="lock" size={32} color={Colors.primary.DEFAULT} />
                                    </View>
                                    <View style={[styles.lockBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)' }]}>
                                        <Text style={[styles.lockText, { color: isDark ? Colors.white : Colors.text.light }]}>
                                            Sblocca Domenica
                                        </Text>
                                    </View>
                                </View>
                            </BlurView>
                        </View>
                    </View>
                </Animated.View>

                {/* Text Content */}
                <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.textContainer}>
                    <Text selectable style={[styles.title, { color: isDark ? Colors.white : Colors.text.light }]}>
                        Mantieni il Mistero
                    </Text>
                    <Text selectable style={[styles.subtitle, { color: isDark ? `${Colors.text.dark}B3` : `${Colors.text.light}B3` }]}>
                        Le voci giornaliere del tuo partner restano nascoste fino alla fine della settimana.
                    </Text>
                </Animated.View>
            </ScrollView>

            {/* Bottom Navigation Area */}
            <View style={styles.bottomNav}>
                {/* Page Indicators */}
                <View style={styles.indicators}>
                    <View style={[styles.indicator, { backgroundColor: `${Colors.primary.DEFAULT}33` }]} />
                    <View style={[styles.indicatorActive, { backgroundColor: Colors.primary.DEFAULT, boxShadow: Shadows.soft } as ViewStyle]} />
                    <View style={[styles.indicator, { backgroundColor: `${Colors.primary.DEFAULT}33` }]} />
                </View>

                {/* Primary Action Button */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push('/onboarding/reveal')}
                    style={[
                        styles.button,
                        {
                            backgroundColor: isDark ? Colors.primary.dark : Colors.primary.DEFAULT,
                            boxShadow: `0px 10px 30px ${Colors.primary.DEFAULT}4D`,
                        } as ViewStyle
                    ]}
                >
                    <Text style={styles.buttonText}>Avanti</Text>
                    <Icon name="arrow-forward" size={20} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = {
    topBar: {
        alignItems: 'flex-end',
        paddingHorizontal: Spacing[6],
        paddingVertical: Spacing[4],
        zIndex: 10,
    } as ViewStyle,
    skipText: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        letterSpacing: 0.5,
    } as TextStyle,
    heroContainer: {
        width: '100%',
        marginTop: Spacing[2],
        marginBottom: Spacing[6],
        position: 'relative',
        maxWidth: 300,
    } as ViewStyle,
    decorativeBlob: {
        position: 'absolute',
        top: -40,
        left: -40,
        width: 256,
        height: 256,
        borderRadius: BorderRadius.full,
        zIndex: -1,
    } as ViewStyle,
    card: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
        borderWidth: 1,
        borderCurve: 'continuous',
    } as ViewStyle,
    cardHeader: {
        padding: Spacing[6],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    } as ViewStyle,
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[3],
    } as ViewStyle,
    avatar: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.stone[200],
        overflow: 'hidden',
        borderWidth: 2,
    } as ViewStyle,
    avatarImage: {
        width: '100%',
        height: '100%',
    } as ImageStyle,
    cardTitle: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
    } as TextStyle,
    cardSubtitle: {
        fontSize: FontSizes.xs,
    } as TextStyle,
    cardBody: {
        padding: Spacing[6],
        position: 'relative',
        flex: 1,
    } as ViewStyle,
    skeletonLines: {
        gap: Spacing[4],
    } as ViewStyle,
    skeletonLine: {
        height: 16,
        borderRadius: BorderRadius.sm,
    } as ViewStyle,
    skeletonLine75: {
        width: '75%',
    } as ViewStyle,
    skeletonLine100: {
        width: '100%',
    } as ViewStyle,
    skeletonLine85: {
        width: '85%',
    } as ViewStyle,
    skeletonImage: {
        marginTop: Spacing[6],
        height: 128,
        width: '100%',
        borderRadius: BorderRadius.xl,
    } as ViewStyle,
    blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    } as ViewStyle,
    blurBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    } as ViewStyle,
    lockContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing[6],
    } as ViewStyle,
    lockIcon: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing[4],
    } as ViewStyle,
    lockBadge: {
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[2],
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    } as ViewStyle,
    lockText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
    } as TextStyle,
    textContainer: {
        width: '100%',
        alignItems: 'center',
        gap: Spacing[3],
        marginBottom: Spacing[6],
    } as ViewStyle,
    title: {
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
    } as TextStyle,
    subtitle: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        lineHeight: FontSizes.sm * 1.625,
        textAlign: 'center',
        maxWidth: 280,
    } as TextStyle,
    bottomNav: {
        width: '100%',
        paddingHorizontal: Spacing[6],
        paddingBottom: Spacing[8],
        paddingTop: Spacing[4],
        alignItems: 'center',
        gap: Spacing[8],
    } as ViewStyle,
    indicators: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[3],
    } as ViewStyle,
    indicator: {
        height: 10,
        width: 10,
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    indicatorActive: {
        height: 10,
        width: 32,
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    button: {
        width: '100%',
        paddingVertical: Spacing[4],
        borderRadius: BorderRadius.full,
        borderCurve: 'continuous',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    buttonText: {
        color: Colors.white,
        fontSize: FontSizes.lg,
        fontWeight: '700',
        marginRight: Spacing[2],
        textAlign: 'center',
    } as TextStyle,
};
