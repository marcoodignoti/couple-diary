import { Icon } from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';

export default function OnboardingEnterCode() {
    const router = useRouter();
    const { pairWithPartner } = useAuthStore();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const inputs = useRef<Array<TextInput | null>>([]);
    const { isDark, colors } = useTheme();

    const handleChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto-focus logic
        if (text.length === 1 && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async () => {
        const codeString = code.join('').toUpperCase();
        if (codeString.length < 6) return;

        try {
            setIsLoading(true);
            await pairWithPartner(codeString);
            router.push('/onboarding/celebration' as any);
        } catch (error: any) {
            alert('Invalid code. Please check and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Top App Bar */}
            <View style={[styles.topBar, { backgroundColor: isDark ? `${Colors.background.dark}E6` : `${Colors.background.light}E6` }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={24} color={Colors.primary.DEFAULT} />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle, { color: isDark ? Colors.white : Colors.text.light }]}>
                    Unisciti al tuo Partner
                </Text>
            </View>

            <KeyboardAvoidingView
                behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingHorizontal: Spacing[6], paddingVertical: Spacing[8] }}
                >
                    {/* Headline Group */}
                    <View style={styles.headlineGroup}>
                        <View style={[styles.iconCircle, { backgroundColor: `${Colors.primary.DEFAULT}1A` }]}>
                            <Icon name="lock-open" size={32} color={Colors.primary.DEFAULT} />
                        </View>
                        <Text selectable style={[styles.title, { color: isDark ? Colors.white : Colors.text.light }]}>
                            Inserisci il Codice
                        </Text>
                        <Text selectable style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : `${Colors.text.light}99` }]}>
                            Incolla il codice condiviso dal tuo partner per collegare i diari.
                        </Text>
                    </View>

                    {/* Code Input */}
                    <View style={styles.codeInputContainer}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => { inputs.current[index] = el; }}
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                maxLength={1}
                                placeholder={['L', 'O', 'V', 'E', '2', '4'][index]}
                                placeholderTextColor={Colors.stone[300]}
                                keyboardType="default"
                                autoCapitalize="characters"
                                selectionColor={Colors.primary.DEFAULT}
                                style={[
                                    styles.codeInput,
                                    {
                                        backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                                        color: isDark ? Colors.white : Colors.text.light,
                                        boxShadow: Shadows.sm,
                                    } as TextStyle
                                ]}
                            />
                        ))}
                    </View>

                    {/* Helper Tip */}
                    <View style={styles.tipContainer}>
                        <Icon name="lightbulb" size={18} color={Colors.primary.DEFAULT} />
                        <Text style={[styles.tipText, { color: isDark ? 'rgba(255,255,255,0.4)' : `${Colors.text.light}80` }]}>
                            Il codice dovrebbe essere tipo LOVE-24
                        </Text>
                    </View>

                    {/* Action Button */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            activeOpacity={0.9}
                            style={[
                                styles.button,
                                {
                                    backgroundColor: Colors.primary.DEFAULT,
                                    boxShadow: Shadows.soft,
                                } as ViewStyle
                            ]}
                        >
                            <Text style={styles.buttonText}>
                                Collega Account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = {
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing[4],
        justifyContent: 'space-between',
        zIndex: 10,
    } as ViewStyle,
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    topBarTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        lineHeight: FontSizes.lg * 1.2,
        letterSpacing: -0.5,
        flex: 1,
        textAlign: 'center',
        paddingRight: 40,
    } as TextStyle,
    headlineGroup: {
        width: '100%',
        alignItems: 'center',
        gap: Spacing[3],
        marginBottom: Spacing[8],
    } as ViewStyle,
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing[2],
    } as ViewStyle,
    title: {
        fontSize: FontSizes['2xl'],
        fontWeight: '800',
        lineHeight: FontSizes['2xl'] * 1.2,
        letterSpacing: -0.5,
        textAlign: 'center',
    } as TextStyle,
    subtitle: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        lineHeight: FontSizes.sm * 1.625,
        maxWidth: 280,
        textAlign: 'center',
    } as TextStyle,
    codeInputContainer: {
        width: '100%',
        maxWidth: 384,
        marginBottom: Spacing[12],
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing[2],
    } as ViewStyle,
    codeInput: {
        width: 48,
        height: 56,
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        textAlign: 'center',
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
    } as TextStyle,
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing[2],
        marginBottom: Spacing[8],
    } as ViewStyle,
    tipText: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
    } as TextStyle,
    buttonContainer: {
        width: '100%',
        marginTop: 'auto',
    } as ViewStyle,
    button: {
        width: '100%',
        height: 56,
        borderRadius: BorderRadius.full,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    buttonText: {
        color: Colors.white,
        fontSize: FontSizes.base,
        fontWeight: '700',
        letterSpacing: 0.5,
    } as TextStyle,
};
