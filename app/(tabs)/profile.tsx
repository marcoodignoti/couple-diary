import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { createPairingCode, getCurrentPairingCode } from '../../services/pairingService';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
    const { user, partner, signOut, refreshProfile, isLoading } = useAuthStore();
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Refresh profile when screen is focused
    useFocusEffect(
        useCallback(() => {
            refreshProfile();
        }, [])
    );

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshProfile();
        setIsRefreshing(false);
    };

    const handleGenerateCode = async () => {
        if (!user?.id) return;

        setIsGenerating(true);
        try {
            // Check for existing code first
            const existingCode = await getCurrentPairingCode(user.id);
            if (existingCode) {
                setPairingCode(existingCode);
            } else {
                const code = await createPairingCode(user.id);
                setPairingCode(code);
            }
        } catch (error: any) {
            Alert.alert('Errore', error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Esci',
            'Sei sicuro di voler uscire?',
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Esci',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/(auth)/login');
                    }
                },
            ]
        );
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor="#E8B4B8"
                />
            }
        >
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            {/* Partner Status */}
            <GlassCard>
                <Text style={styles.sectionTitle}>💕 Partner</Text>
                {partner ? (
                    <View style={styles.partnerInfo}>
                        <Text style={styles.partnerName}>{partner.name}</Text>
                        <Text style={styles.partnerStatus}>Connesso ✓</Text>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.noPartner}>
                            Non sei ancora connesso a un partner
                        </Text>

                        {pairingCode ? (
                            <View style={styles.codeContainer}>
                                <Text style={styles.codeLabel}>Il tuo codice:</Text>
                                <Text style={styles.code}>{pairingCode}</Text>
                                <Text style={styles.codeHint}>Condividilo con il tuo partner</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.generateButton}
                                onPress={handleGenerateCode}
                                disabled={isGenerating}
                            >
                                <Text style={styles.generateButtonText}>
                                    {isGenerating ? 'Generando...' : 'Genera Codice'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.enterCodeButton}
                            onPress={() => router.push('/(auth)/pairing')}
                        >
                            <Text style={styles.enterCodeText}>
                                Hai un codice? Inseriscilo →
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </GlassCard>

            {/* Stats */}
            <GlassCard>
                <Text style={styles.sectionTitle}>📊 Le tue statistiche</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>-</Text>
                        <Text style={styles.statLabel}>Pensieri scritti</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>-</Text>
                        <Text style={styles.statLabel}>Giorni consecutivi</Text>
                    </View>
                </View>
            </GlassCard>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={isLoading}
                >
                    <Text style={styles.logoutText}>
                        {isLoading ? 'Uscendo...' : 'Esci dall\'account'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* App Info */}
            <Text style={styles.version}>Couple Diary v1.0.0 💕</Text>
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
    header: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8B4B8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#E8B4B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFF',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2C3E50',
    },
    email: {
        fontSize: 14,
        color: '#7F8C8D',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 16,
    },
    partnerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    partnerName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
    },
    partnerStatus: {
        fontSize: 14,
        color: '#27AE60',
        fontWeight: '500',
    },
    noPartner: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 16,
    },
    codeContainer: {
        backgroundColor: 'rgba(232, 180, 184, 0.1)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 12,
    },
    codeLabel: {
        fontSize: 12,
        color: '#7F8C8D',
        marginBottom: 8,
    },
    code: {
        fontSize: 32,
        fontWeight: '700',
        color: '#E8B4B8',
        letterSpacing: 4,
    },
    codeHint: {
        fontSize: 12,
        color: '#7F8C8D',
        marginTop: 8,
    },
    generateButton: {
        backgroundColor: '#E8B4B8',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    generateButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    enterCodeButton: {
        alignItems: 'center',
        padding: 8,
    },
    enterCodeText: {
        fontSize: 14,
        color: '#E8B4B8',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flex: 1,
        backgroundColor: 'rgba(232, 180, 184, 0.1)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: '#E8B4B8',
    },
    statLabel: {
        fontSize: 11,
        color: '#7F8C8D',
        marginTop: 4,
        textAlign: 'center',
    },
    actions: {
        marginTop: 24,
    },
    logoutButton: {
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E74C3C',
    },
    version: {
        fontSize: 12,
        color: '#A0AEC0',
        textAlign: 'center',
        marginTop: 32,
    },
});
