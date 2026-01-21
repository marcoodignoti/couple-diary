import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StatusBar, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton, AuthContainer, AuthInput } from '../../components/ui/AuthComponents';
import { Icon } from '../../components/ui/Icon';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';

const ONBOARDING_STEPS = [
    { type: 'slide', title: "La Distanza", description: "Quando l'amore supera i chilometri. Scrivi messaggi segreti al tuo partner, anche quando siete lontani.", emoji: "✈️" },
    { type: 'slide', title: "Il Diario Segreto", description: "Scrivi i tuoi pensieri più intimi. I messaggi restano nascosti nella nebbia fino al momento perfetto.", emoji: "📖" },
    { type: 'login' }     // Login/Register
];

export default function WelcomeScreen() {
    const router = useRouter();
    const { signIn, signUp, isLoading } = useAuthStore();
    const [currentScreen, setCurrentScreen] = useState(0);
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const currentStep = ONBOARDING_STEPS[currentScreen];
    const isLoginScreen = currentStep.type === 'login';

    const handleAuth = async () => {
        try {
            if (isRegistering) {
                await signUp(email, password, name);
            } else {
                await signIn(email, password);
            }
            router.replace('/(tabs)');
        } catch (error) {
            console.error(error);
        }
    };

    const handleNext = useCallback(() => {
        if (currentScreen < ONBOARDING_STEPS.length - 1) {
            Haptics.selectionAsync();
            setCurrentScreen(prev => prev + 1);
        }
    }, [currentScreen]);

    const handleBack = useCallback(() => {
        if (currentScreen > 0) {
            Haptics.selectionAsync();
            setCurrentScreen(prev => prev - 1);
        }
    }, [currentScreen]);

    const handleSkip = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setCurrentScreen(ONBOARDING_STEPS.length - 1);
    }, []);

    const renderSlide = (step: any, index: number) => {
        if (currentScreen !== index) return null;

        if (step.type === 'slide') {
            return (
                <View key={index} style={styles.slide}>
                    <Text style={styles.slideEmoji}>{step.emoji}</Text>
                    <Text style={styles.slideTitle}>{step.title}</Text>
                    <Text style={styles.slideDescription}>{step.description}</Text>
                </View>
            );
        }

        return (
            <AuthContainer
                key={index}
                title={isRegistering ? "Crea Account" : "Bentornati"}
                subtitle={isRegistering ? "Inizia il vostro viaggio" : "Continua a scrivere la vostra storia"}
            >
                <View style={{ gap: Spacing[2] }}>
                    {isRegistering && (
                        <AuthInput
                            label="Nome"
                            value={name}
                            onChangeText={setName}
                            placeholder="Il tuo nome"
                        />
                    )}
                    <AuthInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="tuo@email.com"
                        keyboardType="email-address"
                    />
                    <AuthInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry
                    />

                    <View style={{ marginTop: Spacing[4], gap: Spacing[2] }}>
                        <AuthButton
                            title={isRegistering ? "Registrati" : "Accedi"}
                            onPress={handleAuth}
                            loading={isLoading}
                        />
                        <AuthButton
                            title={isRegistering ? "Hai già un account? Accedi" : "Nuovi qui? Registrati"}
                            onPress={() => setIsRegistering(!isRegistering)}
                            variant="secondary"
                        />
                    </View>
                </View>
            </AuthContainer>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" />

            {/* Slides Container */}
            <View style={styles.slidesContainer}>
                {ONBOARDING_STEPS.map((step, index) => renderSlide(step, index))}
            </View>

            {/* Navigation Controls (Hidden on Login Screen) */}
            {!isLoginScreen && currentStep.type === 'slide' && (
                <View style={styles.navigationContainer}>
                    <View style={styles.dotsContainer}>
                        {ONBOARDING_STEPS.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentScreen === index ? styles.activeDot : styles.inactiveDot
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.buttonsRow}>
                        {currentScreen === 0 ? (
                            <TouchableOpacity onPress={handleSkip} style={styles.textButton}>
                                <Text style={styles.textButtonLabel}>Salta</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={handleBack} style={styles.textButton}>
                                <Icon name="chevron-left" size={24} color={Colors.stone[400]} />
                                <Text style={styles.textButtonLabel}>Indietro</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={handleNext}
                            style={styles.primaryButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>Avanti</Text>
                            <Icon name="chevron-right" size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Back button for Interactive Slides if needed (optional UX choice) */}
            {!isLoginScreen && currentStep.type !== 'slide' && (
                <View style={styles.topNavigation}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButtonCircle}>
                        <Icon name="chevron-left" size={24} color={Colors.stone[500]} />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing[8],
        backgroundColor: Colors.background.light,
    } as ViewStyle,
    slideEmoji: {
        fontSize: 80,
        marginBottom: Spacing[8],
    } as TextStyle,
    slideTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.text.light,
        textAlign: 'center',
        marginBottom: Spacing[4],
    } as TextStyle,
    slideDescription: {
        fontSize: 18,
        color: Colors.stone[500],
        textAlign: 'center',
        lineHeight: 26,
    } as TextStyle,
    container: {
        flex: 1,
        backgroundColor: Colors.background.light,
    } as ViewStyle,
    slidesContainer: {
        flex: 1,
        position: 'relative',
    } as ViewStyle,
    navigationContainer: {
        paddingHorizontal: Spacing[6],
        paddingBottom: Spacing[4],
        backgroundColor: 'transparent',
    } as ViewStyle,
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: Spacing[6],
        gap: Spacing[2],
    } as ViewStyle,
    dot: {
        height: 8,
        borderRadius: 4,
    } as ViewStyle,
    activeDot: {
        width: 24,
        backgroundColor: Colors.primary.DEFAULT,
    } as ViewStyle,
    inactiveDot: {
        width: 8,
        backgroundColor: Colors.stone[300],
    } as ViewStyle,
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    } as ViewStyle,
    textButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing[2],
    } as ViewStyle,
    textButtonLabel: {
        fontSize: FontSizes.base,
        color: Colors.stone[500],
        fontWeight: '500',
    } as TextStyle,
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary.DEFAULT,
        paddingHorizontal: Spacing[6],
        paddingVertical: 12,
        borderRadius: BorderRadius.full,
        gap: Spacing[1],
        boxShadow: `0px 4px 8px ${Colors.primary.DEFAULT}4D`, // 30% opacity of primary color
        elevation: 4,
    } as ViewStyle,
    primaryButtonText: {
        color: Colors.white,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        marginLeft: Spacing[1],
    } as TextStyle,
    topNavigation: {
        position: 'absolute',
        top: 60, // approximate status bar + margin
        left: Spacing[4],
        zIndex: 10,
    } as ViewStyle,
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 2,
    } as ViewStyle,
});
