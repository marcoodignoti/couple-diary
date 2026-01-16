import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { ReactNode, useEffect } from 'react';

// Sync React Query online status with device network status
// This pauses queries when offline and resumes when online
onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
        setOnline(state.isConnected ?? true);
    });
});

// Create a client with sensible defaults
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is fresh for 5 minutes
            staleTime: 1000 * 60 * 5,
            // Cache data for 30 minutes
            gcTime: 1000 * 60 * 30,
            // Retry failed requests twice
            retry: 2,
            // Don't refetch on window focus in mobile apps
            refetchOnWindowFocus: false,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
        },
    },
});

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

// Export the queryClient for manual cache invalidation
export { queryClient };
