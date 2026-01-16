import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageStyle, KeyboardAvoidingView, ScrollView, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Icon, IconName } from '../../components/ui/Icon';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../constants/theme';
import { useStatusBarPadding } from '../../hooks/useStatusBarPadding';
import { useTheme } from '../../hooks/useTheme';
import { pickImage, takePhoto, uploadPhoto } from '../../services/photoService';
import { useAuthStore } from '../../stores/authStore';
import { useEntryStore } from '../../stores/entryStore';
import type { Mood } from '../../types';

const MOODS: { value: Mood; icon: IconName; color: string; label: string }[] = [
    { value: 'happy', icon: 'sentiment-satisfied', color: '#D4AF37', label: 'Felice' },
    { value: 'love', icon: 'favorite', color: '#C0847C', label: 'Amato' },
    { value: 'grateful', icon: 'volunteer-activism', color: '#14b8a6', label: 'Grato' },
    { value: 'peaceful', icon: 'spa', color: '#60a5fa', label: 'Sereno' },
    { value: 'excited', icon: 'celebration', color: '#f59e0b', label: 'Emozionato' },
    { value: 'sad', icon: 'sentiment-dissatisfied', color: '#64748b', label: 'Triste' },
    { value: 'anxious', icon: 'psychology', color: '#8b5cf6', label: 'Ansioso' },
    { value: 'tired', icon: 'bedtime', color: '#a8a29e', label: 'Stanco' },
];

