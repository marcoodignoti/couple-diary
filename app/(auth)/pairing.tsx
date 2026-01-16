import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthButton, AuthContainer, AuthInput } from '../../components/ui/AuthComponents';
import { connectWithCode, createPairingCode, getCurrentPairingCode } from '../../services/pairingService';
import { useAuthStore } from '../../stores/authStore';

export default function PairingScreen() {
    const [mode, setMode] = useState<'choose' | 'generate' | 'enter'>('choose');
    const [pairingCode, setPairingCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user, fetchPartner } = useAuthStore();

    useEffect(() => {
        // Check for existing code on mount
        if (user?.id) {
            checkExistingCode();
        }
    }, [user?.id]);

    const checkExistingCode = async () => {
        if (!user?.id) return;
        try {
            const existingCode = await getCurrentPairingCode(user.id);
            if (existingCode) {
                setPairingCode(existingCode);
                setMode('generate');
            }
        } catch (error) {
            console.error('Error checking existing code');
        }
    };

    const handleGenerateCode = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        try {
            const code = await createPairingCode(user.id);
            setPairingCode(code);
            setMode('generate');
        } catch (error) {
            Alert.alert('Errore', 'Impossibile generare il codice. Riprova.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnectWithCode = async () => {
        if (!user?.id || !inputCode) return;

        if (inputCode.length !== 6) {
            Alert.alert('Errore', 'Il codice deve essere di 6 caratteri');
            return;
        }

        setIsLoading(true);
        try {
            await connectWithCode(user.id, inputCode);
            await fetchPartner();
            Alert.alert('Connesso! 💕', 'Ora siete collegati. Buona scrittura!');
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert('Errore', 'Codice non valido o scaduto. Riprova.');
        } finally {
            setIsLoading(false);
        }
    };

    const skipPairing = () => {
        router.replace('/(tabs)');
    };

    if (mode === 'choose') {
        return (
            <AuthContainer
                title="Collega il Partner"
                subtitle="Per condividere il diario, collegati al tuo amore"
            >
                <View style={styles.choiceContainer}>
                    <TouchableOpacity
                        style={styles.choiceCard}
                        onPress={handleGenerateCode}
                    >
                        <Text style={styles.choiceEmoji}>📤</Text>
                        <Text style={styles.choiceTitle}>Genera un codice</Text>
                        <Text style={styles.choiceDesc}>
                            Crea un codice da condividere con il tuo partner
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.choiceCard}
                        onPress={() => setMode('enter')}
                    >
                        <Text style={styles.choiceEmoji}>📥</Text>
                        <Text style={styles.choiceTitle}>Inserisci un codice</Text>
                        <Text style={styles.choiceDesc}>
                            Hai ricevuto un codice dal tuo partner?
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={skipPairing} style={styles.skipButton}>
                    <Text style={styles.skipText}>Salta per ora</Text>
                </TouchableOpacity>
            </AuthContainer>
        );
    }

    if (mode === 'generate') {
        return (
            <AuthContainer
                title="Il tuo codice"
                subtitle="Condividi questo codice con il tuo partner"
            >
                <View style={styles.codeContainer}>
                    <Text style={styles.codeDisplay}>{pairingCode}</Text>
                    <Text style={styles.codeHint}>
                        Il codice scade tra 24 ore
                    </Text>
                </View>

                <View style={styles.waitingContainer}>
                    <Text style={styles.waitingEmoji}>⏳</Text>
                    <Text style={styles.waitingText}>
                        Quando il tuo partner inserisce il codice,
                        verrete collegati automaticamente!
                    </Text>
                </View>

                <AuthButton
                    title="Vai alla Home"
                    onPress={skipPairing}
                    variant="secondary"
                />
            </AuthContainer>
        );
    }

    return (
        <AuthContainer
            title="Inserisci il codice"
            subtitle="Inserisci il codice ricevuto dal tuo partner"
        >
            <AuthInput
                label="Codice Partner"
                value={inputCode}
                onChangeText={(text) => setInputCode(text.toUpperCase())}
                placeholder="Es: ABC123"
                autoCapitalize="characters"
            />

            <View style={{ marginTop: 12 }}>
                <AuthButton
                    title="Connetti 💕"
                    onPress={handleConnectWithCode}
                    loading={isLoading}
                />

                <AuthButton
                    title="Indietro"
                    onPress={() => setMode('choose')}
                    variant="secondary"
                />
            </View>
        </AuthContainer>
    );
}

const styles = StyleSheet.create({
    choiceContainer: {
        gap: 16,
        marginBottom: 24,
    },
    choiceCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(232, 180, 184, 0.3)',
        shadowColor: '#E8B4B8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    choiceEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    choiceTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 8,
    },
    choiceDesc: {
        fontSize: 14,
        color: '#7F8C8D',
        textAlign: 'center',
    },
    skipButton: {
        alignItems: 'center',
        padding: 16,
    },
    skipText: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    codeContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#E8B4B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    codeDisplay: {
        fontSize: 40,
        fontWeight: '700',
        color: '#E8B4B8',
        letterSpacing: 8,
    },
    codeHint: {
        fontSize: 12,
        color: '#7F8C8D',
        marginTop: 12,
    },
    waitingContainer: {
        alignItems: 'center',
        padding: 24,
        marginBottom: 24,
    },
    waitingEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    waitingText: {
        fontSize: 14,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 22,
    },
});
