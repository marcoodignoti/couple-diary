import { Icon } from '../../components/ui/Icon';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { Colors, BorderRadius, FontSizes, Spacing, Shadows } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, updateProfile } = useAuthStore();
    const { isDark, colors } = useTheme();

    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;

        setIsSaving(true);
        try {
            await updateProfile(name);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(tabs)/profile' as any);
            }
        } catch (error) {
            alert('Errore durante l\'aggiornamento del profilo');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ paddingHorizontal: Spacing[6], paddingTop: Spacing[4] }}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/(tabs)/profile' as any);
                        }
                    }}
                    style={[
                        styles.backButton,
                        {
                            backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                            boxShadow: Shadows.sm,
                        } as ViewStyle
                    ]}
                    activeOpacity={0.8}
                >
                    <Icon name="arrow-back" size={24} color={isDark ? Colors.white : Colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.text.light }]}>Modifica Profilo</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Nome Visualizzato</Text>
                    <View style={[
                        styles.inputWrapper,
                        {
                            backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                            borderColor: isDark ? Colors.stone[800] : Colors.stone[200],
                            boxShadow: Shadows.sm,
                        } as ViewStyle
                    ]}>
                        <Icon name="person-outline" size={24} color={Colors.stone[400]} />
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Il tuo nome"
                            style={[styles.input, { color: isDark ? Colors.white : Colors.text.light }]}
                            placeholderTextColor={Colors.stone[300]}
                            autoFocus
                        />
                    </View>
                    <Text style={styles.inputHint}>Questo nome sarà visibile al tuo partner.</Text>
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving || !name.trim()}
                    style={[
                        styles.saveButton,
                        {
                            backgroundColor: !name.trim() ? Colors.stone[300] : Colors.primary.DEFAULT,
                            boxShadow: !name.trim() ? 'none' : Shadows.md,
                        } as ViewStyle
                    ]}
                    activeOpacity={0.8}
                >
                    {isSaving ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Salva Modifiche</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = {
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing[8],
    } as ViewStyle,
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
    } as TextStyle,
    headerSpacer: {
        width: 40,
    } as ViewStyle,
    formContainer: {
        gap: Spacing[6],
    } as ViewStyle,
    inputGroup: {
    } as ViewStyle,
    inputLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: Colors.stone[500],
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing[2],
        marginLeft: Spacing[1],
    } as TextStyle,
    inputWrapper: {
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        borderWidth: 1,
        padding: Spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[3],
    } as ViewStyle,
    input: {
        flex: 1,
        fontSize: FontSizes.lg,
        fontWeight: '500',
    } as TextStyle,
    inputHint: {
        fontSize: FontSizes.xs,
        color: Colors.stone[400],
        marginTop: Spacing[2],
        marginLeft: Spacing[1],
    } as TextStyle,
    saveButton: {
        paddingVertical: Spacing[4],
        borderRadius: BorderRadius.xl,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing[4],
    } as ViewStyle,
    saveButtonText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSizes.lg,
    } as TextStyle,
};
