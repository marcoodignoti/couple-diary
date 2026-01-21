import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Mood } from '../../types';
import { MOODS } from '../../utils/constants';

interface MoodPickerProps {
    selectedMood: Mood | null;
    onSelect: (mood: Mood | null) => void;
}

export const MoodPicker = React.memo(function MoodPicker({ selectedMood, onSelect }: MoodPickerProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Come ti senti oggi?</Text>
            <View style={styles.grid}>
                {MOODS.map((mood) => (
                    <TouchableOpacity
                        key={mood.id}
                        style={[
                            styles.moodItem,
                            selectedMood === mood.id && styles.moodItemSelected,
                        ]}
                        onPress={() => onSelect(selectedMood === mood.id ? null : mood.id as Mood)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={mood.label}
                        accessibilityState={{ selected: selectedMood === mood.id }}
                    >
                        <Text style={styles.emoji}>{mood.emoji}</Text>
                        <Text style={[
                            styles.moodLabel,
                            selectedMood === mood.id && styles.moodLabelSelected,
                        ]}>
                            {mood.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    moodItem: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        width: '23%',
        minWidth: 70,
        minHeight: 44, // iOS HIG touch target
    },
    moodItemSelected: {
        backgroundColor: '#E8B4B8',
        boxShadow: '0px 2px 4px rgba(232, 180, 184, 0.3)',
    },
    emoji: {
        fontSize: 28,
        marginBottom: 4,
    },
    moodLabel: {
        fontSize: 10,
        color: '#7F8C8D',
        textAlign: 'center',
    },
    moodLabelSelected: {
        color: '#FFF',
        fontWeight: '600',
    },
});

export default MoodPicker;
