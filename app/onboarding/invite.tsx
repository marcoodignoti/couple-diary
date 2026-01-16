import { Icon } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, Clipboard, Image, ImageStyle, ScrollView, Share, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSpring } from 'react-native-reanimated';

import { useTheme } from '../../hooks/useTheme';
import { Colors, BorderRadius, FontSizes, Spacing, Shadows } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';

export default function OnboardingInvite() {
    const router = useRouter();
    const { pairingCode, generatePairingCode } = useAuthStore();
    const { isDark, colors } = useTheme();

    const pulse = useSharedValue(1);

    // Animated style for the pulse effect on the code
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulse.value }],
        };
    });

    useEffect(() => {
        if (!pairingCode) {
            generatePairingCode();
        }

        // Start the pulse animation when the component mounts
        pulse.value = withRepeat(
            withSpring(1.05, { damping: 10, stiffness: 100 }),
            -1,
            true
        );
    }, [pairingCode]);

    const copyToClipboard = () => {
        if (pairingCode) {
            Clipboard.setString(pairingCode);
            Alert.alert("Copiato!", "Codice copiato negli appunti.");
        }
    };

    const shareCode = async () => {
        try {
            await Share.share({
                message: `Unisciti a me su Couple Diary! Ecco il nostro codice: ${pairingCode} `,
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: Spacing[6] }}
        >
            {/* Header Section */}
            <View style={styles.headerSection}>
                <View style={[styles.imageContainer, { boxShadow: Shadows.sm } as ViewStyle]}>
                    <Image
                        source={{ uri: "https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=2080&auto=format&fit=crop" }}
                        style={styles.headerImage}
                        resizeMode="cover"
                    />
                    <View style={[styles.imageOverlay, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]} />
                </View>

                <Text selectable style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.text.light }]}>
                    Collega i vostri cuori
                </Text>
                <Text selectable style={[styles.headerSubtitle, { color: isDark ? 'rgba(255,255,255,0.7)' : `${Colors.text.light}B3` }]}>
                    Condividi questo codice con il tuo partner per iniziare il vostro diario condiviso.
                </Text>
            </View>

            {/* Main Card Section */}
            <View style={styles.mainSection}>
                {/* Code Card */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.cardWrapper}>
                    <View style={[
                        styles.card,
                        {
                            backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                            borderColor: isDark ? Colors.stone[800] : Colors.stone[200],
                            boxShadow: Shadows.sm,
                        } as ViewStyle
                    ]}>
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : `${Colors.text.light}80` }]}>
                                Il tuo Codice Unico
                            </Text>

                            <View style={styles.codeContainer}>
                                <Text selectable style={styles.codeText}>
                                    {pairingCode}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={copyToClipboard}
                            style={[styles.copyButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.background.light }]}
                        >
                            <Icon name="content-copy" size={20} color={Colors.primary.DEFAULT} />
                            <Text style={styles.copyButtonText}>Copia Codice</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={shareCode}
                        style={[
                            styles.shareButton,
                            { boxShadow: Shadows.soft } as ViewStyle
                        ]}
                    >
                        <Icon name="share" size={24} color={Colors.white} style={{ marginRight: Spacing[2] }} />
                        <Text style={styles.shareButtonText}>Condividi Link</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/onboarding/enter-code' as any)}
                        style={styles.secondaryButton}
                    >
                        <Text style={[styles.secondaryButtonText, { color: isDark ? 'rgba(255,255,255,0.6)' : `${Colors.text.light}99` }]}>
                            Hai già un codice? Inseriscilo qui
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = {
    headerSection: {
        width: '100%',
        alignItems: 'center',
        paddingTop: Spacing[8],
        paddingHorizontal: Spacing[4],
        paddingBottom: Spacing[4],
    } as ViewStyle,
    imageContainer: {
        width: '100%',
        maxWidth: 480,
        aspectRatio: 16 / 9,
        borderRadius: BorderRadius.xl,
        borderCurve: 'continuous',
        overflow: 'hidden',
        marginBottom: Spacing[6],
        position: 'relative',
        backgroundColor: Colors.stone[200],
    } as ViewStyle,
    headerImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    } as ImageStyle,
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.3,
    } as ViewStyle,
    headerTitle: {
        fontSize: FontSizes['2xl'],
        fontWeight: '800',
        lineHeight: FontSizes['2xl'] * 1.2,
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: Spacing[2],
    } as TextStyle,
    headerSubtitle: {
        fontSize: FontSizes.base,
        fontWeight: '500',
        lineHeight: FontSizes.base * 1.5,
        textAlign: 'center',
        maxWidth: 320,
    } as TextStyle,
    mainSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        paddingHorizontal: Spacing[4],
        gap: Spacing[6],
    } as ViewStyle,
    cardWrapper: {
        width: '100%',
        maxWidth: 480,
    } as ViewStyle,
    card: {
        borderRadius: 32,
        borderCurve: 'continuous',
        padding: Spacing[8],
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing[6],
        borderWidth: 1,
    } as ViewStyle,
    cardContent: {
        alignItems: 'center',
        gap: Spacing[2],
    } as ViewStyle,
    cardLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    } as TextStyle,
    codeContainer: {
        alignItems: 'center',
    } as ViewStyle,
    codeText: {
        color: Colors.primary.DEFAULT,
        fontSize: FontSizes['5xl'],
        fontWeight: '800',
        letterSpacing: 4,
        lineHeight: FontSizes['5xl'] * 1.2,
        textAlign: 'center',
    } as TextStyle,
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing[2],
        paddingHorizontal: Spacing[6],
        paddingVertical: Spacing[2.5],
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    copyButtonText: {
        color: Colors.primary.DEFAULT,
        fontWeight: '700',
        fontSize: FontSizes.sm,
        letterSpacing: 0.5,
    } as TextStyle,
    actionsContainer: {
        width: '100%',
        maxWidth: 480,
        gap: Spacing[4],
        marginTop: Spacing[4],
    } as ViewStyle,
    shareButton: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.full,
        borderCurve: 'continuous',
        height: 56,
        paddingHorizontal: Spacing[6],
        backgroundColor: Colors.secondary.DEFAULT,
    } as ViewStyle,
    shareButtonText: {
        color: Colors.white,
        fontSize: FontSizes.lg,
        fontWeight: '700',
        letterSpacing: 0.5,
    } as TextStyle,
    secondaryButton: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.full,
        height: 48,
        paddingHorizontal: Spacing[4],
        backgroundColor: 'transparent',
    } as ViewStyle,
    secondaryButtonText: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
    } as TextStyle,
};
