import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Entry, PartnerEntry } from '../types';
import { MOODS } from '../utils/constants';
import { formatDate, formatRelativeTime } from '../utils/dates';
import { AnimatedPressable } from './ui/Animations';

interface EntryCardProps {
    entry: Entry | PartnerEntry;
    isOwn?: boolean;
    onPress?: () => void;
}

export function EntryCard({ entry, isOwn = false, onPress }: EntryCardProps) {
    const moodData = entry.mood
        ? MOODS.find(m => m.id === entry.mood)
        : null;

    return (
        <AnimatedPressable
            style={styles.container}
            onPress={onPress}
            disabled={!onPress}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
                    <Text style={styles.relativeTime}>
                        {formatRelativeTime(entry.created_at)}
                    </Text>
                </View>
                {moodData && (
                    <View style={styles.moodContainer}>
                        <Text style={styles.moodEmoji}>{moodData.emoji}</Text>
                    </View>
                )}
            </View>

            {/* Content preview */}
            <Text style={styles.content} numberOfLines={4}>
                {entry.content}
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
                {entry.is_special_date && (
                    <View style={styles.specialBadge}>
                        <Text style={styles.specialText}>✨ Speciale</Text>
                    </View>
                )}
                {!isOwn && (
                    <Text style={styles.authorHint}>
                        Dal tuo amore 💕
                    </Text>
                )}
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 20,
        padding: 20,
        marginVertical: 8,
        shadowColor: '#E8B4B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    date: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2C3E50',
    },
    relativeTime: {
        fontSize: 12,
        color: '#7F8C8D',
        marginTop: 2,
    },
    moodContainer: {
        backgroundColor: 'rgba(232, 180, 184, 0.2)',
        padding: 8,
        borderRadius: 12,
    },
    moodEmoji: {
        fontSize: 28,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        color: '#2C3E50',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    specialBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    specialText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#2C3E50',
    },
    authorHint: {
        fontSize: 12,
        color: '#E8B4B8',
        fontStyle: 'italic',
    },
});

export default EntryCard;
