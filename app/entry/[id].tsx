import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { addReaction, getReactions } from '../../services/reactionService';
import { useAuthStore } from '../../stores/authStore';
import { useEntryStore } from '../../stores/entryStore';
import type { Reaction } from '../../types';
import { MOODS } from '../../utils/constants';
import { formatDate } from '../../utils/dates';

export default function EntryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, partner } = useAuthStore();
    const { entries, partnerEntries } = useEntryStore();

    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Find entry from either user or partner entries
    const entry = [...entries, ...partnerEntries].find(e => e.id === id);
    const isOwn = entry?.user_id === user?.id;

    useEffect(() => {
        if (id) {
            loadReactions();
        }
    }, [id]);

    const loadReactions = async () => {
        if (!id) return;
        try {
            const data = await getReactions(id);
            setReactions(data);
        } catch (error) {
            console.error('Failed to load reactions:', error);
        }
    };

    const handleAddHeartReaction = async () => {
        if (!id || !user?.id) return;

        setIsLoading(true);
        try {
            await addReaction(id, user.id, 0, 0, 'heart');
            Alert.alert('💕', 'Cuore aggiunto!');
            loadReactions();
        } catch (error: any) {
            Alert.alert('Errore', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!entry) {
        return (
            <View style={styles.container}>
                <View style={styles.notFound}>
                    <Text style={styles.notFoundEmoji}>🔍</Text>
                    <Text style={styles.notFoundText}>Voce non trovata</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backLink}>← Torna indietro</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const moodData = entry.mood ? MOODS.find(m => m.id === entry.mood) : null;
    const authorName = isOwn ? 'Tu' : partner?.name || 'Partner';
    const heartReactions = reactions.filter(r => r.reaction_type === 'heart');

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Indietro</Text>
                </TouchableOpacity>
            </View>

            {/* Entry Card */}
            <GlassCard>
                {/* Meta info */}
                <View style={styles.meta}>
                    <View>
                        <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
                        <Text style={styles.author}>
                            {isOwn ? 'I tuoi pensieri' : `Da ${authorName} 💕`}
                        </Text>
                    </View>
                    {moodData && (
                        <View style={styles.moodBadge}>
                            <Text style={styles.moodEmoji}>{moodData.emoji}</Text>
                            <Text style={styles.moodLabel}>{moodData.label}</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <Text style={styles.entryContent}>{entry.content}</Text>

                {/* Special date badge */}
                {entry.is_special_date && (
                    <View style={styles.specialBadge}>
                        <Text style={styles.specialText}>✨ Occasione Speciale</Text>
                    </View>
                )}
            </GlassCard>

            {/* Reactions section */}
            {!isOwn && (
                <View style={styles.reactionsSection}>
                    <Text style={styles.sectionTitle}>Reagisci 💕</Text>

                    <View style={styles.reactionButtons}>
                        <TouchableOpacity
                            style={styles.reactionButton}
                            onPress={handleAddHeartReaction}
                            disabled={isLoading}
                        >
                            <Text style={styles.reactionEmoji}>❤️</Text>
                            <Text style={styles.reactionLabel}>
                                Cuore {heartReactions.length > 0 && `(${heartReactions.length})`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Show reactions on own entries */}
            {isOwn && reactions.length > 0 && (
                <View style={styles.reactionsSection}>
                    <Text style={styles.sectionTitle}>
                        {partner?.name} ha reagito 💕
                    </Text>
                    <GlassCard>
                        {heartReactions.length > 0 && (
                            <Text style={styles.reactionInfo}>
                                ❤️ {heartReactions.length} cuor{heartReactions.length > 1 ? 'i' : 'e'}
                            </Text>
                        )}
                    </GlassCard>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6',
    },
    content: {
        padding: 16,
        paddingTop: 60,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 16,
    },
    backButton: {
        fontSize: 16,
        color: '#E8B4B8',
        fontWeight: '500',
    },
    notFound: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    notFoundEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    notFoundText: {
        fontSize: 18,
        color: '#7F8C8D',
        marginBottom: 16,
    },
    backLink: {
        fontSize: 16,
        color: '#E8B4B8',
    },
    meta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    date: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
    },
    author: {
        fontSize: 13,
        color: '#E8B4B8',
        marginTop: 4,
    },
    moodBadge: {
        alignItems: 'center',
        backgroundColor: 'rgba(232, 180, 184, 0.1)',
        padding: 8,
        borderRadius: 12,
    },
    moodEmoji: {
        fontSize: 28,
    },
    moodLabel: {
        fontSize: 10,
        color: '#7F8C8D',
        marginTop: 2,
    },
    entryContent: {
        fontSize: 18,
        lineHeight: 28,
        color: '#2C3E50',
    },
    specialBadge: {
        marginTop: 20,
        alignSelf: 'flex-start',
        backgroundColor: '#FFD700',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    specialText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2C3E50',
    },
    reactionsSection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 12,
        marginLeft: 4,
    },
    reactionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    reactionButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#E8B4B8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    reactionEmoji: {
        fontSize: 32,
        marginBottom: 4,
    },
    reactionLabel: {
        fontSize: 12,
        color: '#7F8C8D',
    },
    reactionInfo: {
        fontSize: 16,
        color: '#2C3E50',
    },
});
