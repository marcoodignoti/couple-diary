import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StatusBar, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginScreen } from '../../components/onboarding/LoginScreen';
import { OnboardingSlide } from '../../components/onboarding/OnboardingSlide';
import { Icon } from '../../components/ui/Icon';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../constants/theme';

// Full Italian translations from LanguageContext via implementation plan 
const ONBOARDING_DATA = [
    {
        title: "La Distanza",
        description: "Quando l'amore supera i chilometri. Scrivi messaggi segreti al tuo partner, anche quando siete lontani. Un ponte digitale tra i vostri cuori.",
        image: require('../../assets/images/onboarding-distance.png'),
    },
    {
        title: "Il Diario Segreto",
        description: "Scrivi i tuoi pensieri più intimi. I messaggi restano nascosti nella nebbia fino al momento perfetto. Solo voi due saprete cosa contengono.",
        image: require('../../assets/images/onboarding-diary.png'),
    },
    {
        title: "La Domenica",
        description: "Ogni domenica, la magia si svela. I messaggi segreti vengono rivelati insieme, creando momenti speciali da condividere.",
        image: require('../../assets/images/onboarding-reveal.png'),
    },
    {
        title: "Giorni Speciali",
        description: "Programma sorprese per compleanni, anniversari e momenti importanti. I tuoi messaggi appariranno esattamente quando vuoi tu.",
        image: require('../../assets/images/onboarding-calendar.png'),
    },
];

export default function WelcomeScreen() {
    const router = useRouter();
    const [currentScreen, setCurrentScreen] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right' | 'none'>('none');

    const totalScreens = ONBOARDING_DATA.length + 1; // Slides + Login Screen
    const isLoginScreen = currentScreen === ONBOARDING_DATA.length;

    const handleNext = useCallback(() => {
        if (currentScreen < totalScreens - 1) {
            setDirection('left');
            Haptics.selectionAsync();
            setCurrentScreen(prev => prev + 1);
        }
    }, [currentScreen, totalScreens]);

    const handleBack = useCallback(() => {
        if (currentScreen > 0) {
            setDirection('right');
            Haptics.selectionAsync();
            setCurrentScreen(prev => prev - 1);
        }
    }, [currentScreen]);

    const handleSkip = useCallback(() => {
        setDirection('left');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setCurrentScreen(totalScreens - 1); // Go to login
    }, [totalScreens]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" />

            {/* Slides Container */}
            <View style={styles.slidesContainer}>
                {ONBOARDING_DATA.map((slide, index) => (
                    <OnboardingSlide
                        key={index}
                        index={index}
                        title={slide.title}
                        description={slide.description}
                        image={slide.image}
                        isActive={currentScreen === index}
                        direction={currentScreen > index ? 'left' : currentScreen < index ? 'right' : 'none'}
                    />
                ))}

                {/* Login Screen Overlay */}
                <LoginScreen isActive={isLoginScreen} />
            </View>

            {/* Navigation Controls (Hidden on Login Screen) */}
            {!isLoginScreen && (
                <View style={styles.navigationContainer}>
                    {/* Progress Dots */}
                    <View style={styles.dotsContainer}>
                        {Array.from({ length: totalScreens }).map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentScreen === index ? styles.activeDot : styles.inactiveDot
                                ]}
                            />
                        ))}
                    </View>

                    {/* Bottom Buttons */}
                    <View style={styles.buttonsRow}>
                        {/* Left Button (Skip or Back) */}
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

                        {/* Right Button (Next or Inizia) */}
                        <TouchableOpacity
                            onPress={handleNext}
                            style={styles.primaryButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>
                                {currentScreen === ONBOARDING_DATA.length - 1 ? 'Inizia' : 'Avanti'}
                            </Text>
                            <Icon name="chevron-right" size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.light,
    } as ViewStyle,
    slidesContainer: {
        flex: 1,
        position: 'relative',
        // Make sure slides take full space
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
        paddingVertical: 12, // Custom height for consistency
        borderRadius: BorderRadius.full,
        gap: Spacing[1],
        shadowColor: Colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    } as ViewStyle,
    primaryButtonText: {
        color: Colors.white,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        marginLeft: Spacing[1],
    } as TextStyle,
});
