import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon } from '../../components/ui/Icon';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';

const THEMES = [
    { id: 'default', name: 'Originale', color: '#E8B4B8', unlockedAt: 0 },
    { id: 'pink', name: 'Rosa Confetto', color: '#ec4899', unlockedAt: 7 },
    { id: 'ocean', name: 'Oceano Profondo', color: '#0ea5e9', unlockedAt: 14 },
    { id: 'midnight', name: 'Notte Stellata', color: '#6366f1', unlockedAt: 30 },
];

export default function MilestonesScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { isDark, currentTheme, setTheme } = useTheme();

    const streak = user?.current_streak || 0;
    const totalEntries = user?.total_entries || 0;
    const unlockedThemes = user?.unlocked_themes || ['default'];

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: isDark ? Colors.background.dark : Colors.background.light }}
            contentContainerStyle={{ padding: Spacing[6], paddingTop: 60 }}
        >
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Icon name="chevron-left" size={24} color={isDark ? Colors.white : Colors.text.light} />
                </Pressable>
                <Text style={[styles.title, { color: isDark ? Colors.white : Colors.text.light }]}>
                    I Tuoi Traguardi
                </Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.white }]}>
                    <Text style={styles.statEmoji}>🔥</Text>
                    <Text style={[styles.statValue, { color: isDark ? Colors.white : Colors.text.light }]}>{streak}</Text>
                    <Text style={styles.statLabel}>Streak Attuale</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.white }]}>
                    <Text style={styles.statEmoji}>📝</Text>
                    <Text style={[styles.statValue, { color: isDark ? Colors.white : Colors.text.light }]}>{totalEntries}</Text>
                    <Text style={styles.statLabel}>Ricordi Totali</Text>
                </View>
            </View>

            {/* Themes Section */}
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.stone[400] : Colors.stone[500] }]}>
                Temi Sbloccabili
            </Text>

            <View style={styles.themesGrid}>
                {THEMES.map((theme, index) => {
                    const isUnlocked = unlockedThemes.includes(theme.id);
                    const isActive = currentTheme === theme.id;

                    return (
                        <Animated.View
                            key={theme.id}
                            entering={FadeInDown.delay(index * 100)}
                        >
                            <Pressable
                                disabled={!isUnlocked}
                                onPress={() => setTheme(theme.id)}
                                style={[
                                    styles.themeCard,
                                    {
                                        backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                                        borderColor: isActive ? Colors.primary.DEFAULT : 'transparent',
                                        borderWidth: 2,
                                        opacity: isUnlocked ? 1 : 0.6
                                    }
                                ]}
                            >
                                <View style={[styles.colorPreview, { backgroundColor: theme.color }]} />
                                <View style={styles.themeInfo}>
                                    <Text style={[styles.themeName, { color: isDark ? Colors.white : Colors.text.light }]}>
                                        {theme.name}
                                    </Text>
                                    {!isUnlocked && (
                                        <Text style={styles.lockText}>
                                            🔒 Sblocca a {theme.unlockedAt} giorni
                                        </Text>
                                    )}
                                    {isActive && (
                                        <Text style={[styles.activeText, { color: Colors.primary.DEFAULT }]}>
                                            Attivo
                                        </Text>
                                    )}
                                </View>
                            </Pressable>
                        </Animated.View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing[8],
        gap: Spacing[4],
    },
    backButton: {
        padding: Spacing[2],
    },
    title: {
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: Spacing[4],
        marginBottom: Spacing[8],
    },
    statCard: {
        flex: 1,
        padding: Spacing[5],
        borderRadius: BorderRadius['2xl'],
        alignItems: 'center',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    },
    statEmoji: {
        fontSize: 32,
        marginBottom: Spacing[2],
    },
    statValue: {
        fontSize: FontSizes['2xl'],
        fontWeight: '800',
        marginBottom: Spacing[1],
    },
    statLabel: {
        fontSize: FontSizes.sm,
        color: Colors.stone[400],
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing[4],
    },
    themesGrid: {
        gap: Spacing[4],
    },
    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing[4],
        borderRadius: BorderRadius.xl,
        gap: Spacing[4],
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
    },
    colorPreview: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
    },
    themeInfo: {
        flex: 1,
    },
    themeName: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        marginBottom: 4,
    },
    lockText: {
        fontSize: FontSizes.xs,
        color: Colors.stone[400],
    },
    activeText: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
    },
});
