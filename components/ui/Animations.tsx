import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface AnimatedPressableProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    disabled?: boolean;
    hapticStyle?: 'light' | 'medium' | 'heavy' | 'none';
}

/**
 * Pressable component with scale animation and haptic feedback on press
 */
export function AnimatedPressable({
    children,
    onPress,
    style,
    disabled = false,
    hapticStyle = 'light',
}: AnimatedPressableProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const triggerHaptic = () => {
        if (Platform.OS === 'web' || hapticStyle === 'none') return;

        switch (hapticStyle) {
            case 'light':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case 'medium':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 'heavy':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
        }
    };

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
        triggerHaptic();
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
        >
            <Animated.View style={[style, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
}

interface FadeInViewProps {
    children: React.ReactNode;
    delay?: number;
    style?: ViewStyle;
}

/**
 * View that fades in when mounted
 */
export function FadeInView({ children, delay = 0, style }: FadeInViewProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            opacity.value = withSpring(1, { damping: 20, stiffness: 90 });
            translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
        }, delay);

        return () => clearTimeout(timeout);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[style, animatedStyle]}>
            {children}
        </Animated.View>
    );
}

export default { AnimatedPressable, FadeInView };
