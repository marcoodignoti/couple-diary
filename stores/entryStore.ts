import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { Entry, Mood, PartnerEntry } from '../types';
import { getUnlockDate, isEntryUnlocked, toISODateString } from '../utils/dates';

interface EntryState {
    entries: Entry[];
    partnerEntries: PartnerEntry[];
    timeCapsuleEntry: Entry | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchMyEntries: (userId: string) => Promise<void>;
    fetchPartnerEntries: (partnerId: string) => Promise<void>;
    fetchTimeCapsule: (userId: string) => Promise<void>;
    createEntry: (userId: string, content: string, mood: Mood | null, isSpecial: boolean, specialDate?: Date) => Promise<void>;
    clearError: () => void;
}

export const useEntryStore = create<EntryState>((set, get) => ({
    entries: [],
    partnerEntries: [],
    timeCapsuleEntry: null,
    isLoading: false,
    error: null,

    fetchMyEntries: async (userId: string) => {
        try {
            set({ isLoading: true, error: null });

            const { data, error } = await supabase
                .from('entries')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ entries: data || [], isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchPartnerEntries: async (partnerId: string) => {
        try {
            set({ isLoading: true, error: null });

            const { data, error } = await supabase
                .from('entries')
                .select('*')
                .eq('user_id', partnerId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Add unlock status to each entry
            const entriesWithUnlockStatus: PartnerEntry[] = (data || []).map(entry => ({
                ...entry,
                isUnlocked: isEntryUnlocked(entry.unlock_date),
            }));

            set({ partnerEntries: entriesWithUnlockStatus, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchTimeCapsule: async (userId: string) => {
        try {
            // Calculate date from one year ago
            const today = new Date();
            const oneYearAgo = new Date(today);
            oneYearAgo.setFullYear(today.getFullYear() - 1);
            const dateStr = toISODateString(oneYearAgo);

            const { data, error } = await supabase
                .from('entries')
                .select('*')
                .eq('user_id', userId)
                .gte('created_at', `${dateStr}T00:00:00`)
                .lt('created_at', `${dateStr}T23:59:59`)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
                throw error;
            }

            set({ timeCapsuleEntry: data || null });
        } catch (error: any) {
            console.error('Time capsule fetch error:', error.message);
        }
    },

    createEntry: async (userId: string, content: string, mood: Mood | null, isSpecial: boolean, specialDate?: Date) => {
        try {
            set({ isLoading: true, error: null });

            const unlockDate = getUnlockDate(isSpecial, specialDate);

            const { data, error } = await supabase
                .from('entries')
                .insert({
                    user_id: userId,
                    content,
                    mood,
                    is_special_date: isSpecial,
                    unlock_date: toISODateString(unlockDate),
                })
                .select()
                .single();

            if (error) throw error;

            // Add to local state
            set(state => ({
                entries: [data, ...state.entries],
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
