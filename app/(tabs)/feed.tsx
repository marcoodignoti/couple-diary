import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EntryCard } from '../../components/EntryCard';
import { FoggedEntry } from '../../components/ui/FoggedEntry';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuthStore } from '../../stores/authStore';
import { useEntryStore } from '../../stores/entryStore';

export default function FeedScreen() {
    const { partner } = useAuthStore();
    const { partnerEntries, fetchPartnerEntries, isLoading } = useEntryStore();

    useEffect(() => {
        if (partner?.id) {
            fetchPartnerEntries(partner.id);
        }
    }, [partner?.id]);

    const handleRefresh = () => {
        if (partner?.id) {
            fetchPartnerEntries(partner.id);
        }
    };

    // Separate unlocked and locked entries
    const unlockedEntries = partnerEntries.filter(e => e.isUnlocked);
    const lockedEntries = partnerEntries.filter(e => !e.isUnlocked);

    if (!partner) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>💔</Text>
                    <Text style={styles.emptyTitle}>Non ancora connesso</Text>
                    <Text style={styles.emptyText}>
                        Collega il tuo partner per vedere i suoi pensieri.
                    </Text>
                    <GlassCard
                        onPress={() => router.push('/(auth)/pairing')}
                        style={{ marginTop: 24 }}
                    >
                        <Text style={styles.connectText}>
                            Collega Partner →
                        </Text>
                    </GlassCard>
                </View>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
            }
        >
            {/* Partner header */}
            <GlassCard>
                <View style={styles.partnerHeader}>
                    <Text style={styles.partnerEmoji}>💕</Text>
                    <View>
                        <Text style={styles.partnerName}>
                            I pensieri di {partner.name}
                        </Text>
                        <Text style={styles.partnerHint}>
                            Le nuove voci si sbloccano ogni domenica
                        </Text>
                    </View>
                </View>
            </GlassCard>

            {/* Locked entries (current week) */}
            {lockedEntries.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        🔒 In arrivo domenica...
                    </Text>
                    {lockedEntries.map((entry) => (
                        <FoggedEntry key={entry.id} entry={entry} />
                    ))}
                </View>
            )}

            {/* Unlocked entries */}
            {unlockedEntries.length > 0 ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        💌 Da leggere
                    </Text>
                    {unlockedEntries.map((entry) => (
                        <EntryCard
                            key={entry.id}
                            entry={entry}
                            onPress={() => router.push(`/entry/${entry.id}`)}
                        />
                    ))}
                </View>
            ) : (
                <View style={styles.section}>
                    <GlassCard>
                        <Text style={styles.noEntriesText}>
                            {partner.name} non ha ancora scritto nulla.{'\n'}
                            Ma sicuramente sta pensando a te! 💕
                        </Text>
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
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 22,
    },
    connectText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E8B4B8',
        textAlign: 'center',
    },
    partnerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    partnerEmoji: {
        fontSize: 40,
    },
    partnerName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2C3E50',
    },
    partnerHint: {
        fontSize: 13,
        color: '#7F8C8D',
        marginTop: 2,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 12,
        marginLeft: 4,
    },
    noEntriesText: {
        fontSize: 15,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 24,
    },
});
