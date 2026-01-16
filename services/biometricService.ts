import * as LocalAuthentication from 'expo-local-authentication';
import { storage } from '../utils/storage';

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
    storage.set(PRIVACY_LOCK_KEY, enabled);
}

export async function getPrivacyLockPreference(): Promise<boolean> {
    return storage.get<boolean>(PRIVACY_LOCK_KEY, false);
}
