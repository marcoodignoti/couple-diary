import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface NativeButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    icon?: string;
}

/**
 * Native-feeling button with haptic feedback and press animation
 */
export function NativeButton({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    icon,
}: NativeButtonProps) {
    const scale = useSharedValue(1);

    const triggerHaptic = () => {
        if (Platform.OS === 'web') return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
        triggerHaptic();
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const isDisabled = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabled}
        >
            <Animated.View
                style={[
                    styles.button,
                    styles[variant],
                    styles[size],
                    isDisabled && styles.disabled,
                    animatedStyle,
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'primary' ? '#FFF' : '#E8B4B8'}
                        size="small"
                    />
                ) : (
                    <>
                        {icon && <Text style={styles.icon}>{icon}</Text>}
                        <Text
                            style={[
                                styles.text,
                                styles[`${variant}Text` as keyof typeof styles],
                                styles[`${size}Text` as keyof typeof styles],
                            ]}
                        >
                            {title}
                        </Text>
                    </>
                )}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        gap: 8,
    },
    // Variants
    primary: {
        backgroundColor: '#E8B4B8',
        shadowColor: '#E8B4B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondary: {
        backgroundColor: 'rgba(232, 180, 184, 0.15)',
        borderWidth: 1.5,
        borderColor: '#E8B4B8',
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    // Sizes
    small: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    medium: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    large: {
        paddingHorizontal: 32,
        paddingVertical: 18,
    },
    // Text styles
    text: {
        fontWeight: '600',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#E8B4B8',
    },
    ghostText: {
        color: '#E8B4B8',
    },
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },
    // States
    disabled: {
        opacity: 0.5,
    },
    icon: {
        fontSize: 18,
    },
});

export default NativeButton;
