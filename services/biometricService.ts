import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const PRIVACY_LOCK_KEY = 'couple_diary_privacy_lock_enabled';

export async function isBiometricsSupported(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
}

export async function authenticate(): Promise<boolean> {
    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Sblocca il tuo diario',
            fallbackLabel: 'Usa Passcode',
            cancelLabel: 'Annulla',
            disableDeviceFallback: false,
        });
        return result.success;
    } catch (error) {
        console.error('Authentication failed', error);
        return false;
    }
}

export async function setPrivacyLockPreference(enabled: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(PRIVACY_LOCK_KEY, String(enabled));
    } catch (e) {
        console.error('Failed to save privacy lock preference', e);
    }
}

export async function getPrivacyLockPreference(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(PRIVACY_LOCK_KEY);
        return value === 'true';
    } catch (e) {
        return false;
    }
}
