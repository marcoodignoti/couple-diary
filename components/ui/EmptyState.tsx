import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon, IconName } from './Icon';

interface EmptyStateProps {
    icon: IconName;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState = React.memo(function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
            <View style={styles.iconContainer}>
                <Icon name={icon} size={48} color="#C0847C" />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity
                    style={styles.button}
                    onPress={onAction}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={actionLabel}
                >
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginVertical: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(192, 132, 124, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4A403A',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#78716c',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 260,
    },
    button: {
        marginTop: 20,
        backgroundColor: '#C0847C',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 999,
        minHeight: 44, // iOS HIG touch target
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
});
