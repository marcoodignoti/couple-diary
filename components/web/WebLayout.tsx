import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Sidebar } from './Sidebar';

interface WebLayoutProps {
    children: React.ReactNode;
}

export function WebLayout({ children }: WebLayoutProps) {
    const { width } = useWindowDimensions();
    const isWeb = process.env.EXPO_OS === 'web';
    const isDesktop = width > 768;

    if (!isWeb) {
        return <>{children}</>;
    }

    // Mobile Web View: Center content, max-width
    if (!isDesktop) {
        return (
            <View style={styles.mobileContainer}>
                <View style={styles.mobileContent}>
                    {children}
                </View>
            </View>
        );
    }

    // Desktop Web View: Sidebar + Full Content
    return (
        <View style={styles.desktopContainer}>
            <Sidebar />
            <View style={styles.desktopContent}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mobileContainer: {
        flex: 1,
        backgroundColor: '#FAF9F6', // Or use theme background
        alignItems: 'center',
    },
    mobileContent: {
        flex: 1,
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#fff',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        elevation: 2,
    },
    desktopContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FAF9F6',
    },
    desktopContent: {
        flex: 1,
        // On desktop we might want a max-width for the actual content area, or keep it fluid
        // For now, fluid
    },
});
