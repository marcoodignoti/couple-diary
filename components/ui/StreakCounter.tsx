import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { Colors, FontSizes, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface StreakCounterProps {
    streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
    const { isDark } = useTheme();
    const scale = useSharedValue(1);

    useEffect(() => {
        // Pulse animation when streak changes
        scale.value = withSequence(
            withSpring(1.2),
            withSpring(1)
        );
    }, [streak]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // if (streak < 1) return null; // Always show the counter so users know it exists

    return (
        <Animated.View style={[styles.container, animatedStyle, {
            backgroundColor: isDark ? `${Colors.primary.DEFAULT}20` : `${Colors.primary.DEFAULT}10`,
            borderColor: isDark ? `${Colors.primary.DEFAULT}40` : `${Colors.primary.DEFAULT}20`
        }]}>
            <Text style={styles.emoji}>🔥</Text>
            <Text style={[styles.text, { color: Colors.primary.DEFAULT }]}>
                {streak} {streak === 1 ? 'giorno' : 'giorni'}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing[3],
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        gap: 6,
    },
    emoji: {
        fontSize: 16,
    },
    text: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
    },
});
