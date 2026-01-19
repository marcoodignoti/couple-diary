# Native Polish Enhancement Plan

> **Goal:** Enhance Couple Diary with native iOS/Android polish using Expo's native-feeling components.

---

## Overview

The app already uses many native components (date picker, bottom sheets, native tabs, haptics). This plan adds finishing touches for a premium, platform-native feel.

## Enhancements

### 1. Native Blur Effects (`expo-blur`)
Add blur backgrounds to headers, sheets, and overlays for iOS vibrancy.

**Files to modify:**
- `components/ui/NativeBottomSheet.tsx` — Add blur backdrop
- `app/_layout.tsx` — Transparent headers with blur effect

**Effort:** Low (1-2 hours)

---

### 2. Native Context Menus (Link.Menu)
Replace long-press actions with native iOS/Android context menus.

**Files to modify:**
- `components/home/HeroCard.tsx` — Add context menu for quick actions
- `components/home/EntryCard.tsx` — Add share/delete context menu
- `app/reveal.tsx` — Add context menu for entries

**Effort:** Medium (2-3 hours)

---

### 3. Native Sheet Presentations
Use Expo Router's native `formSheet` instead of `@gorhom/bottom-sheet` where appropriate.

**Files to modify:**
- `app/entry/new.tsx` — Consider native sheet for date picker
- `components/ui/SpecialDatePickerSheet.tsx` — Could become a route-based sheet

**Effort:** Low (1 hour)

---

### 4. Link Previews
Add 3D Touch / long-press previews to entry cards.

**Files to modify:**
- `components/home/EntryCard.tsx` — Wrap with Link.Preview

**Effort:** Low (30 minutes)

---

## Agent Assignments

| Agent | Task |
|-------|------|
| `mobile-developer` | Implement blur effects and haptic feedback improvements |
| `frontend-specialist` | Implement context menus and link previews |
| `test-engineer` | Verify features work on iOS and Android |

---

## Verification Checklist

- [ ] `expo-blur` installed and working
- [ ] Context menus appear on long-press
- [ ] Link previews work on iOS
- [ ] All existing features still functional
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] App runs on Expo Go

---

## Priority Order

1. **Native Blur Effects** — Highest visual impact
2. **Context Menus** — Improves UX discoverability  
3. **Link Previews** — Nice-to-have polish
4. **Native Sheets** — Optional refactor

---

## Notes

- All changes are additive — no breaking changes
- Features degrade gracefully on Android
- Keep current custom theming (rose pink, glassmorphism)
