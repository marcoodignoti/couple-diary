
import { Icon } from '@/components/ui/Icon';
import { SpecialDatePickerSheet } from '@/components/ui/SpecialDatePickerSheet';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '@/constants/theme';
import { useCreateEntry } from '@/hooks/useEntryQueries';
import { pickImage, takePhoto, uploadPhoto } from '@/services/photoService';
import { useAuthStore } from '@/stores/authStore';
import { Mood } from '@/types';
import { clearDraft, loadDraft, saveDraft } from '@/utils/drafts';
import BottomSheet from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ImageStyle, KeyboardAvoidingView, ScrollView, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Constants
const MOODS: { value: Mood; icon: string; label: string; color: string }[] = [
    { value: 'happy', icon: 'sentiment-very-satisfied', label: 'Felice', color: '#FCD34D' },
    { value: 'calm', icon: 'spa', label: 'Calmo', color: '#6EE7B7' },
    { value: 'sad', icon: 'sentiment-dissatisfied', label: 'Triste', color: '#93C5FD' },
    { value: 'angry', icon: 'mood-bad', label: 'Arrabbiato', color: '#FCA5A5' },
    { value: 'excited', icon: 'bolt', label: 'Emozionato', color: '#FDBA74' },
    { value: 'tired', icon: 'bedtime', label: 'Stanco', color: '#C4B5FD' },
];

const scheduleAutoSave = (data: any) => {
    saveDraft(data);
};

