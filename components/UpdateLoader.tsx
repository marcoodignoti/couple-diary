import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/theme';
import { Icon } from './ui/Icon';

interface UpdateLoaderProps {
    onFinish: () => void;
}

export function UpdateLoader({ onFinish }: UpdateLoaderProps) {
    const [status, setStatus] = useState<string>('Controllo aggiornamenti...');

    useEffect(() => {
        async function checkUpdates() {
            try {
                if (__DEV__) {
                    // Skip in development
                    onFinish();
                    return;
                }

                const update = await Updates.checkForUpdateAsync();

                if (update.isAvailable) {
                    setStatus('Scaricamento nuova versione...');
                    await Updates.fetchUpdateAsync();
                    setStatus('Riavvio in corso...');
                    await Updates.reloadAsync();
                } else {
                    onFinish();
                }
            } catch (error) {
                // Fail silently or log error, but let the app start
                console.log('Error checking updates:', error);
                onFinish();
            }
        }

        checkUpdates();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Icon name="cloud-download" size={48} color={Colors.primary.DEFAULT} />
                </View>
                <Text style={styles.title}>Aggiornamento in corso</Text>
                <Text style={styles.status}>{status}</Text>
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} style={styles.loader} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6', // Light background matching theme
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 12,
    },
    status: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    loader: {
        transform: [{ scale: 1.2 }],
    },
});
