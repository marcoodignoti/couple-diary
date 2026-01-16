import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Hook for responsive design across different screen sizes.
 * Provides breakpoints, orientation detection, and adaptive sizing.
 */
export function useResponsive() {
    const { width, height } = useWindowDimensions();

    // Determine breakpoint based on width
    const breakpoint: Breakpoint =
        width >= 1024 ? 'desktop' :
        width >= 768 ? 'tablet' : 'mobile';

    const isLandscape = width > height;
    const isTablet = breakpoint === 'tablet' || breakpoint === 'desktop';
    const isMobile = breakpoint === 'mobile';

    // Content width constraints for centered layouts on larger screens
    const contentMaxWidth = isTablet ? 720 : width;

    // Grid column count for responsive grids
    const gridColumns =
        breakpoint === 'desktop' ? 3 :
        breakpoint === 'tablet' ? 2 : 1;

    // Padding scale based on screen size
    const horizontalPadding = isTablet ? 32 : 20;

    // Card width for grid layouts
    const cardWidth = isTablet
        ? (contentMaxWidth - horizontalPadding * 2 - 16 * (gridColumns - 1)) / gridColumns
        : width - horizontalPadding * 2;

    return {
        // Dimensions
        width,
        height,

        // Breakpoints
        breakpoint,
        isMobile,
        isTablet,
        isLandscape,

        // Layout helpers
        contentMaxWidth,
        gridColumns,
        horizontalPadding,
        cardWidth,

        // Responsive value helper
        responsive: <T,>(mobile: T, tablet: T, desktop?: T): T => {
            if (breakpoint === 'desktop' && desktop !== undefined) return desktop;
            if (breakpoint === 'tablet') return tablet;
            return mobile;
        },
    };
}

export default useResponsive;
