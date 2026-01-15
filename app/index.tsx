import { Redirect } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { LandingPage } from '../components/web/LandingPage';
import { useAuthStore } from '../stores/authStore';

/**
 * Root index screen
 * - Web: Shows landing page for unauthenticated users
 * - Mobile: Redirects to auth or tabs based on authentication
 */
export default function Index() {
    const { isAuthenticated, isLoading } = useAuthStore();

    // Show loading state
    if (isLoading) {
        return null;
    }

    // Already authenticated - go to main app
    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    // Web: Show landing page
    if (Platform.OS === 'web') {
        return <LandingPage />;
    }

    // Mobile: Go to auth
    return <Redirect href="/(auth)/login" />;
}
