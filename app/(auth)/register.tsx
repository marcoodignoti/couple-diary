import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { AuthButton, AuthContainer, AuthInput } from '../../components/ui/AuthComponents';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { signUp, isLoading, clearError } = useAuthStore();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Errore', 'Compila tutti i campi');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Errore', 'Le password non coincidono');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Errore', 'La password deve avere almeno 6 caratteri');
            return;
        }

        await signUp(email, password, name);

        const currentError = useAuthStore.getState().error;
        if (currentError) {
            Alert.alert('Errore', currentError);
            clearError();
        } else {
            // Go to pairing screen after registration
            router.replace('/onboarding/invite' as any);
        }
    };

    return (
        <AuthContainer
            title="Iniziamo!"
            subtitle="Crea il tuo account per iniziare a scrivere"
        >
            <AuthInput
                label="Il tuo nome"
                value={name}
                onChangeText={setName}
                placeholder="Come ti chiami?"
                autoCapitalize="words"
            />

            <AuthInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="la@tua.email"
                keyboardType="email-address"
            />

            <AuthInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Almeno 6 caratteri"
                secureTextEntry
            />

            <AuthInput
                label="Conferma Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Ripeti la password"
                secureTextEntry
            />

            <View style={{ marginTop: 12 }}>
                <AuthButton
                    title="Crea Account"
                    onPress={handleRegister}
                    loading={isLoading}
                />

                <AuthButton
                    title="Hai già un account? Accedi"
                    onPress={() => router.push('/(auth)/login')}
                    variant="secondary"
                />
            </View>
        </AuthContainer>
    );
}
