import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MoodPicker } from '../../components/ui/MoodPicker';
import { useAuthStore } from '../../stores/authStore';
import { useEntryStore } from '../../stores/entryStore';
import type { Mood } from '../../types';
import { getUnlockDate } from '../../utils/dates';

export default function WriteScreen() {
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<Mood | null>(null);
    const [isSpecialDate, setIsSpecialDate] = useState(false);
    const [specialDate, setSpecialDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { user } = useAuthStore();
    const { createEntry, isLoading } = useEntryStore();

    const handleSave = async () => {
        if (!content.trim()) {
            Alert.alert('Oops!', 'Scrivi qualcosa prima di salvare 📝');
            return;
        }

        if (!user?.id) {
            Alert.alert('Errore', 'Devi essere autenticato');
            return;
        }

        await createEntry(
            user.id,
            content.trim(),
            mood,
            isSpecialDate,
            isSpecialDate ? specialDate : undefined
        );

        const error = useEntryStore.getState().error;
        if (error) {
            Alert.alert('Errore', error);
        } else {
            // Success - clear form
            setContent('');
            setMood(null);
            setIsSpecialDate(false);

            const unlockDate = getUnlockDate(isSpecialDate, specialDate);
            Alert.alert(
                'Salvato! 💕',
                `Il tuo pensiero sarà sbloccato ${isSpecialDate ? 'nella data speciale' : 'domenica'}.`
            );
        }
    };

    const unlockPreviewDate = getUnlockDate(isSpecialDate, specialDate);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* Date info */}
                <View style={styles.dateInfo}>
                    <Text style={styles.dateLabel}>
                        📅 {new Date().toLocaleDateString('it-IT', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        })}
                    </Text>
                </View>

                {/* Main text input */}
                <View style={styles.editorContainer}>
                    <TextInput
                        style={styles.editor}
                        multiline
                        placeholder="Cosa hai nel cuore oggi?..."
                        placeholderTextColor="#A0AEC0"
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical="top"
                    />
                </View>

                {/* Character count */}
                <Text style={styles.charCount}>
                    {content.length} caratteri
                </Text>

                {/* Mood picker */}
                <MoodPicker selectedMood={mood} onSelect={setMood} />

                {/* Special date toggle */}
                <View style={styles.specialContainer}>
                    <View style={styles.specialHeader}>
                        <View>
                            <Text style={styles.specialTitle}>✨ Occasione Speciale</Text>
                            <Text style={styles.specialDesc}>
                                Scegli una data specifica per lo sblocco
                            </Text>
                        </View>
                        <Switch
                            value={isSpecialDate}
                            onValueChange={setIsSpecialDate}
                            trackColor={{ false: '#E5E7EB', true: '#E8B4B8' }}
                            thumbColor={isSpecialDate ? '#FFF' : '#F4F4F5'}
                        />
                    </View>

                    {isSpecialDate && (
                        <TouchableOpacity
                            style={styles.datePicker}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.datePickerText}>
                                📅 {specialDate.toLocaleDateString('it-IT', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {showDatePicker && (
                        <DateTimePicker
                            value={specialDate}
                            mode="date"
                            minimumDate={new Date()}
                            onChange={(event, date) => {
                                setShowDatePicker(false);
                                if (date) setSpecialDate(date);
                            }}
                        />
                    )}
                </View>

                {/* Unlock preview */}
                <View style={styles.unlockPreview}>
                    <Text style={styles.unlockLabel}>🔒 Si sbloccherà:</Text>
                    <Text style={styles.unlockDate}>
                        {unlockPreviewDate.toLocaleDateString('it-IT', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </Text>
                </View>

                {/* Save button */}
                <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading ? 'Salvataggio...' : 'Salva nel Diario 💕'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    dateInfo: {
        marginBottom: 16,
    },
    dateLabel: {
        fontSize: 14,
        color: '#7F8C8D',
        textTransform: 'capitalize',
    },
    editorContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        minHeight: 200,
        shadowColor: '#E8B4B8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    editor: {
        fontSize: 17,
        lineHeight: 26,
        color: '#2C3E50',
        minHeight: 160,
    },
    charCount: {
        fontSize: 12,
        color: '#A0AEC0',
        textAlign: 'right',
        marginTop: 8,
        marginRight: 4,
    },
    specialContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
    },
    specialHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    specialTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
    },
    specialDesc: {
        fontSize: 13,
        color: '#7F8C8D',
        marginTop: 2,
    },
    datePicker: {
        backgroundColor: 'rgba(232, 180, 184, 0.15)',
        borderRadius: 12,
        padding: 14,
        marginTop: 16,
        alignItems: 'center',
    },
    datePickerText: {
        fontSize: 16,
        color: '#E8B4B8',
        fontWeight: '500',
    },
    unlockPreview: {
        backgroundColor: 'rgba(232, 180, 184, 0.1)',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        alignItems: 'center',
    },
    unlockLabel: {
        fontSize: 13,
        color: '#7F8C8D',
    },
    unlockDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E8B4B8',
        marginTop: 4,
        textTransform: 'capitalize',
    },
    saveButton: {
        backgroundColor: '#E8B4B8',
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#E8B4B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
});
