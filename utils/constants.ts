// App constants

export const MOODS = [
    { id: 'happy', emoji: '😊', label: 'Felice' },
    { id: 'love', emoji: '🥰', label: 'Innamorato/a' },
    { id: 'grateful', emoji: '🙏', label: 'Grato/a' },
    { id: 'peaceful', emoji: '😌', label: 'Sereno/a' },
    { id: 'excited', emoji: '🤩', label: 'Entusiasta' },
    { id: 'sad', emoji: '😢', label: 'Triste' },
    { id: 'anxious', emoji: '😰', label: 'Ansioso/a' },
    { id: 'tired', emoji: '😴', label: 'Stanco/a' },
] as const;

export const CALENDAR_COLORS: Record<string, string> = {
    none: '#E5E7EB',     // Gray - no entries
    single: '#60A5FA',   // Blue - one person wrote
    both: '#FBBF24',     // Gold - both wrote (streak!)
};

export const APP_NAME = 'Couple Diary';

export const PAIRING_CODE_LENGTH = 6;
export const PAIRING_CODE_EXPIRY_HOURS = 24;
