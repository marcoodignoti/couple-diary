import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Entry, Mood, PartnerEntry } from '../types';
import { getUnlockDate, isEntryUnlocked, toISODateString } from '../utils/dates';

// Query keys factory for type safety and consistency
export const entryKeys = {
    all: ['entries'] as const,
    lists: () => [...entryKeys.all, 'list'] as const,
    list: (userId: string) => [...entryKeys.lists(), userId] as const,
    partner: (partnerId: string) => [...entryKeys.all, 'partner', partnerId] as const,
    timeCapsule: (userId: string) => [...entryKeys.all, 'timeCapsule', userId] as const,
    detail: (id: string) => [...entryKeys.all, 'detail', id] as const,
};

// Fetch functions
async function fetchMyEntries(userId: string): Promise<Entry[]> {
    const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
}

async function fetchPartnerEntries(partnerId: string): Promise<PartnerEntry[]> {
    const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', partnerId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Add unlock status to each entry
    return (data || []).map(entry => ({
        ...entry,
        isUnlocked: isEntryUnlocked(entry.unlock_date),
    }));
}

async function fetchTimeCapsule(userId: string): Promise<Entry | null> {
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

    if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
    }

    return data || null;
}

// Query hooks
export function useMyEntries(userId: string | undefined) {
    return useQuery({
        queryKey: entryKeys.list(userId || ''),
        queryFn: () => fetchMyEntries(userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function usePartnerEntries(partnerId: string | undefined) {
    return useQuery({
        queryKey: entryKeys.partner(partnerId || ''),
        queryFn: () => fetchPartnerEntries(partnerId!),
        enabled: !!partnerId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useTimeCapsule(userId: string | undefined) {
    return useQuery({
        queryKey: entryKeys.timeCapsule(userId || ''),
        queryFn: () => fetchTimeCapsule(userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 60, // 1 hour (doesn't change often)
    });
}

// Mutation types
interface CreateEntryParams {
    userId: string;
    content: string;
    mood: Mood | null;
    photoUrl: string | null;
    isSpecial: boolean;
    specialDate?: Date;
}

interface UpdateEntryParams {
    entryId: string;
    content: string;
    mood: Mood | null;
}

// Mutation hooks
export function useCreateEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, content, mood, photoUrl, isSpecial, specialDate }: CreateEntryParams) => {
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

            if (error) throw new Error(error.message);
            return data as Entry;
        },
        onSuccess: (data) => {
            // Invalidate and refetch entries list
            queryClient.invalidateQueries({ queryKey: entryKeys.list(data.user_id) });
        },
    });
}

export function useUpdateEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ entryId, content, mood }: UpdateEntryParams) => {
            const { data, error } = await supabase
                .from('entries')
                .update({ content, mood })
                .eq('id', entryId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as Entry;
        },
        onSuccess: (data) => {
            // Invalidate entries list and the specific entry
            queryClient.invalidateQueries({ queryKey: entryKeys.list(data.user_id) });
            queryClient.invalidateQueries({ queryKey: entryKeys.detail(data.id) });
        },
    });
}

export function useDeleteEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ entryId, userId }: { entryId: string; userId: string }) => {
            const { error } = await supabase
                .from('entries')
                .delete()
                .eq('id', entryId);

            if (error) throw new Error(error.message);
            return { entryId, userId };
        },
        onSuccess: ({ userId }) => {
            // Invalidate entries list
            queryClient.invalidateQueries({ queryKey: entryKeys.list(userId) });
        },
    });
}

// Helper to calculate weekly progress from cached entries
export function getWeeklyProgressFromEntries(entries: Entry[], userId: string): boolean[] {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? 6 : currentDay - 1;

    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() - mondayOffset);
    mondayDate.setHours(0, 0, 0, 0);

    const progress: boolean[] = Array(7).fill(false);

    entries
        .filter(e => e.user_id === userId)
        .forEach(entry => {
            const entryDate = new Date(entry.created_at);
            const diffTime = entryDate.getTime() - mondayDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays < 7) {
                progress[diffDays] = true;
            }
        });

    return progress;
}
