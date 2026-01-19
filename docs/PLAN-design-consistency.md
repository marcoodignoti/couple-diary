# Design Consistency Refactor Plan

> **Goal:** Apply the Home screen's premium design language consistently across ALL app screens.

---

## Design System Analysis

### ✅ Home Screen Design Language (Reference)
- **Cards**: `HeroCard` with gradient backgrounds, glow effects, decorative icons
- **Spacing**: Uses `Spacing` tokens consistently  
- **Typography**: `FontSizes['2xl']` for titles, proper hierarchy
- **Animations**: `FadeInDown` with staggered delays
- **Colors**: Rose pink primary, warm secondary, glassmorphism
- **Border Radius**: 32px (`BorderRadius['2xl']`) throughout
- **Shadows**: Soft shadows with theme color tint

### ❌ Screens Needing Updates

| Screen | Current State | Issues |
|--------|--------------|--------|
| **Calendar** | Basic StyleSheet | Plain cards, no glassmorphism, hardcoded colors |
| **Profile** | Partial GlassCard | Mixed styles, some hardcoded values |
| **Reveal** | Mixed | Needs review |
| **Partner** | Mixed | Needs review |
| **Entry Detail** | Basic | Needs consistency check |

---

## Proposed Changes

### 1. Calendar Screen (`app/(tabs)/calendar.tsx`)
- [x] Replace calendar card with `GlassCard` styling
- [x] Update entry cards to match `EntryCard` component
- [x] Apply consistent typography tokens
- [x] Add blur header effects
- [x] Consistent border radius (32px)

### 2. Profile Screen (`app/(tabs)/profile.tsx`)
- [x] Already uses `GlassCard` ✅
- [ ] Ensure all colors use `Colors` tokens
- [ ] Remove hardcoded hex values
- [ ] Consistent icon container styles

### 3. Reveal Screen (`app/reveal.tsx`)
- [ ] Apply `EntryCard` for entry display
- [ ] Consistent header styling
- [ ] Theme-aware colors

### 4. Partner Screen (`app/partner.tsx`)
- [ ] Apply `EntryCard` for partner entries
- [ ] Match calendar entry cards style

### 5. Entry Detail Screen (`app/entry/[id].tsx`)
- [ ] Apply consistent card styling
- [ ] Match color tokens

---

## Design Tokens to Enforce

```typescript
// Border Radius
BorderRadius['2xl'] = 32  // All cards

// Typography
FontSizes['2xl'] = 24     // Main titles
FontSizes.lg = 18         // Subtitles  
FontSizes.base = 16       // Body
FontSizes.sm = 14         // Secondary

// Shadows
Shadows.md                // Primary cards
Shadows.sm                // Secondary elements

// Colors (NO hardcoded hex!)
Colors.primary.DEFAULT    // #C0847C
Colors.secondary.DEFAULT  // #E8B4B8
Colors.stone[*]           // Grays
```

---

## Agent Assignments

| Agent | Responsibility |
|-------|----------------|
| `project-planner` | This plan ✅ |
| `mobile-developer` | Calendar + Reveal refactor |
| `frontend-specialist` | Profile + Partner refactor |
| `test-engineer` | Verify consistency across all screens |

---

## Verification Checklist

- [ ] All cards use `borderRadius: 32`
- [ ] All colors use `Colors` tokens
- [ ] All text uses `FontSizes` tokens
- [ ] All spacing uses `Spacing` tokens
- [ ] All animations use `FadeInDown` + staggered delays
- [ ] Dark mode works on ALL screens
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] App runs in Expo Go

---

## Priority Order

1. **Calendar** — Most visible inconsistency
2. **Reveal** — Core feature  
3. **Partner** — Partner feature
4. **Profile** — Already partial
5. **Entry Detail** — Detail view
