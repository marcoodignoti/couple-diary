# React Query Hooks

This directory contains React Query hooks for data fetching with automatic caching.

## Available Hooks

### Entry Hooks (`useEntryQueries.ts`)

```tsx
import {
  useMyEntries,
  usePartnerEntries,
  useTimeCapsule,
  useCreateEntry,
  useUpdateEntry,
  useDeleteEntry,
  getWeeklyProgressFromEntries
} from '../hooks/useEntryQueries';

// Fetch user's entries (cached for 5 minutes)
const { data: entries, isLoading, error, refetch } = useMyEntries(userId);

// Fetch partner entries
const { data: partnerEntries } = usePartnerEntries(partnerId);

// Fetch time capsule entry (cached for 1 hour)
const { data: timeCapsule } = useTimeCapsule(userId);

// Create new entry
const createMutation = useCreateEntry();
createMutation.mutate({
  userId,
  content: 'My diary entry',
  mood: 'happy',
  photoUrl: null,
  isSpecial: false,
});

// Update entry
const updateMutation = useUpdateEntry();
updateMutation.mutate({ entryId, content, mood });

// Delete entry
const deleteMutation = useDeleteEntry();
deleteMutation.mutate({ entryId, userId });

// Calculate weekly progress from cached entries
const progress = getWeeklyProgressFromEntries(entries || [], userId);
```

### Profile Hooks (`useProfileQueries.ts`)

```tsx
import {
  useProfile,
  usePartnerProfile,
  useUpdateProfile,
  usePairWithPartner,
  useGeneratePairingCode,
} from '../hooks/useProfileQueries';

// Fetch profile (cached for 10 minutes)
const { data: profile } = useProfile(userId);

// Fetch partner profile
const { data: partner } = usePartnerProfile(partnerId);

// Update profile
const updateMutation = useUpdateProfile();
updateMutation.mutate({ userId, name: 'New Name' });

// Generate pairing code
const pairingMutation = useGeneratePairingCode();
pairingMutation.mutate(userId);

// Pair with partner
const pairMutation = usePairWithPartner();
pairMutation.mutate({ userId, code: 'ABC123' });
```

### Network Status (`useNetworkStatus.ts`)

```tsx
import { useNetworkStatus, useIsOnline } from '../hooks/useNetworkStatus';

// Full network state
const { isOnline, isConnecting, connectionType } = useNetworkStatus();

// Simple boolean
const isOnline = useIsOnline();

if (!isOnline) {
  return <OfflineMessage />;
}
```

## Migration Guide

Replace direct store calls with React Query hooks:

### Before (Zustand only)
```tsx
const { entries, fetchMyEntries, isLoading } = useEntryStore();

useEffect(() => {
  fetchMyEntries(userId);
}, [userId]);
```

### After (React Query)
```tsx
const { data: entries, isLoading, refetch } = useMyEntries(userId);
// Data is automatically cached and refetched when stale
```

## Benefits

1. **Automatic caching** - Data is cached for configured staleTime
2. **Request deduplication** - Multiple components using same query share one request
3. **Background refetching** - Stale data is refreshed automatically
4. **Offline support** - Queries pause when offline, resume when online
5. **Loading/error states** - Built-in state management
6. **Cache invalidation** - Mutations automatically invalidate related queries

## Configuration

Default settings in `providers/QueryProvider.tsx`:

- `staleTime: 5 minutes` - Data considered fresh for 5 minutes
- `gcTime: 30 minutes` - Unused cache kept for 30 minutes
- `retry: 2` - Failed requests retry twice
- `refetchOnWindowFocus: false` - Don't refetch on app resume (mobile)
