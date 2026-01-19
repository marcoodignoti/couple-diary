import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, ImageStyle, ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Icon, IconName } from '../../../components/ui/Icon';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../../../constants/theme';
import { usePartnerEntries } from '../../../hooks/useEntryQueries';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../stores/authStore';
import type { Mood } from '../../../types';

const getMoodData = (mood: Mood | null) => {
    const moods: Record<string, { icon: IconName; color: string; label: string }> = {
        happy: { icon: 'sentiment-satisfied', color: '#D4AF37', label: 'Happy' },
        love: { icon: 'favorite', color: '#C0847C', label: 'In Love' },
        grateful: { icon: 'volunteer-activism', color: '#14b8a6', label: 'Grateful' },
        peaceful: { icon: 'spa', color: '#60a5fa', label: 'Peaceful' },
        excited: { icon: 'celebration', color: '#f59e0b', label: 'Excited' },
        sad: { icon: 'sentiment-dissatisfied', color: '#64748b', label: 'Sad' },
        anxious: { icon: 'psychology', color: '#8b5cf6', label: 'Anxious' },
        tired: { icon: 'bedtime', color: '#a8a29e', label: 'Tired' },
    };
    return mood ? moods[mood] : null;
};

export default function PartnerEntryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { partner } = useAuthStore();
    const { data: partnerEntries = [] } = usePartnerEntries(partner?.id);
    const { isDark, colors } = useTheme();

    const entry = partnerEntries.find(e => e.id === id);
    const moodData = entry ? getMoodData(entry.mood) : null;

    // Entry not found or locked
    if (!entry) {
        return (
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{ flex: 1, backgroundColor: colors.background }}
                contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
                <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
                    <Icon name="search-off" size={64} color={Colors.primary.DEFAULT} />
                    <Text style={[styles.emptyTitle, { color: isDark ? Colors.white : Colors.text.light }]}>Entry Not Found</Text>
                    <Text style={styles.emptyText}>This entry may have been deleted or isn't unlocked yet.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        );
    }

    if (!entry.isUnlocked) {
        return (
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{ flex: 1, backgroundColor: colors.background }}
                contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
                <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
                    <Icon name="lock" size={64} color={Colors.secondary.DEFAULT} />
                    <Text style={[styles.emptyTitle, { color: isDark ? Colors.white : Colors.text.light }]}>Entry Locked</Text>
                    <Text selectable style={styles.emptyText}>
                        This entry unlocks on {new Date(entry.unlock_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
                    </Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        );
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ paddingHorizontal: Spacing[5], paddingBottom: Spacing[10], paddingTop: Spacing[4] }}
        >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDark ? Colors.stone[800] : Colors.stone[100] }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} activeOpacity={0.7}>
                    <Icon name="arrow-back" size={24} color={isDark ? Colors.white : Colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.text.light }]}>
                    {partner?.name}'s Entry
                </Text>
                <View style={styles.headerButton} />
            </View>

            {/* Author Badge */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.authorSection}>
                <View style={[styles.authorBadge, { backgroundColor: isDark ? `${Colors.primary.DEFAULT}33` : `${Colors.primary.DEFAULT}1A` }]}>
                    <Icon name="favorite" size={20} color={Colors.primary.DEFAULT} />
                    <Text style={styles.authorText}>From {partner?.name}</Text>
                </View>
            </Animated.View>

            {/* Date & Time Header */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.dateSection}>
                <Text selectable style={[styles.dateText, { color: isDark ? Colors.white : Colors.text.light }]}>
                    {formatDate(entry.created_at)}
                </Text>
                <Text selectable style={styles.timeText}>{formatTime(entry.created_at)}</Text>
            </Animated.View>

            {/* Photo */}
            {entry.photo_url && (
                <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.photoSection}>
                    <View style={[
                        styles.photoContainer,
                        {
                            borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                            backgroundColor: isDark ? Colors.stone[800] : Colors.stone[100],
                            boxShadow: Shadows.sm,
                        } as ViewStyle
                    ]}>
                        <Image
                            source={{ uri: entry.photo_url }}
                            style={styles.photo}
                            resizeMode="cover"
                        />
                    </View>
                </Animated.View>
            )}

            {/* Mood Badge */}
            {moodData && (
                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.moodSection}>
                    <View style={[
                        styles.moodBadge,
                        {
                            backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                            borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                        }
                    ]}>
                        <Icon name={moodData.icon} size={28} color={moodData.color} />
                        <Text style={[styles.moodText, { color: isDark ? Colors.white : Colors.text.light }]}>Feeling {moodData.label}</Text>
                    </View>
                </Animated.View>
            )}

            {/* Content */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                <View style={[
                    styles.contentCard,
                    {
                        backgroundColor: isDark ? Colors.surface.dark : Colors.white,
                        borderColor: isDark ? Colors.stone[800] : Colors.stone[100],
                        boxShadow: Shadows.sm,
                    } as ViewStyle
                ]}>
                    <Text selectable style={[styles.contentText, { color: isDark ? Colors.text.dark : Colors.text.light }]}>
                        {entry.content}
                    </Text>
                </View>
            </Animated.View>

            {/* Special Date Badge */}
            {entry.is_special_date && (
                <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.specialSection}>
                    <View style={styles.specialBadge}>
                        <Icon name="star" size={20} color={Colors.secondary.DEFAULT} />
                        <Text style={styles.specialText}>Special Occasion</Text>
                    </View>
                </Animated.View>
            )}

            {/* Love Note */}
            <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.loveNoteSection}>
                <View style={[styles.loveNote, { backgroundColor: isDark ? `${Colors.primary.DEFAULT}1A` : `${Colors.primary.DEFAULT}0D` }]}>
                    <Icon name="favorite" size={32} color={Colors.primary.DEFAULT} />
                    <Text style={[styles.loveNoteText, { color: isDark ? Colors.stone[400] : Colors.stone[600] }]}>
                        {partner?.name} shared this moment with you 💕
                    </Text>
                </View>
            </Animated.View>
        </ScrollView>
    );
}

