import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FAF9F6' },
            }}
        >
            <Stack.Screen name="pairing" />
        </Stack>
    );
}
