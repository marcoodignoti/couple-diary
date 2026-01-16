import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageStyle, KeyboardAvoidingView, ScrollView, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Icon, IconName } from '../../components/ui/Icon';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../constants/theme';
import { useStatusBarPadding } from '../../hooks/useStatusBarPadding';
import { useTheme } from '../../hooks/useTheme';
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

export default function EntryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuthStore();
    const { entries, updateEntry, deleteEntry, isLoading } = useEntryStore();
    const { isDark, colors } = useTheme();
    const statusBarPadding = useStatusBarPadding();

    const entry = entries.find(e => e.id === id);
    const isOwn = entry?.user_id === user?.id;

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(entry?.content || '');
    const [editMood, setEditMood] = useState<Mood | null>(entry?.mood || null);

    if (!entry) {
        return (
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{ flex: 1, backgroundColor: colors.background }}
                contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
                <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
                    <Icon name="search-off" size={64} color={Colors.primary.DEFAULT} />
                    <Text style={[styles.emptyTitle, { color: isDark ? Colors.white : Colors.text.light }]}>Ricordo Non Trovato</Text>
                    <Text style={styles.emptyText}>Questo ricordo potrebbe essere stato eliminato.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
                        <Text style={styles.backButtonText}>Torna Indietro</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        );
    }

    const getMoodData = (mood: Mood | null) => MOODS.find(m => m.value === mood);
    const moodData = getMoodData(entry.mood);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('it-IT', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('it-IT', { hour: 'numeric', minute: '2-digit' });
    };

    const handleEdit = () => {
        setEditContent(entry.content);
        setEditMood(entry.mood);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!editContent.trim()) {
            Alert.alert('Diario Vuoto', 'Scrivi qualcosa prima di salvare.');
            return;
        }

        try {
            await updateEntry(entry.id, editContent.trim(), editMood);
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Errore', 'Impossibile salvare i cambiamenti. Riprova.');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Elimina Ricordo',
            'Sei sicuro di voler eliminare questo ricordo? Non potrai più recuperarlo.',
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Elimina',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteEntry(entry.id);
                            router.back();
                        } catch (error) {
                            Alert.alert('Errore', 'Impossibile eliminare il ricordo. Riprova.');
                        }
                    },
                },
            ]
        );
    };

    const handleCancelEdit = () => {
        setEditContent(entry.content);
        setEditMood(entry.mood);
        setIsEditing(false);
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
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: isDark ? Colors.stone[800] : Colors.stone[100], paddingTop: statusBarPadding }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} activeOpacity={0.7}>
                        <Icon name="arrow-back" size={24} color={isDark ? Colors.white : Colors.text.light} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.text.light }]}>
                        {isEditing ? 'Modifica Ricordo' : 'Dettagli Ricordo'}
                    </Text>

                    {isOwn && !isEditing && (
                        <TouchableOpacity onPress={handleEdit} style={styles.headerButton} activeOpacity={0.7}>
                            <Icon name="edit" size={22} color={Colors.primary.DEFAULT} />
                        </TouchableOpacity>
                    )}
                    {isEditing && (
                        <TouchableOpacity onPress={handleCancelEdit} style={styles.headerButton} activeOpacity={0.7}>
                            <Icon name="close" size={24} color={Colors.stone[400]} />
                        </TouchableOpacity>
                    )}
                    {!isOwn && <View style={styles.headerButton} />}
                </View>

                <View style={styles.content}>
                    {/* Date & Time Header */}
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.dateSection}>
                        <Text selectable style={[styles.dateText, { color: isDark ? Colors.white : Colors.text.light }]}>
                            {formatDate(entry.created_at)}
                        </Text>
                        <Text selectable style={styles.timeText}>{formatTime(entry.created_at)}</Text>
                    </Animated.View>

                    {/* Photo */}
                    {entry.photo_url && (
                        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.photoSection}>
                            <View style={[
                                styles.photoContainer,
                                {
                                    borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                                    backgroundColor: isDark ? Colors.stone[800] : Colors.stone[100],
                                    boxShadow: Shadows.sm,
                                } as ViewStyle
                            ]}>
                                <Image
                                    source={{ uri: entry.photo_url }}
                                    style={styles.photo}
                                    resizeMode="cover"
                                />
                            </View>
                        </Animated.View>
                    )}

                    {/* Mood Badge */}
                    {!isEditing && moodData && (
                        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.moodSection}>
                            <View style={[
                                styles.moodBadge,
                                {
                                    backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                                    borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                                }
                            ]}>
                                <Icon name={moodData.icon} size={28} color={moodData.color} />
                                <Text style={[styles.moodText, { color: isDark ? Colors.white : Colors.text.light }]}>Mi sento {moodData.label}</Text>
                            </View>
                        </Animated.View>
                    )}

                    {/* Content */}
                    {isEditing ? (
                        <Animated.View entering={FadeIn.duration(300)} style={styles.editSection}>
                            {/* Mood Selector */}
                            <Text style={[styles.editLabel, { color: Colors.stone[500] }]}>Umore</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScrollView}>
                                <View style={styles.moodList}>
                                    {MOODS.map((mood) => (
                                        <TouchableOpacity
                                            key={mood.value}
                                            onPress={() => setEditMood(editMood === mood.value ? null : mood.value)}
                                            style={[
                                                styles.moodItem,
                                                {
                                                    backgroundColor: editMood === mood.value
                                                        ? `${Colors.primary.DEFAULT}1A`
                                                        : isDark ? Colors.surface.dark : Colors.white,
                                                    borderColor: editMood === mood.value
                                                        ? Colors.primary.DEFAULT
                                                        : isDark ? Colors.stone[700] : Colors.stone[200],
                                                }
                                            ]}
                                            activeOpacity={0.7}
                                        >
                                            <Icon
                                                name={mood.icon}
                                                size={24}
                                                color={editMood === mood.value ? mood.color : Colors.stone[400]}
                                            />
                                            <Text style={[
                                                styles.moodItemLabel,
                                                { color: editMood === mood.value ? (isDark ? Colors.white : Colors.text.light) : Colors.stone[400] }
                                            ]}>
                                                {mood.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>

                            {/* Content Editor */}
                            <Text style={[styles.editLabel, { color: Colors.stone[500] }]}>Pensiero</Text>
                            <View style={[
                                styles.editorCard,
                                {
                                    backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                                    borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                                }
                            ]}>
                                <TextInput
                                    multiline
                                    textAlignVertical="top"
                                    placeholder="Scrivi i tuoi pensieri..."
                                    placeholderTextColor={Colors.stone[400]}
                                    style={[styles.editorInput, { color: isDark ? Colors.white : Colors.text.light }]}
                                    value={editContent}
                                    onChangeText={setEditContent}
                                    editable={!isLoading}
                                />
                            </View>
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                            <View style={[
                                styles.contentCard,
                                {
                                    backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                                    borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                                    boxShadow: Shadows.sm,
                                } as ViewStyle
                            ]}>
                                <Text selectable style={[styles.contentText, { color: isDark ? Colors.text.dark : Colors.text.light }]}>
                                    {entry.content}
                                </Text>
                            </View>
                        </Animated.View>
                    )}

                    {/* Special Date Badge */}
                    {entry.is_special_date && !isEditing && (
                        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.specialSection}>
                            <View style={styles.specialBadge}>
                                <Icon name="star" size={20} color={Colors.secondary.DEFAULT} />
                                <Text style={styles.specialText}>Occasione Speciale</Text>
                            </View>
                        </Animated.View>
                    )}

                    {/* Delete Button (when not editing) */}
                    {isOwn && !isEditing && (
                        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.deleteSection}>
                            <TouchableOpacity
                                onPress={handleDelete}
                                style={[styles.deleteButton, { borderColor: isDark ? '#7f1d1d' : '#fecaca' }]}
                                activeOpacity={0.7}
                            >
                                <Icon name="delete-outline" size={20} color="#ef4444" />
                                <Text style={styles.deleteText}>Elimina Ricordo</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>

                {/* Save Button (when editing) */}
                {isEditing && (
                    <View style={[styles.saveSection, { backgroundColor: colors.background, borderTopColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={handleSave}
                            disabled={isLoading || !editContent.trim()}
                            style={[
                                styles.saveButton,
                                {
                                    backgroundColor: editContent.trim() ? Colors.primary.DEFAULT : Colors.stone[300],
                                    boxShadow: editContent.trim() ? Shadows.lg : 'none',
                                } as ViewStyle
                            ]}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <>
                                    <Icon name="check" size={24} color={Colors.white} />
                                    <Text style={styles.saveButtonText}>Salva Modifiche</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </ScrollView>
    );
}

const styles = {
    emptyContainer: {
        alignItems: 'center',
        padding: Spacing[8],
    } as ViewStyle,
    emptyTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        marginTop: Spacing[4],
        marginBottom: Spacing[2],
    } as TextStyle,
    emptyText: {
        color: Colors.stone[500],
        textAlign: 'center',
        marginBottom: Spacing[6],
        fontSize: FontSizes.base,
    } as TextStyle,
    backButton: {
        backgroundColor: Colors.primary.DEFAULT,
        paddingHorizontal: Spacing[6],
        paddingVertical: Spacing[3],
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    backButtonText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSizes.base,
    } as TextStyle,
    header: {
        paddingHorizontal: Spacing[5],
        paddingVertical: Spacing[3],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    } as ViewStyle,
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    headerTitle: {
        fontWeight: '700',
        fontSize: FontSizes.lg,
    } as TextStyle,
    content: {
        paddingHorizontal: Spacing[5],
        paddingBottom: 120,
        paddingTop: Spacing[4],
    } as ViewStyle,
    dateSection: {
        marginBottom: Spacing[6],
    } as ViewStyle,
    dateText: {
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
        marginBottom: Spacing[1],
        textTransform: 'capitalize',
    } as TextStyle,
    timeText: {
        color: Colors.stone[500],
        fontSize: FontSizes.base,
    } as TextStyle,
    photoSection: {
        marginBottom: Spacing[6],
    } as ViewStyle,
    photoContainer: {
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        overflow: 'hidden',
        borderWidth: 1,
        height: 300,
    } as ViewStyle,
    photo: {
        width: '100%',
        height: '100%',
    } as ImageStyle,
    moodSection: {
        marginBottom: Spacing[6],
    } as ViewStyle,
    moodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[3],
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[3],
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        borderWidth: 1,
        alignSelf: 'flex-start',
    } as ViewStyle,
    moodText: {
        fontWeight: '600',
        fontSize: FontSizes.base,
    } as TextStyle,
    editSection: {
        marginBottom: Spacing[6],
    } as ViewStyle,
    editLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        marginBottom: Spacing[3],
    } as TextStyle,
    moodScrollView: {
        marginBottom: Spacing[5],
    } as ViewStyle,
    moodList: {
        flexDirection: 'row',
        gap: Spacing[3],
    } as ViewStyle,
    moodItem: {
        width: 72,
        alignItems: 'center',
        paddingVertical: Spacing[3],
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        borderWidth: 1,
    } as ViewStyle,
    moodItemLabel: {
        fontSize: FontSizes.xs,
        marginTop: Spacing[1],
        fontWeight: '500',
    } as TextStyle,
    editorCard: {
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        borderWidth: 1,
        minHeight: 200,
    } as ViewStyle,
    editorInput: {
        flex: 1,
        padding: Spacing[4],
        fontSize: FontSizes.lg,
        lineHeight: FontSizes.lg * 1.625,
        minHeight: 200,
        textAlignVertical: 'top',
    } as TextStyle,
    contentCard: {
        borderRadius: 24,
        borderCurve: 'continuous',
        padding: Spacing[6],
        borderWidth: 1,
        marginBottom: Spacing[6],
    } as ViewStyle,
    contentText: {
        fontSize: FontSizes.lg,
        lineHeight: FontSizes.lg * 1.625,
    } as TextStyle,
    specialSection: {
        marginBottom: Spacing[6],
    } as ViewStyle,
    specialBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[2],
        backgroundColor: `${Colors.secondary.DEFAULT}1A`,
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[3],
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        alignSelf: 'flex-start',
    } as ViewStyle,
    specialText: {
        color: Colors.secondary.DEFAULT,
        fontWeight: '600',
        fontSize: FontSizes.base,
    } as TextStyle,
    deleteSection: {
        marginTop: Spacing[8],
    } as ViewStyle,
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing[2],
        paddingVertical: Spacing[4],
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        borderWidth: 1,
    } as ViewStyle,
    deleteText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: FontSizes.base,
    } as TextStyle,
    saveSection: {
        paddingHorizontal: Spacing[5],
        paddingBottom: Spacing[5],
        paddingTop: Spacing[2],
        borderTopWidth: 1,
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
