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
    updateProfile: (name: string) => Promise<void>;
    updateAvatar: (imageUri: string) => Promise<void>;
    updateAnniversary: (date: Date | null) => Promise<void>;
    checkStreak: () => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchPartner: () => Promise<void>;
    clearError: () => void;

    // Pairing
    pairingCode: string | null;
    generatePairingCode: () => Promise<void>;
    pairWithPartner: (code: string) => Promise<void>;
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
        } catch (error) {
            console.error('Failed to refresh profile');
        }
    },

    updateProfile: async (name: string) => {
        const { user } = get();
        if (!user) return;

        try {
            set({ isLoading: true, error: null });

            const { error } = await supabase
                .from('profiles')
                .update({ name })
                .eq('id', user.id);

            if (error) throw error;

            // Refresh local state
            await get().refreshProfile();
            set({ isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateAvatar: async (imageUri: string) => {
        const { user } = get();
        if (!user) return;

        try {
            set({ isLoading: true, error: null });

            // Upload photo and get URL
            const { uploadProfilePhoto } = await import('../services/photoService');
            const avatarUrl = await uploadProfilePhoto(user.id, imageUri);

            // Update profile in database
            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: avatarUrl })
                .eq('id', user.id);

            if (error) throw error;

            // Refresh local state
            await get().refreshProfile();
            set({ isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateAnniversary: async (date: Date | null) => {
        const { user } = get();
        if (!user) return;

        try {
            set({ isLoading: true, error: null });

            // Format date as ISO string (YYYY-MM-DD) or null
            const anniversaryDate = date
                ? date.toISOString().split('T')[0]
                : null;

            const { error } = await supabase
                .from('profiles')
                .update({ anniversary_date: anniversaryDate })
                .eq('id', user.id);

            if (error) throw error;

            // Refresh to get synced data
            await get().refreshProfile();
            await get().fetchPartner();
            set({ isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    checkStreak: async () => {
        const { user } = get();
        if (!user) return;

        try {
            // Logic:
            // 1. Get today's date and last entry date
            // 2. If already entered today, do nothing (keep streak)
            // 3. If entered yesterday, increment streak
            // 4. If entered before yesterday, reset streak to 1
            // 5. Update DB
            // 6. Check for unlocks

            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];

            // If we already have an entry for today (checked via total_entries logic elsewhere or simple date check)
            // For robustness, let's just assume this is called AFTER a successful entry creation
            // So we treat today as "Action Taken"

            const lastEntryDate = user.last_entry_date ? new Date(user.last_entry_date) : null;
            let newStreak = user.current_streak || 0;

            if (lastEntryDate) {
                const diffTime = Math.abs(today.getTime() - lastEntryDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    // Entered yesterday (or effectively 1 day diff) -> Increment
                    newStreak += 1;
                } else if (diffDays > 1) {
                    // Missed a day -> Reset to 1 (since we just wrote an entry today)
                    newStreak = 1;
                }
                // If diffDays === 0 (same day), keep streak same (or verify if we want to count multiple entries? usually no)
                // But since this function is called "after entry", if it was 0, it means we already updated it? 
                // Let's assume we maintain consistent state. If lastEntryDate was today, we don't change streak.
                if (user.last_entry_date === todayStr) {
                    return; // Already updated for today
                }
                if (diffDays === 0 && user.last_entry_date !== todayStr) {
                    // Edge case: Timezone weirdness or first entry of day
                    newStreak += 1; // It's a new day effectively
                }
            } else {
                // First ever entry
                newStreak = 1;
            }

            // Updates
            let newUnlockedThemes = [...(user.unlocked_themes || ['default'])];
            // Example Unlock: Pink Theme at 7 days
            if (newStreak >= 7 && !newUnlockedThemes.includes('pink')) {
                newUnlockedThemes.push('pink');
                // Could emit a toast here or return state to UI to show "Theme Unlocked!"
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    current_streak: newStreak,
                    last_entry_date: todayStr,
                    total_entries: (user.total_entries || 0) + 1,
                    unlocked_themes: newUnlockedThemes
                })
                .eq('id', user.id);

            if (error) throw error;

            // Refresh local
            await get().refreshProfile();

        } catch (error) {
            console.error('Failed to update streak', error);
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
                    .upsert({
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
        } catch (error) {
            console.error('Failed to fetch partner');
        }
    },

    clearError: () => set({ error: null }),

    // Pairing Actions
    pairingCode: null,

    generatePairingCode: async () => {
        const { user } = get();
        if (!user) return;
        try {
            const { createPairingCode } = await import('../services/pairingService');
            const code = await createPairingCode(user.id);
            set({ pairingCode: code });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    pairWithPartner: async (code: string) => {
        const { user } = get();
        if (!user) return;
        try {
            set({ isLoading: true, error: null });
            const { connectWithCode } = await import('../services/pairingService');
            await connectWithCode(user.id, code);

            // Refresh profile to get partner_id
            await get().refreshProfile();
            set({ isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error; // Re-throw for UI handling
        }
    },
}));
