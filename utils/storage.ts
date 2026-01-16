
import "expo-sqlite/localStorage/install";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export const storage = {
    get<T>(key: string, defaultValue: T): T {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            listeners.get(key)?.forEach((fn) => fn());
        } catch (e) {
            console.warn('Failed to save to localStorage', e);
        }
    },

    remove(key: string): void {
        try {
            localStorage.removeItem(key);
            listeners.get(key)?.forEach((fn) => fn());
        } catch (e) {
            console.warn('Failed to remove from localStorage', e);
        }
    },

    subscribe(key: string, listener: Listener): () => void {
        if (!listeners.has(key)) listeners.set(key, new Set());
        listeners.get(key)!.add(listener);
        return () => listeners.get(key)?.delete(listener);
    },
};
