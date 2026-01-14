import { PAIRING_CODE_EXPIRY_HOURS, PAIRING_CODE_LENGTH } from '../utils/constants';
import { supabase } from './supabase';

/**
 * Generate a random pairing code
 */
function generatePairingCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, 1, I
    let code = '';
    for (let i = 0; i < PAIRING_CODE_LENGTH; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Create a new pairing code for the current user
 */
export async function createPairingCode(userId: string): Promise<string> {
    const code = generatePairingCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PAIRING_CODE_EXPIRY_HOURS);

    const { error } = await supabase
        .from('profiles')
        .update({
            pairing_code: code,
            pairing_code_expires_at: expiresAt.toISOString(),
        })
        .eq('id', userId);

    if (error) throw error;
    return code;
}

/**
 * Connect two users using a pairing code
 */
export async function connectWithCode(myUserId: string, code: string): Promise<boolean> {
    // Use Supabase RPC function to link partners (bypasses RLS)
    const { data, error } = await supabase
        .rpc('link_partners', {
            my_user_id: myUserId,
            partner_code: code.toUpperCase(),
        });

    if (error) {
        // Parse error message
        if (error.message.includes('non valido') || error.message.includes('scaduto')) {
            throw new Error('Codice non valido o scaduto');
        }
        throw new Error(error.message);
    }

    return true;
}

/**
 * Get current pairing code for user
 */
export async function getCurrentPairingCode(userId: string): Promise<string | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('pairing_code, pairing_code_expires_at')
        .eq('id', userId)
        .single();

    if (error) throw error;

    // Check if code is still valid
    if (data?.pairing_code && data?.pairing_code_expires_at) {
        const expiresAt = new Date(data.pairing_code_expires_at);
        if (expiresAt > new Date()) {
            return data.pairing_code;
        }
    }

    return null;
}
