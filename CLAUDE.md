# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (works for iOS, Android, and web)
npm start

# Platform-specific
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser

# Build for web (GitHub Pages deployment)
npx expo export --platform web

# EAS builds (requires eas-cli)
eas build --platform ios --profile development
eas build --platform android --profile development
```

## Architecture Overview

**Couple Diary** is a React Native/Expo app for couples to share diary entries with delayed visibility (entries unlock on Sundays). It runs on iOS, Android, and web using Expo Router for navigation.

### Tech Stack
- **Framework**: Expo SDK 54 with React Native 0.81, expo-router for file-based routing
- **State**: Zustand stores in `stores/`, React Query for server state
- **Backend**: Supabase (auth + database), configured via `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars
- **Auth Storage**: expo-secure-store on native, localStorage on web

### Key Directories
- `app/` - Expo Router screens using file-based routing (typed routes enabled)
  - `(auth)/` - Login, register flows
  - `(tabs)/` - Main app tabs (diary, calendar, profile, insight)
  - `entry/` - Entry viewing/editing (modal presentation)
  - `onboarding/` - First-time user flows (welcome, pairing, celebration)
- `stores/` - Zustand state management
  - `authStore.ts` - User auth, profile, and partner pairing
  - `entryStore.ts` - Diary entries CRUD and partner entries
- `services/` - API and device integrations
  - `supabase.ts` - Supabase client configuration
  - `pairingService.ts` - Partner pairing code logic
  - `biometricService.ts` - Biometric authentication (Face ID, fingerprint)
  - `notificationService.ts` - Push notifications
  - `photoService.ts` - Image picking and upload
  - `security.ts` - Screen capture prevention
- `components/ui/` - Reusable UI components
- `components/web/` - Web-specific components (landing page, sidebar)
- `types/` - TypeScript type definitions
- `utils/` - Utility functions (dates, storage, constants)

### Core Concepts
- **Entry unlock dates**: Normal entries unlock on the coming Sunday; special-date entries unlock on the specified date. Logic is in `utils/dates.ts`.
- **Partner pairing**: Users generate/enter pairing codes to connect accounts. Handled in `authStore` and `services/pairingService.ts`.
- **Platform detection**: Use `Platform.OS` to conditionally render. Web has its own layout components in `components/web/`.
- **Moods**: Entries can have one of 8 moods: happy, love, grateful, peaceful, excited, sad, anxious, tired.

### Database Schema (Supabase)
- `profiles` - User accounts with `partner_id` for linking couples
- `entries` - Diary entries with `unlock_date`, `mood`, `is_special_date`
- `reactions` - Text-selection reactions on partner entries

## Configuration Notes

- App uses React Compiler (`reactCompiler: true` in app.json experiments)
- Typed routes enabled (`typedRoutes: true`) for type-safe navigation
- `patch-package` runs on postinstall for any local package patches
- Deep linking scheme: `couplediary://`

## Environment Variables

Required for Supabase connection:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

GitHub Actions secrets for web deployment: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
