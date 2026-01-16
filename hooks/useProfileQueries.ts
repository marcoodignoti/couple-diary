import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';

// Query keys factory
export const profileKeys = {
    all: ['profiles'] as const,
    detail: (id: string) => [...profileKeys.all, 'detail', id] as const,
    partner: (partnerId: string) => [...profileKeys.all, 'partner', partnerId] as const,
};

// Fetch functions
async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
    }

    return data;
}

async function fetchPartnerProfile(partnerId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
    }

    return data;
}

// Query hooks
export function useProfile(userId: string | undefined) {
    return useQuery({
        queryKey: profileKeys.detail(userId || ''),
        queryFn: () => fetchProfile(userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 10, // 10 minutes (profiles don't change often)
    });
}

export function usePartnerProfile(partnerId: string | undefined) {
    return useQuery({
        queryKey: profileKeys.partner(partnerId || ''),
        queryFn: () => fetchPartnerProfile(partnerId!),
        enabled: !!partnerId,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

// Mutation hooks
interface UpdateProfileParams {
    userId: string;
    name: string;
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, name }: UpdateProfileParams) => {
            const { data, error } = await supabase
                .from('profiles')
                .update({ name })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as Profile;
        },
        onSuccess: (data) => {
            // Invalidate profile cache
            queryClient.invalidateQueries({ queryKey: profileKeys.detail(data.id) });
        },
    });
}

// Pairing mutation
interface PairWithPartnerParams {
    userId: string;
    code: string;
}

export function usePairWithPartner() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, code }: PairWithPartnerParams) => {
            const { connectWithCode } = await import('../services/pairingService');
            await connectWithCode(userId, code);

            // Fetch updated profile
            const profile = await fetchProfile(userId);
            return profile;
        },
        onSuccess: (data) => {
            if (data) {
                // Invalidate profile and partner caches
                queryClient.invalidateQueries({ queryKey: profileKeys.detail(data.id) });
                if (data.partner_id) {
                    queryClient.invalidateQueries({ queryKey: profileKeys.partner(data.partner_id) });
                }
            }
        },
    });
}

export function useGeneratePairingCode() {
    return useMutation({
        mutationFn: async (userId: string) => {
            const { createPairingCode } = await import('../services/pairingService');
            return createPairingCode(userId);
        },
    });
}
