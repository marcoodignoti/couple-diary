import { Stack } from 'expo-router';
import React from 'react';

export default function GamificationLayout() {
    return (
        <Stack>
            <Stack.Screen name="milestones" options={{ headerShown: false }} />
        </Stack>
    );
}
