import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(opacity.value, [0.3, 1], [0.3, 0.7]),
    }));

    return (
        <Animated.View
            style={[
                styles.skeleton,
                { width, height, borderRadius },
                animatedStyle,
                style,
            ]}
        />
    );
}

export function SkeletonCard({ style }: { style?: any }) {
    return (
        <View style={[styles.card, style]}>
            <Skeleton height={16} width="40%" style={{ marginBottom: 12 }} />
            <Skeleton height={24} width="80%" style={{ marginBottom: 8 }} />
            <Skeleton height={14} width="60%" />
        </View>
    );
}

export function SkeletonEntryCard({ style }: { style?: any }) {
    return (
        <View style={[styles.entryCard, style]}>
            <View style={styles.entryLeft}>
                <Skeleton width={40} height={14} style={{ marginBottom: 4 }} />
                <Skeleton width={32} height={28} />
            </View>
            <View style={styles.entryRight}>
                <Skeleton height={18} width="70%" style={{ marginBottom: 8 }} />
                <Skeleton height={14} width="100%" style={{ marginBottom: 4 }} />
                <Skeleton height={14} width="80%" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#e7e5e4',
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
    },
    entryCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    entryLeft: {
        alignItems: 'center',
        width: 48,
    },
    entryRight: {
        flex: 1,
    },
});