export default function NewEntryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const statusBarPadding = insets.top;
    const { theme } = useLocalSearchParams<{ theme?: string }>(); // Get theme param
    const { user } = useAuthStore();
    const createEntryMutation = useCreateEntry();
    // ... existing hooks
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [specialDate, setSpecialDate] = useState<Date | null>(null); // New state
    const [isSpecial, setIsSpecial] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [lastSaved, setLastSaved] = useState<number | null>(null);

    // Ref for date picker sheet
    const dateSheetRef = React.useRef<BottomSheet>(null);

    // Load draft on mount
    React.useEffect(() => {
        const draft = loadDraft();
        // Only show prompt if draft has actual content
        if (draft && draft.content && draft.content.trim().length > 0) {
            Alert.alert(
                'Bozza Trovata',
                'Vuoi riprendere da dove avevi lasciato?',
                [
                    { text: 'Scarta', style: 'destructive', onPress: clearDraft },
                    {
                        text: 'Riprendi',
                        onPress: () => {
                            setContent(draft.content);
                            setSelectedMood(draft.mood);
                            if (draft.imageUri) setImageUri(draft.imageUri);
                        }
                    }
                ]
            );
        }
    }, []);

    // Auto-save on content change (only if there's content)
    React.useEffect(() => {
        if (content.trim().length > 0 || imageUri) {
            saveDraft({ content, mood: selectedMood, imageUri });
            setLastSaved(Date.now());
        }
    }, [content, selectedMood, imageUri]);

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


            await createEntryMutation.mutateAsync({
                userId: user.id,
                content: content.trim(),
                mood: selectedMood,
                photoUrl,
                isSpecial: !!specialDate, // True if date is selected
                specialDate: specialDate || undefined, // Pass the date
            });

            clearDraft();
            router.back();
        } catch (error: any) {
            console.error('Save error', error);
            Alert.alert('Errore', `Impossibile salvare il diario: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    // Theme Logic
    const isPinkTheme = theme === 'pink';
    const activeBackgroundColor = isPinkTheme ? '#E8B4B8' : Colors.primary.DEFAULT;
    const activeGlowColor = isPinkTheme ? '#F9A8D4' : '#2DD4BF';

    return (
        <View style={{ flex: 1, backgroundColor: activeBackgroundColor }}>
            {/* Hero Background Elements */}
            <View style={[styles.heroGlow, { backgroundColor: activeGlowColor }]} />
            <Icon name="edit" size={300} color="#FFFFFF" style={styles.heroBgIcon as any} />

            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{ flex: 1 }}
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
                                style={[styles.closeButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                                activeOpacity={0.7}
                            >
                                <Icon name="close" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Il Tuo Pensiero</Text>
                            <View style={styles.headerSpacer} />
                        </View>

                        <View style={styles.content}>

                            {/* Text Editor Area */}
                            <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                                <View style={[
                                    styles.editorCard,
                                    {
                                        backgroundColor: '#FFFFFF',
                                        borderColor: 'transparent',
                                        boxShadow: Shadows.md,
                                    } as ViewStyle
                                ]}>
                                    <TextInput
                                        multiline
                                        textAlignVertical="top"
                                        placeholder="Scrivi col cuore..."
                                        placeholderTextColor={Colors.stone[400]}
                                        style={[styles.textInput, { color: Colors.text.light }]}
                                        value={content}
                                        onChangeText={setContent}
                                        editable={!isUploading}
                                    />

                                    {/* Photo Preview */}
                                    {imageUri && (
                                        <View style={styles.photoPreviewContainer}>
                                            <View style={[styles.photoPreview, { boxShadow: Shadows.sm } as ViewStyle]}>
                                                <Image source={{ uri: imageUri }} style={styles.photoImage} contentFit="cover" transition={200} />
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
                                                style={[styles.mediaButton, { backgroundColor: Colors.stone[100] }]}
                                                activeOpacity={0.7}
                                            >
                                                <Icon name="image" size={24} color={Colors.stone[500]} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={handleTakePhoto}
                                                style={[styles.mediaButton, { backgroundColor: Colors.stone[100] }]}
                                                activeOpacity={0.7}
                                            >
                                                <Icon name="camera-alt" size={24} color={Colors.stone[500]} />
                                            </TouchableOpacity>

                                            {/* Special Day Toggle */}
                                            <TouchableOpacity
                                                onPress={() => dateSheetRef.current?.expand()}
                                                style={[
                                                    styles.mediaButton,
                                                    {
                                                        backgroundColor: specialDate ? Colors.secondary.DEFAULT : Colors.stone[100],
                                                        paddingHorizontal: specialDate ? Spacing[3] : Spacing[2],
                                                        flexDirection: 'row',
                                                        gap: Spacing[1],
                                                        alignItems: 'center'
                                                    }
                                                ]}
                                                activeOpacity={0.7}
                                            >
                                                <Icon name={specialDate ? "event" : "event-available"} size={24} color={specialDate ? Colors.white : Colors.stone[500]} />
                                                {specialDate && (
                                                    <Text style={{ color: Colors.white, fontWeight: '600', fontSize: FontSizes.xs }}>
                                                        {specialDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                        <View style={[styles.wordCountBadge, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                                            <Text selectable style={[styles.wordCountText, { fontVariant: ['tabular-nums'], color: Colors.stone[500] }]}>
                                                {wordCount} parole
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>

                            {/* Mood Selector */}
                            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.moodSection}>
                                <Text style={[styles.moodLabel, { color: 'rgba(255,255,255,0.9)' }]}>Come ti senti?</Text>
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
                                                            ? '#FFFFFF'
                                                            : 'rgba(255,255,255,0.2)',
                                                        borderColor: selectedMood === mood.value
                                                            ? '#FFFFFF'
                                                            : 'rgba(255,255,255,0.1)',
                                                        borderWidth: selectedMood === mood.value ? 2 : 1,
                                                    }
                                                ]}
                                                activeOpacity={0.7}
                                            >
                                                <Icon
                                                    name={mood.icon}
                                                    size={28}
                                                    color={selectedMood === mood.value ? mood.color : '#FFFFFF'}
                                                />
                                                <Text style={[
                                                    styles.moodItemLabel,
                                                    { color: selectedMood === mood.value ? Colors.text.light : '#FFFFFF' }
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
                        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={[styles.bottomActions, { backgroundColor: 'transparent' }]}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={handleSave}
                                disabled={isUploading || (!content.trim() && !imageUri)}
                                style={[
                                    styles.saveButton,
                                    {
                                        backgroundColor: content.trim() || imageUri ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                                        boxShadow: content.trim() || imageUri ? Shadows.lg : 'none',
                                    } as ViewStyle
                                ]}
                            >
                                {isUploading ? (
                                    <ActivityIndicator color={Colors.primary.DEFAULT} />
                                ) : (
                                    <>
                                        <Icon name="check" size={24} color={content.trim() || imageUri ? Colors.primary.DEFAULT : 'rgba(255,255,255,0.5)'} />
                                        <Text style={[styles.saveButtonText, { color: content.trim() || imageUri ? Colors.primary.DEFAULT : 'rgba(255,255,255,0.5)' }]}>Salva nel Diario</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>

            {/* Date Picker Sheet */}
            <SpecialDatePickerSheet
                ref={dateSheetRef}
                initialDate={specialDate || new Date()}
                onDateSelected={(date) => setSpecialDate(date)}
                onRemoveDate={specialDate ? () => setSpecialDate(null) : undefined}
            />
        </View>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing[5],
        paddingBottom: Spacing[4],
        paddingTop: Spacing[2],
    } as ViewStyle,
    mediaButtons: {
        flexDirection: 'row',
        gap: Spacing[2],
    } as ViewStyle,
    mediaButton: {
        padding: Spacing[2],
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.stone[100],
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
    voiceSection: {
        marginBottom: Spacing[1],
    } as ViewStyle,
    voicePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.stone[100],
        padding: Spacing[2],
        paddingRight: Spacing[4],
        borderRadius: BorderRadius.full,
        gap: Spacing[2],
        alignSelf: 'flex-start',
    } as ViewStyle,
    voiceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[2],
    } as ViewStyle,
    voiceDuration: {
        fontFamily: 'SpaceMono',
        fontSize: FontSizes.sm,
        color: Colors.stone[600],
        fontWeight: '500',
    } as TextStyle,
    removeVoiceButton: {
        padding: Spacing[1],
        backgroundColor: Colors.stone[200],
        borderRadius: BorderRadius.full,
        marginLeft: Spacing[2],
    } as ViewStyle,
    // Hero Styles
    heroGlow: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: BorderRadius.full,
        backgroundColor: '#2DD4BF', // Teal Glow
        opacity: 0.3,
        transform: [{ scale: 1.5 }],
    } as ViewStyle,
    heroBgIcon: {
        position: 'absolute',
        bottom: -50,
        right: -50,
        opacity: 0.1,
        transform: [{ rotate: '-15deg' }],
    } as TextStyle,
};
