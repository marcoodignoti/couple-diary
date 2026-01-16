import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const NOTIFICATION_PREF_KEY = 'couple_diary_notifications_enabled';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Register for push notifications and return the token
 */
export async function registerForPushNotificationsAsync() {
    let token;

    if (process.env.EXPO_OS === 'android') {
        try {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#ff231f7c',
            });
        } catch (error) {
            // Ignore error in Expo Go
            console.log('Notification channel setup failed (likely Expo Go warning):', error);
        }
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        // token = (await Notifications.getExpoPushTokenAsync()).data;
        // console.log(token);
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

/**
 * Get notification preference (default true)
 */
export async function getNotificationPreference(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(NOTIFICATION_PREF_KEY);
        return value !== 'false'; // Default to true if null
    } catch (e) {
        return true;
    }
}

/**
 * Set notification preference
 */
export async function setNotificationPreference(enabled: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(NOTIFICATION_PREF_KEY, String(enabled));

        if (enabled) {
            await scheduleAllNotifications();
        } else {
            await cancelAllNotifications();
        }
    } catch (e) {
        console.error('Failed to save notification preference', e);
    }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule all standard notifications
 */
export async function scheduleAllNotifications() {
    // Double check preference before scheduling
    const enabled = await getNotificationPreference();
    if (!enabled) return;

    await scheduleDailyReminder();
    await scheduleWeeklyReveal();
}

/**
 * Schedule a daily reminder to write in the diary
 */
export async function scheduleDailyReminder() {
    // Check if notifications are enabled
    const enabled = await getNotificationPreference();
    if (!enabled) return;

    // Check if already scheduled to avoid duplicates (naive check)
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const hasDaily = scheduled.some(n => n.content.title === "È ora di scrivere! ✍️");

    if (hasDaily) return;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "È ora di scrivere! ✍️",
            body: "Com'è andata la giornata? Prenditi un momento per condividerla.",
            sound: true,
            data: { screen: '/entry/new' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            channelId: 'default',
            hour: 20, // 8:00 PM CET
            minute: 0,
        },
    });
}

/**
 * Schedule the weekly reveal notification
 */
export async function scheduleWeeklyReveal() {
    // Check if notifications are enabled
    const enabled = await getNotificationPreference();
    if (!enabled) return;

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const hasWeekly = scheduled.some(n => n.content.title === "Weekly Reveal Sbloccato! 🔓");

    if (hasWeekly) return;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Weekly Reveal Sbloccato! 🔓",
            body: "Scopri cosa ha scritto il tuo partner questa settimana!",
            sound: true,
            data: { screen: '/reveal' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            channelId: 'default',
            weekday: 1, // Sunday (1 = Sunday in expo-notifications)
            hour: 10, // 10:00 AM
            minute: 0,
        },
    });
}
