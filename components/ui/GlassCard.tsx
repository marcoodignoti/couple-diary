import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    intensity?: number;
}

export function GlassCard({ children, style, onPress, intensity = 65 }: GlassCardProps) {
    const CardWrapper = onPress ? Pressable : View;

    return (
        <CardWrapper
            onPress={onPress}
            style={[
                {
                    borderRadius: 20,
                    overflow: 'hidden',
                    marginVertical: 8,
                },
                style,
            ]}
        >
            <BlurView
                intensity={intensity}
                tint="light"
                style={{
                    padding: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                }}
            >
                {children}
            </BlurView>
        </CardWrapper>
    );
}

export default GlassCard;
