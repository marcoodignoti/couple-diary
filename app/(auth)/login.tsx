import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { AuthButton, AuthContainer, AuthInput } from '../../components/ui/AuthComponents';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, isLoading, error, clearError } = useAuthStore();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Errore', 'Inserisci email e password');
            return;
        }

        await signIn(email, password);

        const currentError = useAuthStore.getState().error;
        if (currentError) {
            Alert.alert('Errore', currentError);
            clearError();
        } else {
            router.replace('/(tabs)');
        }
    };

    return (
        <AuthContainer
            title="Bentornato!"
            subtitle="Accedi per vedere cosa ha scritto il tuo amore"
        >
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
                placeholder="••••••••"
                secureTextEntry
            />

            <View style={{ marginTop: 12 }}>
                <AuthButton
                    title="Accedi"
                    onPress={handleLogin}
                    loading={isLoading}
                />

                <AuthButton
                    title="Non hai un account? Registrati"
                    onPress={() => router.push('/(auth)/register')}
                    variant="secondary"
                />
            </View>
        </AuthContainer>
    );
}
