/**
 * Date utilities for Couple Diary
 * Handles unlock date calculations and date formatting
 */

/**
 * Get the unlock date for an entry
 * - Normal entries unlock on the coming Sunday at midnight
 * - Special entries unlock on the specified date
 */
export function getUnlockDate(isSpecialDate: boolean, specialDate?: Date): Date {
    if (isSpecialDate && specialDate) {
        const unlock = new Date(specialDate);
        unlock.setHours(0, 0, 0, 0);
        return unlock;
    }

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Calculate days until next Sunday
    // If today is Sunday (0), next unlock is in 7 days
    // Otherwise, unlock on the coming Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;

    const unlockDate = new Date(today);
    unlockDate.setDate(today.getDate() + daysUntilSunday);
    unlockDate.setHours(0, 0, 0, 0);

    return unlockDate;
}

/**
 * Check if an entry is unlocked based on its unlock date
 */
export function isEntryUnlocked(unlockDateStr: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unlockDate = new Date(unlockDateStr);
    unlockDate.setHours(0, 0, 0, 0);

    return today >= unlockDate;
}

/**
 * Get the start of the current week (Monday)
 */
export function getWeekStart(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    return weekStart;
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Oggi';
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
    return formatDate(dateStr);
}

/**
 * Check if a date is exactly one year ago
 */
export function isOneYearAgo(dateStr: string): boolean {
    const date = new Date(dateStr);
    const today = new Date();

    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    return (
        date.getDate() === oneYearAgo.getDate() &&
        date.getMonth() === oneYearAgo.getMonth() &&
        date.getFullYear() === oneYearAgo.getFullYear()
    );
}

/**
 * Get ISO date string (YYYY-MM-DD) for database queries
 */
export function toISODateString(date: Date): string {
    return date.toISOString().split('T')[0];
}
