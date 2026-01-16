import { router } from 'expo-router';
import Head from 'expo-router/head';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Landing page for web version
 * Shows marketing content and CTA to login/register
 */
export function LandingPage() {
    return (
        <>
            <Head>
                <title>Couple Diary - Diario di Coppia a Distanza</title>
                <meta name="description" content="Un diario intimo per coppie a distanza. Scrivi ogni giorno, scopri i pensieri del partner la domenica." />
                <meta property="og:title" content="Couple Diary - Diario Condiviso" />
                <meta property="og:description" content="Il modo più dolce per sentirsi vicini anche quando si è lontani." />
                <meta property="og:image" content="/assets/images/icon.png" />
            </Head>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <Text style={styles.emoji}>💕</Text>
                    <Text style={styles.title}>Couple Diary</Text>
                    <Text style={styles.subtitle}>
                        Un diario intimo per coppie a distanza
                    </Text>
                    <Text style={styles.description}>
                        Scrivi ogni giorno i tuoi pensieri per il tuo amore.{'\n'}
                        Scopriteli insieme ogni domenica. ✨
                    </Text>

                    <View style={styles.ctaContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push('/(auth)/register')}
                        >
                            <Text style={styles.primaryButtonText}>Inizia Gratis</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text style={styles.secondaryButtonText}>Accedi</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Features Section */}
                <View style={styles.features}>
                    <Text style={styles.sectionTitle}>Come Funziona</Text>

                    <View style={styles.featureGrid}>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureEmoji}>✍️</Text>
                            <Text style={styles.featureTitle}>Scrivi Ogni Giorno</Text>
                            <Text style={styles.featureText}>
                                Condividi i tuoi pensieri, ricordi e momenti speciali
                            </Text>
                        </View>

                        <View style={styles.featureCard}>
                            <Text style={styles.featureEmoji}>🌫️</Text>
                            <Text style={styles.featureTitle}>Effetto Nebbia</Text>
                            <Text style={styles.featureText}>
                                Le voci del partner sono offuscate durante la settimana
                            </Text>
                        </View>

                        <View style={styles.featureCard}>
                            <Text style={styles.featureEmoji}>🎁</Text>
                            <Text style={styles.featureTitle}>Rivelazione Domenicale</Text>
                            <Text style={styles.featureText}>
                                Ogni domenica si sbloccano le voci della settimana
                            </Text>
                        </View>

                        <View style={styles.featureCard}>
                            <Text style={styles.featureEmoji}>💌</Text>
                            <Text style={styles.featureTitle}>Reazioni</Text>
                            <Text style={styles.featureText}>
                                Lascia cuori e commenti sulle voci del tuo amore
                            </Text>
                        </View>
                    </View>
                </View>

                {/* How It Works */}
                <View style={styles.howItWorks}>
                    <Text style={styles.sectionTitle}>Un'Esperienza Unica</Text>
                    <View style={styles.stepsList}>
                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Collegati al Partner</Text>
                                <Text style={styles.stepText}>
                                    Condividi un codice segreto per collegare i vostri diari
                                </Text>
                            </View>
                        </View>

                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Scrivi Liberamente</Text>
                                <Text style={styles.stepText}>
                                    Racconta la tua giornata, i tuoi pensieri, le tue emozioni
                                </Text>
                            </View>
                        </View>

                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Attendi la Domenica</Text>
                                <Text style={styles.stepText}>
                                    Leggete insieme le voci della settimana
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer CTA */}
                <View style={styles.footerCta}>
                    <Text style={styles.footerTitle}>Pronto a iniziare?</Text>
                    <Text style={styles.footerText}>
                        Unisciti a Couple Diary e rendi speciale ogni giorno
                    </Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push('/(auth)/register')}
                    >
                        <Text style={styles.primaryButtonText}>Crea il Tuo Diario</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerLink}>💕 Couple Diary</Text>
                    <Text style={styles.copyright}>
                        Fatto con amore • {new Date().getFullYear()}
                    </Text>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6',
    },
    content: {
        minHeight: '100%',
    },
    // Hero
    hero: {
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 24,
        backgroundColor: 'linear-gradient(180deg, #FAF9F6 0%, #FFF5F6 100%)',
    },
    emoji: {
        fontSize: 72,
        marginBottom: 24,
    },
    title: {
        fontSize: 48,
        fontWeight: '800',
        color: '#2C3E50',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 24,
        color: '#E8B4B8',
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 18,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 28,
        maxWidth: 500,
        marginBottom: 40,
    },
    ctaContainer: {
        flexDirection: process.env.EXPO_OS === 'web' ? 'row' : 'column',
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#E8B4B8',
        paddingHorizontal: 32,
        paddingVertical: 18,
        borderRadius: 16,
        boxShadow: '0px 4px 12px rgba(232, 180, 184, 0.3)',
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: 32,
        paddingVertical: 18,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E8B4B8',
    },
    secondaryButtonText: {
        color: '#E8B4B8',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    // Features
    features: {
        paddingVertical: 80,
        paddingHorizontal: 24,
        backgroundColor: '#FFF',
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: 48,
    },
    featureGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 24,
        maxWidth: 900,
        alignSelf: 'center',
    },
    featureCard: {
        backgroundColor: '#FAF9F6',
        borderRadius: 20,
        padding: 32,
        width: process.env.EXPO_OS === 'web' ? 400 : '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    featureEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 8,
        textAlign: 'center',
    },
    featureText: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 24,
    },
    // How it works
    howItWorks: {
        paddingVertical: 80,
        paddingHorizontal: 24,
        backgroundColor: '#FAF9F6',
    },
    stepsList: {
        maxWidth: 600,
        alignSelf: 'center',
        gap: 32,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 20,
    },
    stepNumber: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E8B4B8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 8,
    },
    stepText: {
        fontSize: 16,
        color: '#7F8C8D',
        lineHeight: 24,
    },
    // Footer CTA
    footerCta: {
        paddingVertical: 80,
        paddingHorizontal: 24,
        backgroundColor: '#FFF',
        alignItems: 'center',
    },
    footerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 16,
        textAlign: 'center',
    },
    footerText: {
        fontSize: 18,
        color: '#7F8C8D',
        marginBottom: 32,
        textAlign: 'center',
    },
    // Footer
    footer: {
        paddingVertical: 40,
        paddingHorizontal: 24,
        backgroundColor: '#2C3E50',
        alignItems: 'center',
    },
    footerLink: {
        fontSize: 18,
        color: '#E8B4B8',
        fontWeight: '600',
        marginBottom: 8,
    },
    copyright: {
        fontSize: 14,
        color: '#7F8C8D',
    },
});

export default LandingPage;
