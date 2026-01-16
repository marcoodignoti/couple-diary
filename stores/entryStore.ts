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
    createEntry: (userId: string, content: string, mood: Mood | null, photoUrl: string | null, isSpecial: boolean, specialDate?: Date) => Promise<void>;
    updateEntry: (entryId: string, content: string, mood: Mood | null) => Promise<void>;
    deleteEntry: (entryId: string) => Promise<void>;
    getWeeklyProgress: (userId: string) => boolean[];
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
        } catch (error) {
            console.error('Time capsule fetch error');
        }
    },

    createEntry: async (userId: string, content: string, mood: Mood | null, photoUrl: string | null, isSpecial: boolean, specialDate?: Date) => {
        try {
            set({ isLoading: true, error: null });

            const unlockDate = getUnlockDate(isSpecial, specialDate);

            const { data, error } = await supabase
                .from('entries')
                .insert({
                    user_id: userId,
                    content,
                    mood,
                    photo_url: photoUrl,
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

    updateEntry: async (entryId: string, content: string, mood: Mood | null) => {
        try {
            set({ isLoading: true, error: null });

            const { data, error } = await supabase
                .from('entries')
                .update({ content, mood })
                .eq('id', entryId)
                .select()
                .single();

            if (error) throw error;

            // Update in local state
            set(state => ({
                entries: state.entries.map(e => e.id === entryId ? data : e),
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    deleteEntry: async (entryId: string) => {
        try {
            set({ isLoading: true, error: null });

            const { error } = await supabase
                .from('entries')
                .delete()
                .eq('id', entryId);

            if (error) throw error;

            // Remove from local state
            set(state => ({
                entries: state.entries.filter(e => e.id !== entryId),
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    getWeeklyProgress: (userId: string) => {
        const state = get();
        const today = new Date();
        const currentDay = today.getDay(); // 0 is Sunday
        const mondayOffset = currentDay === 0 ? 6 : currentDay - 1; // 0 is Monday, 6 is Sunday

        // Get this week's Monday
        const mondayDate = new Date(today);
        mondayDate.setDate(today.getDate() - mondayOffset);
        mondayDate.setHours(0, 0, 0, 0);

        const progress: boolean[] = Array(7).fill(false);

        state.entries
            .filter(e => e.user_id === userId)
            .forEach(entry => {
                const entryDate = new Date(entry.created_at);
                // Check if entry is within this week (Monday to Sunday)
                const diffTime = entryDate.getTime() - mondayDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && diffDays < 7) {
                    progress[diffDays] = true;
                }
            });

        return progress;
    },

    clearError: () => set({ error: null }),
}));
