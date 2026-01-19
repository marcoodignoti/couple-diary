import { useCallback, useEffect, useRef, useState } from 'react';
import type { Mood } from '../types';
import { storage } from '../utils/storage';

const DRAFT_KEY = 'entry_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

interface Draft {
    content: string;
    mood: Mood | null;
    imageUri: string | null;
    savedAt: number;
}

export function useDraft() {
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimeoutRef = useRef<any>(null);

    const saveDraft = useCallback((draft: Omit<Draft, 'savedAt'>) => {
        if (!draft.content && !draft.imageUri) {
            storage.remove(DRAFT_KEY);
            return;
        }
        storage.set(DRAFT_KEY, { ...draft, savedAt: Date.now() });
        setLastSaved(new Date());
    }, []);

    const loadDraft = useCallback((): Draft | null => {
        return storage.get<Draft | null>(DRAFT_KEY, null);
    }, []);

    const clearDraft = useCallback(() => {
        storage.remove(DRAFT_KEY);
        setLastSaved(null);
    }, []);

    const scheduleAutoSave = useCallback((draft: Omit<Draft, 'savedAt'>) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveDraft(draft);
        }, AUTO_SAVE_INTERVAL);
    }, [saveDraft]);

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return { saveDraft, loadDraft, clearDraft, scheduleAutoSave, lastSaved };
}
