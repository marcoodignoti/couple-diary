import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Hook to monitor network connectivity status
 * Returns { isOnline, isConnecting, connectionType }
 */
export function useNetworkStatus() {
    const [networkState, setNetworkState] = useState<{
        isOnline: boolean;
        isConnecting: boolean;
        connectionType: string | null;
    }>({
        isOnline: true,
        isConnecting: false,
        connectionType: null,
    });

    useEffect(() => {
        // Get initial state
        NetInfo.fetch().then((state) => {
            setNetworkState({
                isOnline: state.isConnected ?? true,
                isConnecting: state.isInternetReachable === null,
                connectionType: state.type,
            });
        });

        // Subscribe to changes
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setNetworkState({
                isOnline: state.isConnected ?? true,
                isConnecting: state.isInternetReachable === null,
                connectionType: state.type,
            });
        });

        return () => unsubscribe();
    }, []);

    return networkState;
}

/**
 * Simple hook that just returns boolean online status
 */
export function useIsOnline(): boolean {
    const { isOnline } = useNetworkStatus();
    return isOnline;
}
