import { MaterialIcons } from '@expo/vector-icons';
import { SymbolView, SFSymbol } from 'expo-symbols';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

// Mapping from MaterialIcons names to SF Symbol names
const SF_SYMBOL_MAP: Record<string, SFSymbol> = {
    // Navigation
    'chevron-left': 'chevron.left',
    'chevron-right': 'chevron.right',
    'arrow-back': 'chevron.left',
    'arrow-forward': 'chevron.right',
    'arrow-forward-ios': 'chevron.right',
    'close': 'xmark',

    // Actions
    'create': 'square.and.pencil',
    'edit': 'pencil',
    'edit-off': 'pencil.slash',
    'delete-outline': 'trash',
    'check': 'checkmark',
    'content-copy': 'doc.on.doc',
    'share': 'square.and.arrow.up',
    'logout': 'rectangle.portrait.and.arrow.right',
    'search-off': 'magnifyingglass',

    // Objects
    'lock': 'lock.fill',
    'lock-open': 'lock.open.fill',
    'lock-clock': 'lock.badge.clock.fill',
    'image': 'photo',
    'camera-alt': 'camera.fill',
    'collections': 'photo.on.rectangle',
    'menu-book': 'book.fill',
    'lightbulb': 'lightbulb.fill',

    // People
    'person': 'person.fill',
    'person-outline': 'person',
    'people': 'person.2.fill',
    'favorite': 'heart.fill',

    // Status
    'star': 'star.fill',
    'notifications-active': 'bell.badge.fill',
    'psychology': 'brain',

    // Special entry icons (moods)
    'sentiment-satisfied': 'face.smiling',
    'volunteer-activism': 'hand.raised.fill',
    'spa': 'leaf.fill',
    'celebration': 'party.popper.fill',
    'sentiment-dissatisfied': 'face.dashed',
    'bedtime': 'moon.zzz.fill',

    // Misc
    'hourglass-empty': 'hourglass',
    'circle': 'circle.fill',
    'calendar-today': 'calendar',
    'bar-chart': 'chart.bar.fill',
};

export type IconName = keyof typeof MaterialIcons.glyphMap;

interface IconProps {
    name: IconName;
    size?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size = 24, color = '#000', style }: IconProps) {
    // Use SF Symbols on iOS only
    if (process.env.EXPO_OS === 'ios') {
        const sfSymbolName = SF_SYMBOL_MAP[name];
        if (sfSymbolName) {
            return (
                <SymbolView
                    name={sfSymbolName}
                    size={size}
                    tintColor={color}
                    style={style}
                />
            );
        }
    }

    // Fallback to MaterialIcons
    return (
        <MaterialIcons
            name={name}
            size={size}
            color={color}
            style={style as any}
        />
    );
}
