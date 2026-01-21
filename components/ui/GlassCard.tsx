import { useColorScheme } from '@/components/useColorScheme';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { BorderRadius } from '../../constants/theme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    href?: string;
    onPress?: () => void;
    intensity?: number; // Kept for compatibility but unused in Minimalist design
    /** Accessibility label for VoiceOver/TalkBack */
    accessibilityLabel?: string;
}

export const GlassCard = React.memo(function GlassCard({ children, style, href, onPress, accessibilityLabel }: GlassCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const isAndroid = process.env.EXPO_OS === 'android';

    const cardContent = (
        <View style={{ padding: 20 }}>{children}</View>
    );

    const baseStyle = StyleSheet.flatten([
        {
            borderRadius: BorderRadius['2xl'],
            borderCurve: 'continuous',
            overflow: 'visible', // Visible for shadows
            marginVertical: 8,
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', // Solid Background
            // Soft, Premium Shadows (Apple Style) - CSS boxShadow format
            boxShadow: isDark
                ? '0px 8px 24px rgba(0, 0, 0, 0.3)'
                : '0px 8px 24px rgba(136, 136, 136, 0.08)',
            // Subtle Border for Dark Mode separation
            borderWidth: isDark ? 1 : 0,
            borderColor: isDark ? '#333333' : 'transparent',
            minHeight: 44, // iOS HIG touch target
        },
        style,
    ]) as ViewStyle;

    // If href is provided, use Link with Preview
    if (href) {
        return (
            <Link href={href as any} asChild>
                <Link.Trigger>
                    <Pressable
                        android_ripple={isAndroid ? { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' } : undefined}
                        accessibilityRole="button"
                        accessibilityLabel={accessibilityLabel}
                        style={({ pressed, hovered }: any) => StyleSheet.flatten([
                            baseStyle,
                            {
                                transform: [{
                                    scale: pressed ? 0.98 : (hovered ? 1.01 : 1)
                                }],
                                shadowOpacity: pressed ? (isDark ? 0.2 : 0.04) : (hovered ? (isDark ? 0.4 : 0.12) : (isDark ? 0.3 : 0.08)),
                            },
                        ])}
                    >
                        {cardContent}
                    </Pressable>
                </Link.Trigger>
                <Link.Preview />
            </Link>
        );
    }

    // Fallback to regular pressable
    return (
        <Pressable
            android_ripple={isAndroid && onPress ? { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' } : undefined}
            onPress={() => {
                if (onPress) {
                    if (!isAndroid) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPress();
                }
            }}
            accessibilityRole={onPress ? "button" : undefined}
            accessibilityLabel={accessibilityLabel}
            style={({ pressed, hovered }: any) => StyleSheet.flatten([
                baseStyle,
                {
                    transform: [{
                        scale: onPress && pressed ? 0.98 : (onPress && hovered ? 1.01 : 1)
                    }],
                    // Interactive Shadow scaling
                    shadowOpacity: onPress && pressed ? (isDark ? 0.2 : 0.04) : (onPress && hovered ? (isDark ? 0.4 : 0.12) : (isDark ? 0.3 : 0.08)),
                },
            ])}
        >
            {cardContent}
        </Pressable>
    );
});

export default GlassCard;
