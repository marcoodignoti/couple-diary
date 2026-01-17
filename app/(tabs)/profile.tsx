import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ImageStyle, ScrollView, Switch, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon } from '../../components/ui/Icon';

import { GlassCard } from '../../components/ui/GlassCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';
import { useStatusBarPadding } from '../../hooks/useStatusBarPadding';
import { useTheme } from '../../hooks/useTheme';
import {
    authenticate,
    getPrivacyLockPreference,
    isBiometricsSupported,
    setPrivacyLockPreference
} from '../../services/biometricService';
import { getNotificationPreference, setNotificationPreference } from '../../services/notificationService';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, partner, isLoading, signOut } = useAuthStore();
    const { isDark, colors } = useTheme();
    const { contentMaxWidth, isTablet, horizontalPadding } = useResponsive();
    const statusBarPadding = useStatusBarPadding();

    // Notification State
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

    // Privacy Lock State
    const [privacyLockEnabled, setPrivacyLockEnabled] = React.useState(false);
    const [biometricsAvailable, setBiometricsAvailable] = React.useState(false);

    React.useEffect(() => {
        // Load preferences
        getNotificationPreference().then(setNotificationsEnabled);

        // Privacy Lock
        isBiometricsSupported().then(setBiometricsAvailable);
        getPrivacyLockPreference().then(setPrivacyLockEnabled);
    }, []);

    const toggleNotifications = async (value: boolean) => {
        setNotificationsEnabled(value); // Optimistic update
        await setNotificationPreference(value);
    };

    const togglePrivacyLock = async (originalValue: boolean) => {
        // If turning ON, authenticate first to verify owner
        const newValue = !originalValue;

        if (newValue) {
            const authenticated = await authenticate();
            if (authenticated) {
                setPrivacyLockEnabled(true);
                await setPrivacyLockPreference(true);
            }
        } else {
            // Turning OFF is easy
            setPrivacyLockEnabled(false);
            await setPrivacyLockPreference(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Disconnetti',
            'Sei sicuro di voler uscire?',
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Esci',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/onboarding/welcome' as any);
                    }
                },
            ]
        );
    };

    const getCoupleDate = () => {
        if (user?.created_at) {
            const date = new Date(user.created_at);
            return date.getFullYear().toString();
        }
        return 'Oggi';
    };

    // Loading State
    if (isLoading) {
        return (
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{ flex: 1, backgroundColor: colors.background }}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: statusBarPadding, paddingHorizontal: Spacing[5] }}
            >
                <View style={styles.loadingProfileContainer}>
                    <Skeleton width={112} height={112} borderRadius={56} style={{ marginBottom: Spacing[4] }} />
                    <Skeleton width={160} height={28} style={{ marginBottom: Spacing[2] }} />
                    <Skeleton width={120} height={24} borderRadius={12} />
                </View>
                <Skeleton height={72} borderRadius={24} style={{ marginBottom: Spacing[3] }} />
                <Skeleton height={72} borderRadius={24} style={{ marginBottom: Spacing[3] }} />
                <Skeleton height={72} borderRadius={24} />
            </ScrollView>
        );
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
            showsVerticalScrollIndicator={false}
        >
            <View style={{ width: '100%', maxWidth: contentMaxWidth }}>
                {/* Profile Header */}
                <Animated.View entering={FadeInDown.duration(600)} style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={[
                            styles.avatarWrapper,
                            {
                                borderColor: isDark ? Colors.surface.dark : Colors.white,
                                backgroundColor: Colors.stone[200],
                                boxShadow: Shadows.soft,
                            } as ViewStyle
                        ]}>
                            {user?.email ? (
                                <Image
                                    source={{ uri: `https://api.dicebear.com/7.x/initials/png?seed=${user.name}&backgroundColor=C0847C` }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Icon name="person" size={48} color={Colors.stone[400]} />
                                </View>
                            )}
                        </View>
                        {partner && (
                            <View style={[
                                styles.heartBadge,
                                {
                                    borderColor: isDark ? Colors.background.dark : Colors.white,
                                    boxShadow: Shadows.md,
                                } as ViewStyle
                            ]}>
                                <Icon name="favorite" size={14} color={Colors.white} />
                            </View>
                        )}
                    </View>
                    <Text selectable style={[styles.profileName, { color: isDark ? Colors.white : Colors.text.light }]}>
                        {user?.name || 'Utente'}{partner ? ` & ${partner.name}` : ''}
                    </Text>
                    {partner && (
                        <View style={[styles.coupleBadge, { backgroundColor: isDark ? `${Colors.primary.dark}33` : `${Colors.primary.DEFAULT}1A` }]}>
                            <Text style={[styles.coupleBadgeText, { color: isDark ? Colors.primary.dark : Colors.primary.DEFAULT }]}>
                                Insieme dal {getCoupleDate()}
                            </Text>
                        </View>
                    )}
                    {!partner && (
                        <TouchableOpacity
                            onPress={() => router.push('/onboarding/invite' as any)}
                            style={styles.connectPartnerButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.connectPartnerText}>Connetti Partner →</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {/* Memories */}
                    <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                        <GlassCard onPress={() => router.push('/calendar' as any)}>
                            <View style={styles.menuRow}>
                                <View style={styles.menuLeft}>
                                    <View style={[styles.menuIcon, { backgroundColor: isDark ? `${Colors.primary.DEFAULT}33` : `${Colors.primary.DEFAULT}1A` }]}>
                                        <Icon name="collections" size={22} color={Colors.primary.DEFAULT} />
                                    </View>
                                    <View>
                                        <Text style={[styles.menuTitle, { color: isDark ? Colors.text.dark : Colors.text.light }]}>I Nostri Ricordi</Text>
                                        <Text style={[styles.menuSubtitle, { color: isDark ? `${Colors.text.dark}99` : `${Colors.text.light}99` }]}>Foto e momenti speciali</Text>
                                    </View>
                                </View>
                                <Icon name="chevron-right" size={24} color={Colors.stone[300]} />
                            </View>
                        </GlassCard>
                    </Animated.View>

                    {/* Notifications */}
                    <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                        <GlassCard>
                            <View style={styles.menuRow}>
                                <View style={styles.menuLeft}>
                                    <View style={[styles.menuIcon, { backgroundColor: isDark ? `${Colors.secondary.DEFAULT}33` : `${Colors.secondary.DEFAULT}1A` }]}>
                                        <Icon name="notifications-active" size={22} color={Colors.secondary.DEFAULT} />
                                    </View>
                                    <View>
                                        <Text style={[styles.menuTitle, { color: isDark ? Colors.text.dark : Colors.text.light }]}>Notifiche</Text>
                                        <Text style={[styles.menuSubtitle, { color: isDark ? `${Colors.text.dark}99` : `${Colors.text.light}99` }]}>Promemoria giornalieri</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={toggleNotifications}
                                    trackColor={{ false: Colors.stone[300], true: Colors.secondary.DEFAULT }}
                                    thumbColor={Colors.white}
                                />
                            </View>
                        </GlassCard>
                    </Animated.View>

                    {/* Privacy Lock */}
                    <Animated.View entering={FadeInDown.delay(300).duration(600)}>
                        <GlassCard>
                            <View style={styles.menuRow}>
                                <View style={styles.menuLeft}>
                                    <View style={[styles.menuIcon, { backgroundColor: isDark ? 'rgba(20, 184, 166, 0.2)' : 'rgba(20, 184, 166, 0.1)' }]}>
                                        <Icon name="lock" size={22} color="#14b8a6" />
                                    </View>
                                    <View>
                                        <Text style={[styles.menuTitle, { color: isDark ? Colors.text.dark : Colors.text.light }]}>Blocco Privacy</Text>
                                        <Text style={[styles.menuSubtitle, { color: isDark ? `${Colors.text.dark}99` : `${Colors.text.light}99` }]}>Biometria e passcode</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={privacyLockEnabled}
                                    onValueChange={() => togglePrivacyLock(privacyLockEnabled)}
                                    disabled={!biometricsAvailable}
                                    trackColor={{ false: Colors.stone[300], true: '#14b8a6' }}
                                    thumbColor={Colors.white}
                                />
                            </View>
                        </GlassCard>
                    </Animated.View>

                    {/* Account Section */}
                    <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.accountSection}>
                        <Text style={styles.sectionLabel}>Account</Text>
                        <View style={[
                            styles.accountCard,
                            {
                                backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                                borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                                boxShadow: Shadows.sm,
                            } as ViewStyle
                        ]}>
                            <TouchableOpacity
                                onPress={() => router.push('/profile/edit' as any)}
                                style={[styles.accountRow, { borderBottomColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.accountRowText, { color: isDark ? Colors.text.dark : Colors.text.light }]}>Modifica Profilo</Text>
                                <Icon name="arrow-forward-ios" size={14} color={Colors.stone[300]} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.accountRow, { borderBottomColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.accountRowText, { color: isDark ? Colors.text.dark : Colors.text.light }]}>Piano Abbonamento</Text>
                                <View style={styles.planRow}>
                                    <View style={styles.freeBadge}>
                                        <Text style={styles.freeBadgeText}>FREE</Text>
                                    </View>
                                    <Icon name="arrow-forward-ios" size={14} color={Colors.stone[300]} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleLogout}
                                style={styles.logoutRow}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.logoutText}>Esci</Text>
                                <Icon name="logout" size={18} color="#fecaca" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>


                    <View style={styles.footer}>
                        <Text style={styles.versionText}>Couple Diary v2.4.0</Text>
                        <Text style={styles.footerText}>Fatto con ❤️ per voi due</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = {
    loadingProfileContainer: {
        alignItems: 'center',
        marginBottom: Spacing[6],
    } as ViewStyle,
    profileHeader: {
        alignItems: 'center',
        marginBottom: Spacing[8],
    } as ViewStyle,
    avatarContainer: {
        position: 'relative',
        marginBottom: Spacing[4],
    } as ViewStyle,
    avatarWrapper: {
        width: 112,
        height: 112,
        borderRadius: 56,
        borderWidth: 4,
        overflow: 'hidden',
    } as ViewStyle,
    avatarImage: {
        width: '100%',
        height: '100%',
    } as ImageStyle,
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    heartBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 32,
        height: 32,
        backgroundColor: Colors.secondary.DEFAULT,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    } as ViewStyle,
    profileName: {
        fontSize: FontSizes['2xl'],
        fontWeight: '800',
        marginBottom: Spacing[1],
    } as TextStyle,
    coupleBadge: {
        paddingHorizontal: Spacing[3],
        paddingVertical: Spacing[1],
        borderRadius: BorderRadius.full,
        marginTop: Spacing[2],
    } as ViewStyle,
    coupleBadgeText: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        letterSpacing: 0.5,
    } as TextStyle,
    connectPartnerButton: {
        backgroundColor: `${Colors.secondary.DEFAULT}1A`,
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[2],
        borderRadius: BorderRadius.full,
        marginTop: Spacing[2],
    } as ViewStyle,
    connectPartnerText: {
        color: Colors.secondary.DEFAULT,
        fontSize: FontSizes.sm,
        fontWeight: '700',
        letterSpacing: 0.5,
    } as TextStyle,
    menuContainer: {
        gap: Spacing[2],
    } as ViewStyle,
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[4],
    } as ViewStyle,
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    menuTitle: {
        fontWeight: '700',
        fontSize: FontSizes.lg,
    } as TextStyle,
    menuSubtitle: {
        fontSize: FontSizes.xs,
    } as TextStyle,
    accountSection: {
        paddingTop: Spacing[6],
    } as ViewStyle,
    sectionLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: Colors.stone[400],
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing[2],
        marginLeft: Spacing[4],
    } as TextStyle,
    accountCard: {
        borderRadius: 32,
        borderCurve: 'continuous',
        borderWidth: 1,
        overflow: 'hidden',
    } as ViewStyle,
    accountRow: {
        padding: Spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    } as ViewStyle,
    accountRowText: {
        fontWeight: '500',
        fontSize: FontSizes.base,
    } as TextStyle,
    planRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[2],
    } as ViewStyle,
    freeBadge: {
        backgroundColor: `${Colors.secondary.DEFAULT}1A`,
        paddingHorizontal: Spacing[2],
        paddingVertical: Spacing[1],
        borderRadius: BorderRadius.md,
    } as ViewStyle,
    freeBadgeText: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        color: Colors.secondary.DEFAULT,
    } as TextStyle,
    logoutRow: {
        padding: Spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,
    logoutText: {
        color: '#ef4444',
        fontWeight: '500',
        fontSize: FontSizes.base,
    } as TextStyle,
    debugButton: {
        marginTop: Spacing[8],
        alignSelf: 'center',
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[2],
        borderRadius: BorderRadius.full,
        opacity: 0.5,
    } as ViewStyle,
    debugText: {
        fontSize: 10,
        color: Colors.stone[400],
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '700',
    } as TextStyle,
    footer: {
        marginTop: Spacing[4],
        marginBottom: Spacing[8],
        alignItems: 'center',
    } as ViewStyle,
    versionText: {
        fontSize: FontSizes.xs,
        color: Colors.stone[400],
    } as TextStyle,
    footerText: {
        fontSize: FontSizes.xs,
        color: Colors.stone[300],
        marginTop: Spacing[1],
    } as TextStyle,
};
