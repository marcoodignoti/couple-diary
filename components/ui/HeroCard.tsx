import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, FontSizes, Spacing } from '../../constants/theme';
import { Icon, IconName } from './Icon';

interface HeroCardProps {
    title: string;
    content?: string;
    themeColor: string;
    glowColor: string;
    icon: IconName;
    badgeText?: string;
    badgeIcon?: IconName;
    onPress: () => void;
    ctaText?: string;
    renderHeader?: () => React.ReactNode;
    style?: ViewStyle;
    /** Card size: 'large' (default) or 'compact' for grid layouts */
    size?: 'large' | 'compact';
}

export function HeroCard({
    title,
    content,
    themeColor,
    glowColor,
    icon,
    badgeText,
    badgeIcon,
    onPress,
    ctaText,
    renderHeader,
    style,
    size = 'large',
}: HeroCardProps) {
    const isCompact = size === 'compact';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={[
                styles.card,
                isCompact && styles.cardCompact,
                {
                    backgroundColor: themeColor,
                    shadowColor: themeColor,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 10,
                },
                style,
            ]}
        >
            {/* Decorative Elements - Glow & Icon */}
            <View style={[styles.glow, isCompact && styles.glowCompact, { backgroundColor: glowColor, opacity: 0.4 }]} />
            <Icon name={icon} size={isCompact ? 80 : 120} color="#FFFFFF" style={styles.bgIcon as any} />

            {/* Header */}
            <View style={styles.header}>
                {renderHeader ? (
                    renderHeader()
                ) : (
                    <View style={{ flex: 1 }}>
                        {badgeText && (
                            <View style={styles.badge}>
                                {badgeIcon && <Icon name={badgeIcon} size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                                <Text style={styles.badgeText}>{badgeText}</Text>
                            </View>
                        )}
                        <Text style={[styles.title, isCompact && styles.titleCompact]} numberOfLines={isCompact ? 3 : 2}>
                            {title}
                        </Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={{ zIndex: 10 }}>
                {content && (
                    <Text
                        style={[
                            styles.content,
                            isCompact && styles.contentCompact,
                            { color: 'rgba(255,255,255,0.95)', fontStyle: 'italic' }
                        ]}
                        numberOfLines={isCompact ? 4 : 4}
                    >
                        "{content}"
                    </Text>
                )}

                {/* Footer / CTA */}
                {ctaText && (
                    <View style={styles.footer}>
                        <Text style={[styles.ctaText, isCompact && styles.ctaTextCompact]}>{ctaText}</Text>
                        {!isCompact && (
                            <View style={styles.buttonIcon}>
                                <Icon name="arrow-forward" size={20} color="#FFFFFF" />
                            </View>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius['2xl'], // Strict 32px
        padding: Spacing[6],
        position: 'relative',
        overflow: 'hidden',
        minHeight: 200, // Increased from 180
        justifyContent: 'space-between',
    },
    glow: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: BorderRadius.full,
        transform: [{ scale: 1.5 }],
    },
    bgIcon: {
        position: 'absolute',
        bottom: -20,
        right: -20,
        opacity: 0.1,
        transform: [{ rotate: '-15deg' }],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing[2],
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing[3],
        paddingVertical: Spacing[1],
        borderRadius: BorderRadius.full,
        alignSelf: 'flex-start',
        marginBottom: Spacing[2],
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: FontSizes.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        color: Colors.white,
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
        marginBottom: Spacing[2],
    },
    content: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: FontSizes.base,
        marginBottom: Spacing[6],
        maxWidth: '85%',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[2],
        marginTop: 'auto',
    },
    ctaText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSizes.base,
    },
    buttonIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Compact mode styles for grid layout
    cardCompact: {
        minHeight: 180, // Increased height
        padding: Spacing[4], // Standard padding is good, just need more height
        justifyContent: 'flex-start', // Let content flow
    },
    glowCompact: {
        width: 140, // Larger glow
        height: 140,
        top: -40,
        right: -40,
    },
    titleCompact: {
        fontSize: FontSizes.lg,
        marginBottom: Spacing[2],
        lineHeight: 24, // Better line height
    },
    contentCompact: {
        fontSize: FontSizes.sm,
        marginBottom: Spacing[4],
        maxWidth: '100%',
        lineHeight: 20, // Readable line height
        opacity: 0.9,
    },
    ctaTextCompact: {
        fontSize: FontSizes.xs,
        marginTop: 'auto', // Push to bottom
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
