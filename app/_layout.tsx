// rnsec:ignore IMPROPER_BIOMETRIC_FALLBACK
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { AppState, LogBox, Text, TextStyle, TouchableOpacity, useColorScheme, View, ViewStyle } from 'react-native';

import { Icon } from '../components/ui/Icon';
import { UpdateLoader } from '../components/UpdateLoader';
import Colors from '../constants/Colors';
import { BorderRadius, FontSizes, Spacing, Colors as ThemeColors } from '../constants/theme';
import { QueryProvider } from '../providers/QueryProvider';
import { authenticate, getPrivacyLockPreference } from '../services/biometricService';
import { registerForPushNotificationsAsync, scheduleDailyReminder, scheduleWeeklyReveal } from '../services/notificationService';
import { useAuthStore } from '../stores/authStore';

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  /SafeAreaView has been deprecated/,
  /"shadow\*" style props are deprecated/,
  /Method readAsStringAsync imported from "expo-file-system" is deprecated/,
  /expo-notifications: Android Push notifications/,
  /There was a problem registering for remote notifications/,
  /Notification channel setup failed/
]);




// ... (existing imports)

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { initialize, isLoading: authLoading } = useAuthStore();
  const [isLocked, setIsLocked] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(true);
  const appState = useRef(AppState.currentState);
  const isAuthenticating = useRef(false);

  // Initialize auth state
  useEffect(() => {
    initialize();
  }, []);

  // Initialize notifications
  useEffect(() => {
    async function setupNotifications() {
      await registerForPushNotificationsAsync();
      await scheduleDailyReminder();
      await scheduleWeeklyReveal();
    }
    setupNotifications();
  }, []);

  // Handle notification taps - navigate to the screen specified in data
  const router = useRouter();
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && typeof screen === 'string') {
        // Small delay to ensure app is fully loaded
        setTimeout(() => {
          router.push(screen as any);
        }, 100);
      }
    });

    return () => subscription.remove();
  }, [router]);

  // Privacy Lock Logic
  const checkPrivacyLock = async () => {
    // If already authenticating or already locked, skip
    if (isAuthenticating.current || isLocked) return;

    const enabled = await getPrivacyLockPreference();
    if (enabled) {
      isAuthenticating.current = true;
      setIsLocked(true);

      try {
        const success = await authenticate();
        if (success) {
          setIsLocked(false);
        }
      } finally {
        // Add a delay to prevent immediate re-triggering on AppState change (biometric close)
        setTimeout(() => {
          isAuthenticating.current = false;
        }, 1000);
      }
    }
  };

  useEffect(() => {
    // Check on initial load
    checkPrivacyLock();

    const subscription = AppState.addEventListener('change', nextAppState => {
      // Only trigger if coming from background/inactive AND not currently handling auth
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        !isAuthenticating.current
      ) {
        checkPrivacyLock();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && !authLoading && !isCheckingUpdates) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore error - splash screen may not be registered in Expo Go
      });
    }
  }, [loaded, authLoading, isCheckingUpdates]);

  if (isCheckingUpdates) {
    return <UpdateLoader onFinish={() => setIsCheckingUpdates(false)} />;
  }

  if (!loaded || authLoading) {
    return null;
  }

  return (
    <QueryProvider>
      <RootLayoutNav />
      {isLocked && (
        <View style={[styles.lockOverlay, { backgroundColor: isDark ? ThemeColors.stone[900] : ThemeColors.white }]}>
          <View style={styles.lockContent}>
            <View style={[styles.lockIconContainer, { backgroundColor: isDark ? ThemeColors.stone[800] : ThemeColors.stone[100] }]}>
              <Icon name="lock" size={40} color={ThemeColors.stone[400]} />
            </View>
            <Text style={[styles.lockTitle, { color: isDark ? ThemeColors.stone[300] : ThemeColors.stone[600] }]}>Diario Bloccato</Text>
            <Text style={styles.lockSubtitle}>Autenticazione richiesta</Text>

            <TouchableOpacity
              onPress={() => {
                isAuthenticating.current = false;
                checkPrivacyLock();
              }}
              style={styles.unlockButton}
              activeOpacity={0.8}
            >
              <Text style={styles.unlockButtonText}>Sblocca</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </QueryProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const CoupleLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#E8B4B8',
      background: '#FAF9F6',
      card: '#FFFFFF',
      text: '#2C3E50',
      border: 'rgba(232, 180, 184, 0.2)',
    },
  };

  const CoupleDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#E8B4B8',
      background: Colors.dark.background,
      card: Colors.dark.cardSolid,
      text: Colors.dark.text,
      border: Colors.dark.border,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CoupleDarkTheme : CoupleLightTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="partner" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="entry"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="reveal"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'fade',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const styles = {
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  } as ViewStyle,
  lockContent: {
    alignItems: 'center',
  } as ViewStyle,
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[6],
  } as ViewStyle,
  lockTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing[2],
  } as TextStyle,
  lockSubtitle: {
    color: ThemeColors.stone[400],
    marginBottom: Spacing[8],
    fontSize: FontSizes.base,
  } as TextStyle,
  unlockButton: {
    backgroundColor: ThemeColors.primary.DEFAULT,
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.full,
  } as ViewStyle,
  unlockButtonText: {
    color: ThemeColors.white,
    fontWeight: '700',
    fontSize: FontSizes.base,
  } as TextStyle,
};
