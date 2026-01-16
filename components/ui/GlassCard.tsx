import { useColorScheme } from '@/components/useColorScheme';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    href?: string;
    onPress?: () => void;
    intensity?: number;
}

export function GlassCard({ children, style, href, onPress, intensity = 65 }: GlassCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const isAndroid = process.env.EXPO_OS === 'android';

    const cardContent = (
        <>
            {isAndroid ? (
                <View style={{ padding: 20 }}>{children}</View>
            ) : (
                <BlurView
                    intensity={intensity}
                    tint={isDark ? 'dark' : 'light'}
                    style={{
                        padding: 20,
                        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                    }}
                >
                    {children}
                </BlurView>
            )}
        </>
    );

    const baseStyle = StyleSheet.flatten([
        {
            borderRadius: 20,
            borderCurve: 'continuous',
            overflow: 'hidden',
            marginVertical: 8,
            elevation: isAndroid ? 4 : 0,
            backgroundColor: isAndroid ? (isDark ? '#1C1C1E' : '#FFFFFF') : 'transparent',
            borderWidth: isAndroid ? 1 : 0,
            borderColor: isAndroid ? (isDark ? '#333' : '#e5e5e5') : 'transparent',
        },
        style,
    ]) as ViewStyle;

    // If href is provided, use Link with Preview
    if (href) {
        return (
            <Link href={href as any} asChild>
                <Link.Trigger>
                    <Pressable
                        android_ripple={isAndroid ? { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } : undefined}
                        style={({ pressed, hovered }: any) => StyleSheet.flatten([
                            baseStyle,
                            {
                                transform: [{
                                    scale: !isAndroid && pressed
                                        ? 0.98
                                        : (!isAndroid && hovered ? 1.02 : 1)
                                }],
                                opacity: !isAndroid && pressed ? 0.8 : 1,
                                shadowOpacity: !isAndroid && hovered ? 0.2 : 0,
                                shadowRadius: !isAndroid && hovered ? 20 : 0,
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
            android_ripple={isAndroid && onPress ? { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } : undefined}
            onPress={() => {
                if (onPress) {
                    if (!isAndroid) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPress();
                }
            }}
            style={({ pressed, hovered }: any) => StyleSheet.flatten([
                baseStyle,
                {
                    transform: [{
                        scale: !isAndroid && onPress && pressed
                            ? 0.98
                            : (!isAndroid && onPress && hovered ? 1.02 : 1)
                    }],
                    opacity: !isAndroid && onPress && pressed ? 0.8 : 1,
                    shadowOpacity: !isAndroid && onPress && hovered ? 0.2 : 0,
                    shadowRadius: !isAndroid && onPress && hovered ? 20 : 0,
                },
            ])}
        >
            {cardContent}
        </Pressable>
    );
}

export default GlassCard;