const styles = {
    emptyContainer: {
        alignItems: 'center',
        padding: Spacing[8],
    } as ViewStyle,
    emptyTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        marginTop: Spacing[4],
        marginBottom: Spacing[2],
    } as TextStyle,
    emptyText: {
        color: Colors.stone[500],
        textAlign: 'center',
        marginBottom: Spacing[6],
        fontSize: FontSizes.base,
    } as TextStyle,
    backButton: {
        backgroundColor: Colors.primary.DEFAULT,
        paddingHorizontal: Spacing[6],
        paddingVertical: Spacing[3],
        borderRadius: BorderRadius.full,
    } as ViewStyle,
    backButtonText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSizes.base,
    } as TextStyle,
    header: {
        paddingVertical: Spacing[3],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        marginBottom: Spacing[4],
    } as ViewStyle,
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    headerTitle: {
        fontWeight: '700',
        fontSize: FontSizes.lg,
    } as TextStyle,
    authorSection: {
        marginBottom: Spacing[4],
    } as ViewStyle,
    authorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[3],
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[3],
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        alignSelf: 'flex-start',
    } as ViewStyle,
    authorText: {
        color: Colors.primary.DEFAULT,
        fontWeight: '600',
        fontSize: FontSizes.base,
    } as TextStyle,
    dateSection: {
        marginBottom: Spacing[6],
    } as ViewStyle,
    dateText: {
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
        marginBottom: Spacing[1],
    } as TextStyle,
    timeText: {
        color: Colors.stone[500],
        fontSize: FontSizes.base,
    } as TextStyle,
    photoSection: {
        marginBottom: Spacing[6],
    } as ViewStyle,
    photoContainer: {
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        overflow: 'hidden',
        borderWidth: 1,
        height: 300,
    } as ViewStyle,
    photo: {
        width: '100%',
        height: '100%',
    } as ImageStyle,
    moodSection: {
        marginBottom: Spacing[6],
    } as ViewStyle,
    moodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[3],
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[3],
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        borderWidth: 1,
        alignSelf: 'flex-start',
    } as ViewStyle,
    moodText: {
        fontWeight: '600',
        fontSize: FontSizes.base,
    } as TextStyle,
    contentCard: {
        borderRadius: 24,
        borderCurve: 'continuous',
        padding: Spacing[6],
        borderWidth: 1,
        marginBottom: Spacing[6],
    } as ViewStyle,
    contentText: {
        fontSize: FontSizes.lg,
        lineHeight: FontSizes.lg * 1.625,
    } as TextStyle,
    specialSection: {
        marginBottom: Spacing[6],
    } as ViewStyle,
    specialBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[2],
        backgroundColor: `${Colors.secondary.DEFAULT}1A`,
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[3],
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        alignSelf: 'flex-start',
    } as ViewStyle,
    specialText: {
        color: Colors.secondary.DEFAULT,
        fontWeight: '600',
        fontSize: FontSizes.base,
    } as TextStyle,
    loveNoteSection: {
        marginTop: Spacing[4],
    } as ViewStyle,
    loveNote: {
        borderRadius: BorderRadius['2xl'],
        borderCurve: 'continuous',
        padding: Spacing[5],
        alignItems: 'center',
    } as ViewStyle,
    loveNoteText: {
        textAlign: 'center',
        marginTop: Spacing[2],
        fontWeight: '500',
        fontSize: FontSizes.base,
    } as TextStyle,
};
