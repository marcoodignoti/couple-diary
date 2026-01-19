import { Redirect, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { EmptyState } from '../../components/ui/EmptyState';
import { HeroCard } from '../../components/ui/HeroCard';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../constants/theme';
import { useMyEntries, useOnThisDay, usePartnerEntries } from '../../hooks/useEntryQueries';
import { useResponsive } from '../../hooks/useResponsive';
import { useStatusBarPadding } from '../../hooks/useStatusBarPadding';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';

/**
 * Check if the reveal window is open (Sunday 10:00-23:59)
 * Returns: { isOpen, countdownText, daysUntilSunday }
 */
function useRevealWindow() {
  return useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const hour = now.getHours();
    const minutes = now.getMinutes();

    // Sunday is 0, Monday is 1, etc.
    const isSunday = dayOfWeek === 0;
    const isAfter10AM = hour >= 10;
    const isOpen = isSunday && isAfter10AM;

    // Calculate countdown
    let countdownText = '';
    if (!isOpen) {
      if (isSunday && !isAfter10AM) {
        // It's Sunday before 10:00
        const hoursLeft = 10 - hour - (minutes > 0 ? 1 : 0);
        const minutesLeft = minutes > 0 ? 60 - minutes : 0;
        countdownText = hoursLeft > 0
          ? `Disponibile tra ${hoursLeft}h ${minutesLeft}m`
          : `Disponibile tra ${minutesLeft} minuti`;
      } else {
        // It's another day
        const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
        countdownText = daysUntilSunday === 1
          ? 'Disponibile domani alle 10:00'
          : `Disponibile domenica alle 10:00`;
      }
    }

    return { isOpen, countdownText };
  }, []);
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, partner, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { isDark, colors } = useTheme();
  const { contentMaxWidth, isTablet, horizontalPadding } = useResponsive();
  const statusBarPadding = useStatusBarPadding();
  const { isOpen: isRevealOpen, countdownText } = useRevealWindow();

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

  // On This Day - entries from same date in past years
  const { data: onThisDayEntries = [] } = useOnThisDay(user?.id, partner?.id);
  const onThisDayEntry = onThisDayEntries[0]; // Show the most recent one

  // Weekly stats - count entries this week
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToSubtract);
    weekStart.setHours(0, 0, 0, 0);

    const count = entries.filter(e => new Date(e.created_at) >= weekStart).length;
    const daysWithEntries = new Set(
      entries
        .filter(e => new Date(e.created_at) >= weekStart)
        .map(e => new Date(e.created_at).toDateString())
    ).size;

    return { count, daysWithEntries };
  }, [entries]);

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
          {/* Featured Card: Write Today - Pink Theme */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} exiting={FadeOut.duration(200)}>
            <HeroCard
              title={todayEntries.length > 0 ? `${todayEntries.length} pensieri oggi` : 'Cosa ti ha fatto sorridere oggi?'}
              content={todayEntries.length > 0
                ? 'Continua a scrivere! Aggiungi un altro pensiero.'
                : 'Condividi i piccoli momenti di gioia con il tuo partner.'
              }
              themeColor="#E8B4B8"
              glowColor="#F9A8D4"
              icon={todayEntry ? "check-circle" : "edit"}
              badgeText={todayEntry ? "Pensiero di Oggi" : "Scrivi"}
              badgeIcon={todayEntry ? "check-circle" : "edit"}
              ctaText={todayEntries.length > 0 ? 'Scrivi ancora' : 'Scrivi Ora'}
              onPress={() => router.push({ pathname: '/entry/new', params: { theme: 'pink' } } as any)}
            />
          </Animated.View>

          {/* Grid: Reveal + Partner */}
          {partner && (
            <Animated.View
              entering={FadeInDown.delay(150).duration(600)}
              exiting={FadeOut.duration(200)}
              style={styles.gridContainer}
            >
              {/* Reveal Card */}
              <View style={styles.gridItem}>
                {isRevealOpen ? (
                  <HeroCard
                    title="Rivelazione"
                    content="Scopri cosa ha scritto il tuo partner!"
                    themeColor="#2E1065" // Cosmic Purple
                    glowColor="#7C3AED"
                    icon="auto-awesome"
                    badgeText="ORA"
                    badgeIcon="lock-open"
                    ctaText="Apri"
                    onPress={() => router.push('/reveal' as any)}
                    size="compact"
                  />
                ) : (
                  <HeroCard
                    title="Rivelazione"
                    content={countdownText}
                    themeColor="#44403c" // Stone 700
                    glowColor="#78716c"
                    icon="lock"
                    badgeText="Attesa"
                    badgeIcon="hourglass-empty"
                    ctaText="Domenica"
                    onPress={() => { }}
                    size="compact"
                    style={{ opacity: 0.85 }}
                  />
                )}
              </View>

              {/* Partner Card */}
              <View style={styles.gridItem}>
                {latestPartnerEntry && latestPartnerEntry.isUnlocked ? (
                  <HeroCard
                    title={partner.name}
                    content={latestPartnerEntry.content}
                    themeColor="#BE123C" // Rose Red
                    glowColor="#FB7185"
                    icon="favorite"
                    badgeText="Nuovo"
                    badgeIcon="notifications-active"
                    ctaText="Leggi"
                    onPress={() => router.push('/partner' as any)}
                    size="compact"
                  />
                ) : (
                  <HeroCard
                    title={partner.name}
                    content={latestPartnerEntry ? 'Ha un pensiero nascosto...' : 'Non ha ancora scritto'}
                    themeColor="#BE123C" // Rose Red
                    glowColor="#FB7185"
                    icon="favorite"
                    badgeText={latestPartnerEntry ? 'Bloccato' : 'Vuoto'}
                    badgeIcon={latestPartnerEntry ? 'lock' : 'edit-off'}
                    ctaText="Aspetta"
                    onPress={() => router.push('/partner' as any)}
                    size="compact"
                    style={{ opacity: 0.75 }}
                  />
                )}
              </View>
            </Animated.View>
          )}

          {/* Weekly Stats Card */}
          {partner && (
            <Animated.View entering={FadeInDown.delay(200).duration(600)} exiting={FadeOut.duration(200)}>
              <HeroCard
                title="Questa Settimana"
                content={`${weeklyStats.count} ${weeklyStats.count === 1 ? 'pensiero' : 'pensieri'} in ${weeklyStats.daysWithEntries} ${weeklyStats.daysWithEntries === 1 ? 'giorno' : 'giorni'}`}
                themeColor="#0D9488" // Teal
                glowColor="#2DD4BF"
                icon="bar-chart"
                badgeText="Statistiche"
                badgeIcon="analytics"
                ctaText="Vedi dettagli"
                onPress={() => { }} // Could link to a stats page later
                size="large"
              />
            </Animated.View>
          )}

          {/* On This Day Card - Only if there are entries from past years */}
          {onThisDayEntry && (
            <Animated.View entering={FadeInDown.delay(250).duration(600)} exiting={FadeOut.duration(200)}>
              <HeroCard
                title={`${new Date(onThisDayEntry.created_at).getFullYear()} - Oggi`}
                content={onThisDayEntry.content}
                themeColor="#D97706"
                glowColor="#F59E0B"
                icon="history"
                badgeText="In Questo Giorno"
                badgeIcon="auto-awesome"
                ctaText="Rivivi il ricordo"
                onPress={() => router.push(`/entry/${onThisDayEntry.id}` as any)}
              />
            </Animated.View>
          )}

          {/* Connect Card - Only if no partner */}
          {!partner && (
            <Animated.View entering={FadeInDown.delay(200).duration(600)} exiting={FadeOut.duration(200)}>
              <HeroCard
                title="Collegati col partner"
                content="Condividi il tuo codice di accoppiamento per iniziare il vostro diario condiviso."
                themeColor={Colors.secondary.DEFAULT}
                glowColor="#F472B6"
                icon="people"
                badgeText="Connetti"
                badgeIcon="group-add"
                onPress={() => router.push('/onboarding/invite' as any)}
              />
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
  cardsContainer: {
    gap: Spacing[4], // Standard 16px
  } as ViewStyle,
  // Grid layout for Reveal + Partner cards
  gridContainer: {
    flexDirection: 'row',
    gap: Spacing[4], // Standard 16px
  } as ViewStyle,
  gridItem: {
    flex: 1,
  } as ViewStyle,
  // Helper for custom Partner Header rendering in HeroCard
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  avatarInitials: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.base,
  } as TextStyle,
  revealTitle: { // Used in custom header
    color: Colors.white,
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
  } as TextStyle,
  revealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  } as ViewStyle,
  revealBadgeText: {
    color: '#FFFFFF',
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  } as TextStyle,
  // Empty State styles usually needed? Checked: used in render
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
  // Locked Reveal Card styles
  lockedRevealContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[4],
  } as ViewStyle,
  lockedIconContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  } as ViewStyle,
  lockedRevealTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing[2],
    textAlign: 'center',
  } as TextStyle,
  lockedRevealSubtitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: Spacing[2],
    textAlign: 'center',
  } as TextStyle,
  lockedRevealHint: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    maxWidth: '90%',
  } as TextStyle,
};
