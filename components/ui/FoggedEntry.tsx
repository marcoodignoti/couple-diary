import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PartnerEntry } from '../../types';
import { MOODS } from '../../utils/constants';
import { formatDate } from '../../utils/dates';

interface FoggedEntryProps {
    entry: PartnerEntry;
}

/**
 * Displays a fogged/blurred entry preview
 * Shows date and mood, but content is obscured with blur effect
 */
export function FoggedEntry({ entry }: FoggedEntryProps) {
    // Find mood emoji if exists
    const moodData = entry.mood
        ? MOODS.find(m => m.id === entry.mood)
        : null;

    // Generate placeholder blocks based on content length
    const contentLength = entry.content.length;
    const lines = Math.min(Math.ceil(contentLength / 40), 5); // Max 5 lines

    return (
        <View style={styles.container}>
            {/* Header with date and mood */}
            <View style={styles.header}>
                <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
                {moodData && (
                    <Text style={styles.mood}>{moodData.emoji}</Text>
                )}
            </View>

            {/* Fogged content area */}
            <View style={styles.contentWrapper}>
                <BlurView intensity={80} tint="light" style={styles.blur}>
                    <View style={styles.placeholderContainer}>
                        {Array.from({ length: lines }).map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.placeholderLine,
                                    // Last line is shorter for realism
                                    index === lines - 1 && { width: '60%' }
                                ]}
                            />
                        ))}
                    </View>
                </BlurView>

                {/* Lock icon overlay */}
                <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>🔒</Text>
                    <Text style={styles.lockText}>Si sblocca domenica</Text>
                </View>
            </View>

            {/* Special date badge */}
            {entry.is_special_date && (
                <View style={styles.specialBadge}>
                    <Text style={styles.specialText}>✨ Occasione Speciale</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 32,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    date: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C3E50',
    },
    mood: {
        fontSize: 24,
    },
    contentWrapper: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        minHeight: 100,
    },
    blur: {
        padding: 16,
        minHeight: 100,
    },
    placeholderContainer: {
        gap: 8,
    },
    placeholderLine: {
        height: 12,
        backgroundColor: 'rgba(44, 62, 80, 0.2)',
        borderRadius: 6,
        width: '100%',
    },
    lockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    lockIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    lockText: {
        fontSize: 12,
        color: '#7F8C8D',
        fontWeight: '500',
    },
    specialBadge: {
        marginTop: 12,
        alignSelf: 'flex-start',
        backgroundColor: '#FFD700',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    specialText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2C3E50',
    },
});

export default FoggedEntry;
