// Core types for Couple Diary

export interface Profile {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    anniversary_date: string | null; // ISO date "2020-04-23"
    partner_id: string | null;
    pairing_code: string | null;
    pairing_code_expires_at: string | null;
    created_at: string;
    // Gamification
    current_streak: number;
    last_entry_date: string | null; // ISO date "2024-01-20"
    total_entries: number;
    unlocked_themes: string[];
}

export type Mood = 'happy' | 'love' | 'grateful' | 'peaceful' | 'excited' | 'sad' | 'anxious' | 'tired' | 'calm' | 'angry';

export interface Entry {
    id: string;
    user_id: string;
    content: string;
    mood: Mood | null;
    photo_url: string | null;
    is_special_date: boolean;
    unlock_date: string; // ISO date string
    created_at: string;
}

export interface Reaction {
    id: string;
    entry_id: string;
    user_id: string;
    start_index: number;
    end_index: number;
    reaction_type: 'heart' | 'note';
    note_content: string | null;
    created_at: string;
}

export interface PartnerEntry extends Entry {
    isUnlocked: boolean;
    reactions?: Reaction[];
}

export interface CalendarDayData {
    date: string;
    userWrote: boolean;
    partnerWrote: boolean;
    color: 'gray' | 'blue' | 'gold';
}
