import { Link, Redirect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Icon } from '../../components/ui/Icon';

import { EmptyState } from '../../components/ui/EmptyState';
import { FoggedEntry } from '../../components/ui/FoggedEntry';
import { GlassCard } from '../../components/ui/GlassCard';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../constants/theme';
import { useMyEntries, usePartnerEntries } from '../../hooks/useEntryQueries';
import { useResponsive } from '../../hooks/useResponsive';
import { useStatusBarPadding } from '../../hooks/useStatusBarPadding';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const { user, partner, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { isDark, colors } = useTheme();
  const { contentMaxWidth, isTablet, horizontalPadding } = useResponsive();
  const statusBarPadding = useStatusBarPadding();

  // React Query hooks - data is automatically cached and refetched
  const {
    data: entries = [],
    isLoading: entriesLoading,
    refetch: refetchEntries,
    isRefetching: isRefetchingEntries,
  } = useMyEntries(user?.id);

  const {
    data: partnerEntries = [],
    refetch: refetchPartner,
    isRefetching: isRefetchingPartner,
  } = usePartnerEntries(partner?.id);

  const isLoading = authLoading || entriesLoading;
  const isRefreshing = isRefetchingEntries || isRefetchingPartner;

  // Pull-to-refresh handler using React Query's refetch
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchEntries(),
      partner?.id ? refetchPartner() : Promise.resolve(),
    ]);
  }, [refetchEntries, refetchPartner, partner?.id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  const todayEntries = entries.filter(e => {
    const today = new Date().toISOString().split('T')[0];
    return e.created_at.startsWith(today);
  });

  const todayEntry = todayEntries[0];
  const latestPartnerEntry = partnerEntries[0];

  // Redirect if not authenticated and loaded
  if (!authLoading && !isAuthenticated) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingBottom: 120,
        paddingTop: statusBarPadding,
        paddingHorizontal: horizontalPadding,
        alignItems: isTablet ? 'center' : undefined,
      }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary.DEFAULT} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: '100%', maxWidth: contentMaxWidth }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View>
              <View style={styles.greetingRow}>
                <Text selectable style={[styles.greetingText, { color: isDark ? Colors.white : Colors.text.light }]}>
                  {getGreeting()},{'\n'}{user?.name || 'Amico/a'}.
                </Text>
              </View>
              <Text selectable style={[styles.statusText, { color: isDark ? Colors.stone[400] : Colors.stone[500] }]}>
                {partner ? `Connesso con ${partner.name}` : 'Pronto a connetterti?'}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View layout={LinearTransition} style={styles.cardsContainer}>
          {/* Daily Prompt Card - Solid Premium Style */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} exiting={FadeOut.duration(200)}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/entry/new' as any)}
              style={[
                styles.promptCard,
                {
                  backgroundColor: Colors.primary.DEFAULT,
                  boxShadow: `0px 8px 24px ${Colors.primary.DEFAULT}4D`,
                } as ViewStyle
              ]}
            >
              {/* Decorative background circle */}
              {process.env.EXPO_OS !== 'android' && (
                <View style={styles.decorativeCircle} />
              )}

              <View style={styles.promptHeader}>
                <View style={styles.promptBadge}>
                  <Text style={styles.promptBadgeText}>
                    {todayEntry ? "Pensiero di Oggi" : "Spunto del Giorno"}
                  </Text>
                </View>
                <Icon name={todayEntry ? "check-circle" : "edit"} size={20} color="rgba(255,255,255,0.9)" />
              </View>

              <Text style={styles.promptTitle}>
                {todayEntries.length > 0 ? `${todayEntries.length} pensieri oggi` : 'Cosa ti ha fatto sorridere oggi?'}
              </Text>

              <Text style={styles.promptSubtitle}>
                {todayEntries.length > 0
                  ? 'Continua a scrivere! Aggiungi un altro pensiero al vostro diario.'
                  : 'Condividi i piccoli momenti di gioia. Il tuo partner sta aspettando.'
                }
              </Text>

              <View style={[styles.promptButton, { boxShadow: Shadows.sm } as ViewStyle]}>
                <Icon name="create" size={18} color={Colors.primary.DEFAULT} />
                <Text style={styles.promptButtonText}>
                  {todayEntries.length > 0 ? 'Scrivi ancora' : 'Scrivi Ora'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Partner Entry Card - Glass Style */}
          {partner && (
            <Animated.View entering={FadeInDown.delay(200).duration(600)} exiting={FadeOut.duration(200)}>
              {latestPartnerEntry ? (
                latestPartnerEntry.isUnlocked ? (
                  <GlassCard
                    href="/partner"
                    style={{ borderRadius: 32, borderWidth: 1, borderColor: isDark ? '#333' : 'rgba(255,255,255,0.5)' }}
                  >
                    <View style={styles.partnerHeader}>
                      <Text selectable style={[styles.partnerTitle, { color: isDark ? Colors.white : Colors.text.light }]}>
                        Diario di {partner.name}
                      </Text>
                      <View style={styles.unlockBadge}>
                        <Icon name="lock-open" size={14} color={Colors.primary.DEFAULT} />
                        <Text style={styles.unlockText}>Sbloccato</Text>
                      </View>
                    </View>

                    <Text
                      selectable
                      style={[styles.partnerContent, { color: isDark ? Colors.stone[300] : `${Colors.text.light}CC` }]}
                      numberOfLines={3}
                    >
                      {latestPartnerEntry.content}
                    </Text>

                    <View style={[styles.partnerFooter, { borderTopColor: isDark ? `${Colors.stone[800]}80` : Colors.stone[100] }]}>
                      <Text style={styles.readMoreText}>Leggi tutto</Text>
                      <Icon name="chevron-right" size={18} color={Colors.primary.DEFAULT} />
                    </View>
                  </GlassCard>
                ) : (
                  <Link href="/partner" asChild>
                    <Link.Trigger>
                      <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
                        <FoggedEntry entry={latestPartnerEntry} />
                      </Pressable>
                    </Link.Trigger>
                    <Link.Preview />
                  </Link>
                )
              ) : (
                <GlassCard style={{ alignItems: 'center', padding: 32, borderRadius: 32 }}>
                  <View style={[styles.emptyPartnerIcon, { backgroundColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}>
                    <Icon name="edit-off" size={24} color={Colors.stone[300]} />
                  </View>
                  <Text selectable style={[styles.emptyPartnerTitle, { color: isDark ? Colors.white : Colors.text.light }]}>
                    {partner.name} non ha ancora scritto
                  </Text>
                  <Text selectable style={styles.emptyPartnerSubtitle}>
                    Ricordagli di condividere la sua giornata!
                  </Text>
                </GlassCard>
              )}
            </Animated.View>
          )}

          {/* Connect Card - Only if no partner */}
          {!partner && (
            <Animated.View entering={FadeInDown.delay(200).duration(600)} exiting={FadeOut.duration(200)}>
              <TouchableOpacity
                onPress={() => router.push('/onboarding/invite' as any)}
                activeOpacity={0.9}
                style={[
                  styles.connectCard,
                  {
                    backgroundColor: Colors.secondary.DEFAULT,
                    boxShadow: `0px 8px 24px ${Colors.secondary.DEFAULT}4D`,
                  } as ViewStyle
                ]}
              >
                <View style={styles.connectHeader}>
                  <Icon name="people" size={20} color={Colors.white} />
                  <Text style={styles.connectBadgeText}>Connetti</Text>
                </View>
                <Text style={styles.connectTitle}>Collegati col partner</Text>
                <Text style={styles.connectSubtitle}>
                  Condividi il tuo codice di accoppiamento per iniziare il vostro diario condiviso.
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Empty State */}
          {entries.length === 0 && !isLoading && (
            <Animated.View entering={FadeInDown.delay(300).duration(600)} exiting={FadeOut.duration(200)}>
              <EmptyState
                icon="menu-book"
                title="Il tuo diario è vuoto"
                description="Inizia a scrivere il tuo primo pensiero."
                actionLabel="Scrivi Primo Pensiero"
                onAction={() => router.push('/entry/new' as any)}
              />
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = {
  headerContainer: {
    marginBottom: Spacing[8],
  } as ViewStyle,
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  } as ViewStyle,
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[1],
  } as ViewStyle,
  brandText: {
    color: Colors.secondary.DEFAULT,
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  } as TextStyle,
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: Spacing[2],
  } as ViewStyle,
  greetingText: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
    lineHeight: FontSizes['3xl'] * 1.1,
  } as TextStyle,
  statusText: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    marginTop: Spacing[2],
  } as TextStyle,
  divider: {
    height: 1,
    width: '100%',
    marginBottom: Spacing[8],
    opacity: 0.5,
  } as ViewStyle,
  cardsContainer: {
    gap: Spacing[6],
  } as ViewStyle,
  promptCard: {
    borderRadius: 32,
    borderCurve: 'continuous',
    padding: Spacing[6],
    position: 'relative',
    overflow: 'hidden',
  } as ViewStyle,
  decorativeCircle: {
    position: 'absolute',
    right: -48,
    top: -48,
    width: 192,
    height: 192,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.full,
  } as ViewStyle,
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
    zIndex: 10,
  } as ViewStyle,
  promptBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  } as ViewStyle,
  promptBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  } as TextStyle,
  promptTitle: {
    color: Colors.white,
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing[2],
    zIndex: 10,
  } as TextStyle,
  promptSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * 1.625,
    marginBottom: Spacing[6],
    zIndex: 10,
    maxWidth: '90%',
  } as TextStyle,
  promptButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    borderCurve: 'continuous',
    paddingVertical: Spacing[3.5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    zIndex: 10,
  } as ViewStyle,
  promptButtonText: {
    color: Colors.primary.DEFAULT,
    fontWeight: '700',
    fontSize: FontSizes.base,
  } as TextStyle,
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  } as ViewStyle,
  partnerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  } as TextStyle,
  unlockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  } as ViewStyle,
  unlockText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.stone[400],
  } as TextStyle,
  partnerContent: {
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * 1.625,
    marginBottom: Spacing[4],
  } as TextStyle,
  partnerFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing[4],
    borderTopWidth: 1,
  } as ViewStyle,
  readMoreText: {
    color: Colors.secondary.DEFAULT,
    fontWeight: '700',
    fontSize: FontSizes.sm,
    marginRight: Spacing[1],
  } as TextStyle,
  emptyPartnerIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  } as ViewStyle,
  emptyPartnerTitle: {
    fontWeight: '700',
    fontSize: FontSizes.lg,
    marginBottom: Spacing[1],
  } as TextStyle,
  emptyPartnerSubtitle: {
    color: Colors.stone[400],
    textAlign: 'center',
    fontSize: FontSizes.sm,
  } as TextStyle,
  connectCard: {
    borderRadius: 32,
    borderCurve: 'continuous',
    padding: Spacing[6],
  } as ViewStyle,
  connectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  } as ViewStyle,
  connectBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  } as TextStyle,
  connectTitle: {
    color: Colors.white,
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing[2],
  } as TextStyle,
  connectSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * 1.625,
  } as TextStyle,
};
