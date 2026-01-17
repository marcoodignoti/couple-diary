import { useRouter } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming
} from 'react-native-reanimated';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { Icon } from '../ui/Icon';

interface LoginScreenProps {
    isActive: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ isActive }) => {
    usePreventScreenCapture();
    const router = useRouter();
    const { signIn, signUp } = useAuthStore();

    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isActive ? 1 : 0),
            transform: [{ translateX: withTiming(isActive ? 0 : 400) }],
        };
    });

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Errore', 'Inserisci email e password');
            return;
        }

        if (isSignUp && !name) {
            Alert.alert('Errore', 'Inserisci il tuo nome');
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                await signUp(email, password, name);
                Alert.alert('Registrazione', 'Controlla la tua email per confermare l\'account, poi accedi.');
                setIsSignUp(false); // Switch to login after signup
            } else {
                await signIn(email, password);
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            console.error('Login/Signup error');
            Alert.alert('Errore', 'Si è verificato un errore durante l\'operazione. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Animated.View
            style={[styles.container, animatedStyle]}
            pointerEvents={isActive ? 'auto' : 'none'}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.formContainer}>
                    <Text style={styles.title}>
                        {isSignUp ? 'Benvenuto' : 'Bentornato'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isSignUp ? 'Crea il vostro spazio privato' : 'Accedi al vostro mondo'}
                    </Text>

                    {/* Name - Only for SignUp */}
                    {isSignUp && (
                        <View style={styles.inputContainer}>
                            <Icon name="person" size={20} color={Colors.stone[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nome"
                                placeholderTextColor={Colors.stone[400]}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>
                    )}

                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <Icon name="mail" size={20} color={Colors.stone[400]} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={Colors.stone[400]}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.inputContainer}>
                        <Icon name="lock" size={20} color={Colors.stone[400]} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={Colors.stone[400]}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <Icon name={showPassword ? "visibility-off" : "visibility"} size={20} color={Colors.stone[400]} />
                        </TouchableOpacity>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {isSignUp ? 'Registrati' : 'Accedi'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Toggle Mode */}
                    <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleButton}>
                        <Text style={styles.toggleText}>
                            {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.background.light,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    keyboardView: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing[6],
    } as ViewStyle,
    formContainer: {
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    } as ViewStyle,
    title: {
        fontSize: FontSizes['3xl'],
        fontWeight: 'bold',
        color: Colors.text.light,
        marginBottom: Spacing[2],
    } as TextStyle,
    subtitle: {
        fontSize: FontSizes.base,
        color: Colors.stone[500],
        marginBottom: Spacing[8],
    } as TextStyle,
    inputContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.stone[200],
        marginBottom: Spacing[4],
        height: 50,
        paddingHorizontal: Spacing[3],
        // Shadow for input
        shadowColor: Colors.stone[400],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    } as ViewStyle,
    inputIcon: {
        marginRight: Spacing[2],
    } as ViewStyle,
    input: {
        flex: 1,
        height: '100%',
        fontSize: FontSizes.base,
        color: Colors.text.light,
    } as TextStyle,
    eyeIcon: {
        padding: Spacing[2],
    } as ViewStyle,
    submitButton: {
        width: '100%',
        height: 50,
        backgroundColor: Colors.primary.DEFAULT,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing[2],
        shadowColor: Colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    } as ViewStyle,
    submitButtonText: {
        color: Colors.white,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
    } as TextStyle,
    toggleButton: {
        marginTop: Spacing[6],
        padding: Spacing[2],
    } as ViewStyle,
    toggleText: {
        color: Colors.primary.DEFAULT,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    } as TextStyle,
});
