import { Icon } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../hooks/useTheme';
import { Colors, BorderRadius, FontSizes, Spacing, Shadows } from '../../constants/theme';

export default function WelcomeScreen() {
    const router = useRouter();
    const { isDark, colors } = useTheme();

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ flexGrow: 1 }}
        >
            <View style={styles.container}>
                {/* Background Decorative Elements */}
                <View style={[styles.decorativeCircle1, { backgroundColor: `${Colors.primary.DEFAULT}1A` }]} />
                <View style={[styles.decorativeCircle2, { backgroundColor: `${Colors.primary.DEFAULT}0D` }]} />

                {/* Hero Illustration Area */}
                <Animated.View
                    entering={FadeIn.duration(1000)}
                    style={styles.heroContainer}
                >
                    <View style={styles.heartContainer}>
                        {/* Abstract Heart Glow */}
                        <View style={[styles.heartGlow, { backgroundColor: `${Colors.primary.DEFAULT}33` }]} />

                        {/* Main Heart Icon */}
                        <View style={styles.iconContainer}>
                            <Icon name="favorite" size={160} color={Colors.primary.DEFAULT} />

                            {/* Floating Elements */}
                            <Animated.View
                                entering={FadeInDown.delay(500).springify()}
                                style={styles.floatingHeart1}
                            >
                                <Icon name="favorite" size={32} color={`${Colors.primary.DEFAULT}99`} />
                            </Animated.View>
                            <Animated.View
                                entering={FadeInDown.delay(700).springify()}
                                style={styles.floatingHeart2}
                            >
                                <Icon name="favorite" size={24} color={`${Colors.primary.DEFAULT}66`} />
                            </Animated.View>
                        </View>
                    </View>
                </Animated.View>

                {/* Text Content */}
                <Animated.View
                    entering={FadeInDown.delay(300).duration(800)}
                    style={styles.textContainer}
                >
                    <Text
                        selectable
                        style={[
                            styles.title,
                            { color: isDark ? Colors.white : Colors.text.light }
                        ]}
                    >
                        Uno Spazio per Due
                    </Text>
                    <Text
                        selectable
                        style={[
                            styles.subtitle,
                            { color: isDark ? Colors.stone[400] : `${Colors.text.light}B3` }
                        ]}
                    >
                        Condividi i tuoi pensieri ogni giorno, e riscopri il tuo partner ogni Domenica.
                    </Text>
                </Animated.View>

                {/* Action Button */}
                <Animated.View
                    entering={FadeInDown.delay(600).duration(800)}
                    style={styles.buttonContainer}
                >
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => router.push('/onboarding/secret')}
                        style={[
                            styles.button,
                            {
                                backgroundColor: isDark ? Colors.primary.dark : Colors.primary.DEFAULT,
                                boxShadow: `0px 10px 30px ${Colors.primary.DEFAULT}4D`,
                            } as ViewStyle
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            Inizia Ora
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </ScrollView>
    );
}

const styles = {
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: Spacing[6],
    } as ViewStyle,
    decorativeCircle1: {
        position: 'absolute',
        top: -80,
        right: -80,
        width: 256,
        height: 256,
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    decorativeCircle2: {
        position: 'absolute',
        top: '33%',
        left: -80,
        width: 320,
        height: 320,
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    heroContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 300,
    } as ViewStyle,
    heartContainer: {
        position: 'relative',
        width: 240,
        height: 240,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    heartGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    iconContainer: {
        position: 'relative',
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    floatingHeart1: {
        position: 'absolute',
        top: -8,
        right: 16,
        transform: [{ rotate: '12deg' }],
    } as ViewStyle,
    floatingHeart2: {
        position: 'absolute',
        bottom: 16,
        left: -8,
        transform: [{ rotate: '-12deg' }],
    } as ViewStyle,
    textContainer: {
        width: '100%',
        alignItems: 'center',
        gap: Spacing[4],
        marginBottom: Spacing[12],
    } as ViewStyle,
    title: {
        fontSize: FontSizes['4xl'],
        fontWeight: '700',
        letterSpacing: -0.5,
        lineHeight: FontSizes['4xl'] * 1.1,
        textAlign: 'center',
    } as TextStyle,
    subtitle: {
        fontSize: FontSizes.lg,
        fontWeight: '500',
        lineHeight: FontSizes.lg * 1.625,
        textAlign: 'center',
        maxWidth: 280,
    } as TextStyle,
    buttonContainer: {
        width: '100%',
        paddingBottom: Spacing[8],
    } as ViewStyle,
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
