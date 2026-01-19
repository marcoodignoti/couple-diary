import { Mood } from '../types';
import { storage } from './storage';

const DRAFT_KEY = 'entry_draft';

interface DraftData {
    content: string;
    mood: Mood | null;
    imageUri: string | null;
    updatedAt: number;
}

export function saveDraft(data: Partial<DraftData>) {
    const current = loadDraft() || {};
    const updated = {
        ...current,
        ...data,
        updatedAt: Date.now(),
    };
    storage.set(DRAFT_KEY, updated);
}

export function loadDraft(): DraftData | null {
    return storage.get<DraftData | null>(DRAFT_KEY, null);
}

export function clearDraft() {
    storage.remove(DRAFT_KEY);
}
