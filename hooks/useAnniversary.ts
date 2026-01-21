import { useMemo } from 'react';

interface AnniversaryInfo {
    /** Days until next anniversary (0 = today) */
    daysUntil: number;
    /** Full years the couple has been together */
    yearsTogether: number;
    /** Additional months beyond full years */
    monthsTogether: number;
    /** True if today is the anniversary */
    isToday: boolean;
    /** The next anniversary date */
    nextDate: Date;
    /** Formatted anniversary date (e.g., "23 Aprile") */
    formattedDate: string;
    /** Formatted duration (e.g., "2 anni e 5 mesi" or "5 mesi") */
    formattedDuration: string;
}

/**
 * Calculate anniversary countdown, years and months together
 */
export function useAnniversary(anniversaryDate: string | null): AnniversaryInfo | null {
    return useMemo(() => {
        if (!anniversaryDate) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Parse anniversary date
        const [year, month, day] = anniversaryDate.split('-').map(Number);
        const originalDate = new Date(year, month - 1, day);

        // Calculate next anniversary
        const thisYear = today.getFullYear();
        let nextAnniversary = new Date(thisYear, month - 1, day);

        // If this year's anniversary has passed, use next year
        if (nextAnniversary < today) {
            nextAnniversary = new Date(thisYear + 1, month - 1, day);
        }

        // Days until next anniversary
        const diffTime = nextAnniversary.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate years and months together
        let yearsTogether = today.getFullYear() - originalDate.getFullYear();
        let monthsTogether = today.getMonth() - originalDate.getMonth();

        // Adjust for day of month
        if (today.getDate() < originalDate.getDate()) {
            monthsTogether--;
        }

        // Normalize months
        if (monthsTogether < 0) {
            yearsTogether--;
            monthsTogether += 12;
        }

        // Format date in Italian
        const formattedDate = originalDate.toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
        });

        // Format duration string
        let formattedDuration = '';
        if (yearsTogether > 0) {
            formattedDuration = `${yearsTogether} ${yearsTogether === 1 ? 'anno' : 'anni'}`;
            if (monthsTogether > 0) {
                formattedDuration += ` e ${monthsTogether} ${monthsTogether === 1 ? 'mese' : 'mesi'}`;
            }
        } else if (monthsTogether > 0) {
            formattedDuration = `${monthsTogether} ${monthsTogether === 1 ? 'mese' : 'mesi'}`;
        } else {
            formattedDuration = 'Oggi!';
        }

        return {
            daysUntil,
            yearsTogether,
            monthsTogether,
            isToday: daysUntil === 0,
            nextDate: nextAnniversary,
            formattedDate,
            formattedDuration,
        };
    }, [anniversaryDate]);
}
