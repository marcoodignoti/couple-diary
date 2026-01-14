import type { Reaction } from '../types';
import { supabase } from './supabase';

/**
 * Add a reaction (heart or note) to a specific text selection in an entry
 */
export async function addReaction(
    entryId: string,
    userId: string,
    startIndex: number,
    endIndex: number,
    reactionType: 'heart' | 'note',
    noteContent?: string
): Promise<Reaction> {
    const { data, error } = await supabase
        .from('reactions')
        .insert({
            entry_id: entryId,
            user_id: userId,
            start_index: startIndex,
            end_index: endIndex,
            reaction_type: reactionType,
            note_content: noteContent || null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get all reactions for a specific entry
 */
export async function getReactions(entryId: string): Promise<Reaction[]> {
    const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('entry_id', entryId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Delete a reaction
 */
export async function deleteReaction(reactionId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', reactionId)
        .eq('user_id', userId);

    if (error) throw error;
}
