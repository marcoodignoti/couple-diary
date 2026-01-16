import * as Device from 'expo-device';

/**
 * Checks the runtime integrity of the device.
 * verifies if the device is rooted (Android) or jailbroken (iOS).
 */
export async function checkIntegrity(): Promise<boolean> {
    if (process.env.EXPO_OS === 'web') {
        return true; // Web doesn't have the same concept of "rooted"
    }

    try {
        const isRooted = await Device.isRootedExperimentalAsync();

        if (isRooted) {
            console.warn('Security Warning: Device appears to be rooted/jailbroken. This compromises the app\'s security integrity.');
            // In a real high-security app, you might want to exit or limit functionality here.
            return false;
        }

        return true;
    } catch (error) {
        console.error('Integrity check failed'); // Log generic error
        return true; // Fail safe to avoid blocking legitimate users on error
    }
}