export default function NewEntryScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { createEntry } = useEntryStore();
    const { isDark, colors } = useTheme();
    const statusBarPadding = useStatusBarPadding();

    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

    const handlePickImage = async () => {
        try {
            const uri = await pickImage();
            if (uri) setImageUri(uri);
        } catch (error: any) {
            console.error('Pick image error');
            Alert.alert('Errore', 'Impossibile selezionare l\'immagine. Riprova.');
        }
    };

    const handleTakePhoto = async () => {
        try {
            const uri = await takePhoto();
            if (uri) setImageUri(uri);
        } catch (error) {
            Alert.alert('Errore', 'Impossibile scattare la foto');
        }
    };

    const handleRemovePhoto = () => {
        setImageUri(null);
    };

    const handleSave = async () => {
        if (!content.trim() && !imageUri) {
            Alert.alert('Diario Vuoto', 'Scrivi qualcosa o aggiungi una foto prima di salvare.');
            return;
        }

        if (!user?.id) {
            Alert.alert('Errore', 'Devi essere autenticato per salvare.');
            return;
        }

        try {
            setIsUploading(true);
            let photoUrl = null;

            if (imageUri) {
                photoUrl = await uploadPhoto(user.id, imageUri);
            }

            await createEntry(
                user.id,
                content.trim(),
                selectedMood,
                photoUrl,
                false,
                undefined
            );

            router.back();
        } catch (error: any) {
            console.error('Save error');
            Alert.alert('Errore', 'Impossibile salvare il diario. Riprova.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: colors.background }}
            keyboardShouldPersistTaps="handled"
        >
            <KeyboardAvoidingView
                behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={process.env.EXPO_OS === 'ios' ? 47 : 0}
            >
                <View style={[styles.container, { paddingTop: statusBarPadding }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.closeButton}
                            activeOpacity={0.7}
                        >
                            <Icon name="close" size={24} color={isDark ? Colors.white : Colors.text.light} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.text.light }]}>Il Tuo Pensiero</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    <View style={styles.content}>
                        {/* Prompt Card */}
                        <Animated.View entering={FadeInDown.duration(600)}>
                            <View style={[styles.promptCard, { backgroundColor: isDark ? Colors.primary.dark : Colors.primary.DEFAULT, boxShadow: Shadows.soft } as ViewStyle]}>
                                {process.env.EXPO_OS !== 'android' && (
                                    <>
                                        <View style={styles.decorativeCircle1} />
                                        <View style={styles.decorativeCircle2} />
                                    </>
                                )}

                                <View style={styles.promptContent}>
                                    <View style={styles.promptIcon}>
                                        <Icon name="psychology" size={24} color={Colors.white} />
                                    </View>
                                    <View style={styles.promptTextContainer}>
                                        <Text style={styles.promptLabel}>Spunto del Giorno</Text>
                                        <Text style={styles.promptText}>Cosa ti ha fatto sorridere oggi?</Text>
                                    </View>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Text Editor Area */}
                        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                            <View style={[
                                styles.editorCard,
                                {
                                    backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                                    borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                                    boxShadow: Shadows.sm,
                                } as ViewStyle
                            ]}>
                                <TextInput
                                    multiline
                                    textAlignVertical="top"
                                    placeholder="Scrivi col cuore..."
                                    placeholderTextColor={Colors.stone[400]}
                                    style={[styles.textInput, { color: isDark ? Colors.white : Colors.text.light }]}
                                    value={content}
                                    onChangeText={setContent}
                                    editable={!isUploading}
                                />

                                {/* Photo Preview */}
                                {imageUri && (
                                    <View style={styles.photoPreviewContainer}>
                                        <View style={[styles.photoPreview, { boxShadow: Shadows.sm } as ViewStyle]}>
                                            <Image source={{ uri: imageUri }} style={styles.photoImage} resizeMode="cover" />
                                            <TouchableOpacity
                                                onPress={handleRemovePhoto}
                                                style={styles.removePhotoButton}
                                                activeOpacity={0.8}
                                            >
                                                <Icon name="close" size={20} color={Colors.white} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}

                                <View style={styles.editorFooter}>
                                    <View style={styles.mediaButtons}>
                                        <TouchableOpacity
                                            onPress={handlePickImage}
                                            style={[styles.mediaButton, { backgroundColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}
                                            activeOpacity={0.7}
                                        >
                                            <Icon name="image" size={24} color={Colors.stone[500]} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleTakePhoto}
                                            style={[styles.mediaButton, { backgroundColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}
                                            activeOpacity={0.7}
                                        >
                                            <Icon name="camera-alt" size={24} color={Colors.stone[500]} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[styles.wordCountBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                                        <Text selectable style={[styles.wordCountText, { fontVariant: ['tabular-nums'] }]}>
                                            {new Date().toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })} • {wordCount} parole
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Mood Selector */}
                        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.moodSection}>
                            <Text style={[styles.moodLabel, { color: isDark ? Colors.stone[400] : Colors.stone[500] }]}>Come ti senti?</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.moodList}>
                                    {MOODS.map((mood) => (
                                        <TouchableOpacity
                                            key={mood.value}
                                            onPress={() => setSelectedMood(selectedMood === mood.value ? null : mood.value)}
                                            style={[
                                                styles.moodItem,
                                                {
                                                    backgroundColor: selectedMood === mood.value
                                                        ? `${Colors.primary.DEFAULT}1A`
                                                        : isDark ? Colors.surface.dark : Colors.white,
                                                    borderColor: selectedMood === mood.value
                                                        ? Colors.primary.DEFAULT
                                                        : isDark ? Colors.stone[700] : Colors.stone[200],
                                                }
                                            ]}
                                            activeOpacity={0.7}
                                        >
                                            <Icon
                                                name={mood.icon}
                                                size={28}
                                                color={selectedMood === mood.value ? mood.color : Colors.stone[400]}
                                            />
                                            <Text style={[
                                                styles.moodItemLabel,
                                                { color: selectedMood === mood.value ? (isDark ? Colors.white : Colors.text.light) : Colors.stone[400] }
                                            ]}>
                                                {mood.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </Animated.View>
                    </View>

                    {/* Bottom Actions */}
                    <Animated.View entering={FadeInDown.delay(300).duration(600)} style={[styles.bottomActions, { backgroundColor: colors.background }]}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={handleSave}
                            disabled={isUploading || (!content.trim() && !imageUri)}
                            style={[
                                styles.saveButton,
                                {
                                    backgroundColor: content.trim() || imageUri ? Colors.primary.DEFAULT : Colors.stone[300],
                                    boxShadow: content.trim() || imageUri ? Shadows.lg : 'none',
                                } as ViewStyle
                            ]}
                        >
                            {isUploading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <>
                                    <Icon name="check" size={24} color={Colors.white} />
                                    <Text style={styles.saveButtonText}>Salva nel Diario</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </ScrollView>
    );
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column',
    } as ViewStyle,
    header: {
        paddingHorizontal: Spacing[5],
        paddingVertical: Spacing[2],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 20,
    } as ViewStyle,
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    headerTitle: {
        fontWeight: '700',
        fontSize: FontSizes.lg,
    } as TextStyle,
    headerSpacer: {
        width: 40,
        height: 40,
    } as ViewStyle,
    content: {
        flex: 1,
        paddingHorizontal: Spacing[5],
        paddingBottom: Spacing[5],
        gap: Spacing[5],
    } as ViewStyle,
    promptCard: {
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        padding: Spacing[5],
        position: 'relative',
        overflow: 'hidden',
    } as ViewStyle,
    decorativeCircle1: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 96,
        height: 96,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: BorderRadius.full,
        marginRight: -32,
        marginTop: -32,
    } as ViewStyle,
    decorativeCircle2: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 64,
        height: 64,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: BorderRadius.full,
        marginLeft: -24,
        marginBottom: -24,
    } as ViewStyle,
    promptContent: {
        position: 'relative',
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing[3],
    } as ViewStyle,
    promptIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: Spacing[2],
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    } as ViewStyle,
    promptTextContainer: {
        flex: 1,
        paddingTop: 2,
    } as ViewStyle,
    promptLabel: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: Spacing[1],
    } as TextStyle,
    promptText: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        lineHeight: FontSizes.lg * 1.2,
        color: Colors.white,
    } as TextStyle,
    editorCard: {
        borderRadius: 24,
        borderCurve: 'continuous',
        borderWidth: 1,
        overflow: 'hidden',
        minHeight: 200,
    } as ViewStyle,
    textInput: {
        flex: 1,
        padding: Spacing[5],
        fontSize: FontSizes.lg,
        lineHeight: FontSizes.lg * 1.625,
        minHeight: 180,
        textAlignVertical: 'top',
    } as TextStyle,
    photoPreviewContainer: {
        paddingHorizontal: Spacing[5],
        paddingBottom: Spacing[5],
    } as ViewStyle,
    photoPreview: {
        position: 'relative',
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        overflow: 'hidden',
        height: 192,
        width: '100%',
    } as ViewStyle,
    photoImage: {
        width: '100%',
        height: '100%',
    } as ImageStyle,
    removePhotoButton: {
        position: 'absolute',
        top: Spacing[2],
        right: Spacing[2],
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: Spacing[1.5],
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    editorFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing[5],
        paddingBottom: Spacing[4],
    } as ViewStyle,
    mediaButtons: {
        flexDirection: 'row',
        gap: Spacing[2],
    } as ViewStyle,
    mediaButton: {
        padding: Spacing[2],
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    wordCountBadge: {
        paddingHorizontal: Spacing[2],
        paddingVertical: Spacing[1],
        borderRadius: BorderRadius.md,
    } as ViewStyle,
    wordCountText: {
        fontSize: FontSizes.xs,
        color: Colors.stone[400],
        fontWeight: '500',
    } as TextStyle,
    moodSection: {
        marginBottom: Spacing[4],
    } as ViewStyle,
    moodLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        marginBottom: Spacing[3],
        marginLeft: Spacing[1],
    } as TextStyle,
    moodList: {
        flexDirection: 'row',
        gap: Spacing[3],
        paddingHorizontal: Spacing[1],
    } as ViewStyle,
    moodItem: {
        width: 80,
        alignItems: 'center',
        paddingVertical: Spacing[3],
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        borderWidth: 1,
    } as ViewStyle,
    moodItemLabel: {
        fontSize: FontSizes.xs,
        marginTop: Spacing[1.5],
        fontWeight: '600',
    } as TextStyle,
    bottomActions: {
        paddingHorizontal: Spacing[5],
        paddingBottom: Spacing[5],
        paddingTop: Spacing[2],
    } as ViewStyle,
    saveButton: {
        width: '100%',
        paddingVertical: Spacing[4],
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing[2],
    } as ViewStyle,
    saveButtonText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSizes.lg,
    } as TextStyle,
};
