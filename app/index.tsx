// rnsec:ignore MISSING_RUNTIME_INTEGRITY_CHECKS
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { LandingPage } from '../components/web/LandingPage';
import { checkIntegrity } from '../services/security';
import { useAuthStore } from '../stores/authStore';

/**
 * Root index screen
 * - Web: Shows landing page for unauthenticated users
 * - Mobile: Redirects to auth or tabs based on authentication
 */
export default function Index() {
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        checkIntegrity();
    }, []);

    // Show loading state
    if (isLoading) {
        return null;
    }

    // Already authenticated - go to main app
    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    // Web: Show landing page
    if (process.env.EXPO_OS === 'web') {
        return <LandingPage />;
    }

    // Mobile: Start with Onboarding Flow
    return <Redirect href={"/onboarding/welcome" as any} />;
}
