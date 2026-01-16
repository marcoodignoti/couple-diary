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
- **Styling**: NativeWind (TailwindCSS for React Native) with custom theme in `tailwind.config.js`
- **State**: Zustand stores in `stores/` directory
- **Backend**: Supabase (auth + database), configured via `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars
- **Auth Storage**: expo-secure-store on native, localStorage on web

### Key Directories
- `app/` - Expo Router screens using file-based routing
  - `(auth)/` - Login, register, pairing flows
  - `(tabs)/` - Main app tabs (diary, calendar, profile)
  - `entry/` - Entry viewing/editing (modal presentation)
  - `onboarding/` - First-time user flows
- `stores/` - Zustand state management
  - `authStore.ts` - User auth, profile, and partner pairing
  - `entryStore.ts` - Diary entries CRUD and partner entries
- `services/` - Supabase API interactions
- `components/ui/` - Reusable UI components
- `components/web/` - Web-specific components (landing page, sidebar)

### Core Concepts
- **Entry unlock dates**: Normal entries unlock on the coming Sunday; special-date entries unlock on the specified date. Logic is in `utils/dates.ts`.
- **Partner pairing**: Users generate/enter pairing codes to connect accounts. Handled in `authStore` and `services/pairingService.ts`.
- **Platform detection**: Use `Platform.OS` to conditionally render. Web has its own layout components in `components/web/`.

### Database Schema (Supabase)
- `profiles` - User accounts with `partner_id` for linking couples
- `entries` - Diary entries with `unlock_date`, `mood`, `is_special_date`
- `reactions` - Text-selection reactions on partner entries

## Configuration Notes

- Babel requires `react-native-reanimated/plugin` to be last in plugins array
- NativeWind preset must be included in both `babel.config.js` and `tailwind.config.js`
- Dark mode is class-based (`darkMode: "class"` in Tailwind config)
- Custom colors: `primary` (terracotta), `secondary` (gold), `background`, `surface`, `text` with light/dark variants

## Environment Variables

Required for Supabase connection:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

GitHub Actions secrets for web deployment: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
