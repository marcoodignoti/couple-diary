import { Link } from 'expo-router';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import type { Entry, PartnerEntry } from '../types';
import { MOODS } from '../utils/constants';
import { formatDate, formatRelativeTime } from '../utils/dates';

interface EntryCardProps {
    entry: Entry | PartnerEntry;
    isOwn?: boolean;
    href?: string;
    onPress?: () => void;
    onDelete?: () => void;
}

export function EntryCard({ entry, isOwn = false, href, onPress, onDelete }: EntryCardProps) {
    const moodData = entry.mood
        ? MOODS.find(m => m.id === entry.mood)
        : null;

    const handleShare = async () => {
        try {
            await Share.share({
                message: entry.content,
                title: `Pensiero del ${formatDate(entry.created_at)}`,
            });
        } catch (error) {
            console.error('Error sharing');
        }
    };

    const cardContent = (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text selectable style={styles.date}>{formatDate(entry.created_at)}</Text>
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
            <Text selectable style={styles.content} numberOfLines={4}>
                {entry.content}
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
                {entry.is_special_date && (
                    <View style={styles.specialBadge}>
                        <Text style={styles.specialText}>Speciale</Text>
                    </View>
                )}
                {!isOwn && (
                    <Text style={styles.authorHint}>
                        Dal tuo amore
                    </Text>
                )}
            </View>
        </View>
    );

    // If href is provided, use Link with Preview and Context Menu
    if (href) {
        return (
            <Link href={href as any} asChild>
                <Link.Trigger>
                    <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
                        {cardContent}
                    </Pressable>
                </Link.Trigger>
                {isOwn && onDelete ? (
                    <Link.Menu>
                        <Link.MenuAction
                            title="Condividi"
                            icon="square.and.arrow.up"
                            onPress={handleShare}
                        />
                        <Link.MenuAction
                            title="Elimina"
                            icon="trash"
                            destructive
                            onPress={onDelete}
                        />
                    </Link.Menu>
                ) : (
                    <Link.Menu>
                        <Link.MenuAction
                            title="Condividi"
                            icon="square.and.arrow.up"
                            onPress={handleShare}
                        />
                    </Link.Menu>
                )}
                <Link.Preview />
            </Link>
        );
    }

    // Fallback to simple pressable for backward compatibility
    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
                {cardContent}
            </Pressable>
        );
    }

    // Non-interactive card
    return cardContent;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 20,
        borderCurve: 'continuous',
        padding: 20,
        marginVertical: 8,
        boxShadow: '0px 4px 12px rgba(232, 180, 184, 0.15)',
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
        borderCurve: 'continuous',
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
