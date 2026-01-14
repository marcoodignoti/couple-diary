import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EntryCard } from '../../components/EntryCard';
import { FadeInView } from '../../components/ui/Animations';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuthStore } from '../../stores/authStore';
import { useEntryStore } from '../../stores/entryStore';

export default function HomeScreen() {
  const { user, partner, isAuthenticated } = useAuthStore();
  const { entries, timeCapsuleEntry, fetchMyEntries, fetchTimeCapsule, isLoading } = useEntryStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    if (user?.id) {
      fetchMyEntries(user.id);
      fetchTimeCapsule(user.id);
    }
  }, [isAuthenticated, user?.id]);

  const handleRefresh = () => {
    if (user?.id) {
      fetchMyEntries(user.id);
      fetchTimeCapsule(user.id);
    }
  };

  const recentEntries = entries.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      {/* Welcome Card */}
      <FadeInView delay={0}>
        <GlassCard>
          <Text style={styles.greeting}>
            Ciao, {user?.name} 💕
          </Text>
          {partner ? (
            <Text style={styles.partnerStatus}>
              Connesso con {partner.name}
            </Text>
          ) : (
            <Text style={styles.noPartner}>
              Non sei ancora connesso al tuo partner.
              {'\n'}Vai nelle impostazioni per collegarlo.
            </Text>
          )}
        </GlassCard>
      </FadeInView>

      {/* Time Capsule */}
      {timeCapsuleEntry && (
        <FadeInView delay={100}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Un anno fa...</Text>
            <GlassCard>
              <Text style={styles.capsuleIntro}>
                In questo giorno, un anno fa, hai scritto:
              </Text>
              <Text style={styles.capsuleContent} numberOfLines={4}>
                {timeCapsuleEntry.content}
              </Text>
            </GlassCard>
          </View>
        </FadeInView>
      )}

      {/* Weekly Stats */}
      <FadeInView delay={200}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Questa Settimana</Text>
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statNumber}>{entries.length}</Text>
              <Text style={styles.statLabel}>I tuoi pensieri</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statNumber}>{partner ? '💕' : '❓'}</Text>
              <Text style={styles.statLabel}>
                {partner ? 'Connesso!' : 'Non connesso'}
              </Text>
            </GlassCard>
          </View>
        </View>
      </FadeInView>

      {/* Recent Entries */}
      <FadeInView delay={300}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 I tuoi ultimi pensieri</Text>
          {recentEntries.length > 0 ? (
            recentEntries.map((entry, index) => (
              <FadeInView key={entry.id} delay={400 + index * 100}>
                <EntryCard
                  entry={entry}
                  isOwn
                  onPress={() => router.push(`/entry/${entry.id}`)}
                />
              </FadeInView>
            ))
          ) : (
            <GlassCard>
              <Text style={styles.emptyText}>
                Non hai ancora scritto nulla.{'\n'}
                Inizia ora! ✍️
              </Text>
            </GlassCard>
          )}
        </View>
      </FadeInView>
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
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  partnerStatus: {
    fontSize: 15,
    color: '#E8B4B8',
    fontWeight: '500',
  },
  noPartner: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E8B4B8',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  capsuleIntro: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  capsuleContent: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
});
