import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';

interface AuthState {
    user: Profile | null;
    partner: Profile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchPartner: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    partner: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,

    initialize: async () => {
        try {
            set({ isLoading: true, error: null });

            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Fetch profile
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) throw error;

                set({
                    user: profile,
                    isAuthenticated: true,
                    isLoading: false
                });

                // Fetch partner if linked
                if (profile?.partner_id) {
                    get().fetchPartner();
                }
            } else {
                set({ isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error.message,
                isLoading: false
            });
        }
    },

    refreshProfile: async () => {
        const { user } = get();
        if (!user?.id) return;

        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            set({ user: profile });

            // Check if partner was linked
            if (profile?.partner_id && !get().partner) {
                get().fetchPartner();
            }
        } catch (error: any) {
            console.error('Failed to refresh profile:', error.message);
        }
    },

    signUp: async (email: string, password: string, name: string) => {
        try {
            set({ isLoading: true, error: null });

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name },
                },
            });

            if (error) throw error;

            if (data.user) {
                // Create profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        name,
                        email,
                    });

                if (profileError) throw profileError;

                // Fetch the created profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                set({
                    user: profile,
                    isAuthenticated: true,
                    isLoading: false
                });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    signIn: async (email: string, password: string) => {
        try {
            set({ isLoading: true, error: null });

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) throw profileError;

                set({
                    user: profile,
                    isAuthenticated: true,
                    isLoading: false
                });

                if (profile?.partner_id) {
                    get().fetchPartner();
                }
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    signOut: async () => {
        try {
            set({ isLoading: true });
            await supabase.auth.signOut();
            set({
                user: null,
                partner: null,
                isAuthenticated: false,
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchPartner: async () => {
        const { user } = get();
        if (!user?.partner_id) return;

        try {
            const { data: partner, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.partner_id)
                .single();

            if (error) throw error;
            set({ partner });
        } catch (error: any) {
            console.error('Failed to fetch partner:', error.message);
        }
    },

    clearError: () => set({ error: null }),
}));
