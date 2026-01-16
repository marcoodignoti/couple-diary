# Immersive UI Implementation Plan - Couple Diary

## Overview

Upgrade the app's UI to be more immersive following Expo UI guidelines, with proper adaptation for iOS and Android screen ratios.

---

## Current State

| Aspect | Status |
|--------|--------|
| Tab Bar | Custom JS TabBar (not NativeTabs) |
| Entering Animations | Good (FadeInDown with delays) |
| Layout/Exit Animations | Missing |
| Glass Effects | expo-blur only (no expo-glass-effect) |
| Safe Area | Correct (contentInsetAdjustmentBehavior) |
| Theme System | Comprehensive (constants/theme.ts) |
| Responsive/Tablet | Limited support |

---

## Phase 1: Layout and Exit Animations

**Priority: Highest** | **Risk: Low** | **Effort: 2-3 hours**

### 1.1 Add Layout Animations to Dynamic Lists

**Files:**
- `app/(tabs)/calendar.tsx`
- `app/(tabs)/index.tsx`
- `app/partner.tsx`

```typescript
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

// Wrap entry lists
<Animated.View layout={LinearTransition}>
  {entries.map((entry, i) => (
    <Animated.View
      key={entry.id}
      entering={FadeInDown.delay(100 + i * 50).duration(400)}
      exiting={FadeOut.duration(200)}
      layout={LinearTransition}
    >
      {/* Entry card */}
    </Animated.View>
  ))}
</Animated.View>
```

### 1.2 Add Staggered Animation Helper

**File:** `components/ui/Animations.tsx`

```typescript
export function StaggeredItem({ children, index, baseDelay = 50, style }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * baseDelay).duration(400)}
      exiting={FadeOut.duration(200)}
      layout={LinearTransition.springify().damping(15)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
```

---

## Phase 2: UI Polish

**Priority: High** | **Risk: Low** | **Effort: 1-2 hours**

### 2.1 Add borderCurve: 'continuous'

**Files:** All files with rounded corners

```typescript
// Add to all card/button styles
{
  borderRadius: 24,
  borderCurve: 'continuous', // iOS continuous corners
}
```

**Target files:**
- `components/ui/GlassCard.tsx`
- `components/EntryCard.tsx`
- `components/ui/NativeButton.tsx`
- All tab screen cards

### 2.2 Add tabular-nums to Counters

**Files:**
- `app/(tabs)/calendar.tsx` - Entry counts
- `app/(tabs)/insight.tsx` - Statistics

```typescript
<Text style={{ fontVariant: ['tabular-nums'] }}>{count}</Text>
```

### 2.3 Verify selectable on Important Text

Add `selectable` prop to:
- Entry content text
- Date displays
- Pairing codes
- Error messages

---

## Phase 3: Responsive Improvements

**Priority: High** | **Risk: Low** | **Effort: 3-4 hours**

### 3.1 Create Responsive Hook

**New file:** `hooks/useResponsive.ts`

```typescript
import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const breakpoint = width >= 1024 ? 'desktop' : width >= 768 ? 'tablet' : 'mobile';
  const isLandscape = width > height;
  const isTablet = breakpoint !== 'mobile';

  return {
    width, height, breakpoint, isLandscape, isTablet,
    contentMaxWidth: isTablet ? 720 : width,
    gridColumns: breakpoint === 'desktop' ? 3 : breakpoint === 'tablet' ? 2 : 1,
  };
}
```

### 3.2 Apply Responsive Layouts

**Files:**
- `app/(tabs)/index.tsx`
- `app/(tabs)/calendar.tsx`
- `app/(tabs)/profile.tsx`

```typescript
const { contentMaxWidth, isTablet } = useResponsive();

<View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }}>
  {/* Content */}
</View>
```

### 3.3 Calendar Side-by-Side Layout (Tablet Landscape)

**File:** `app/(tabs)/calendar.tsx`

```typescript
const { isLandscape, isTablet } = useResponsive();

{isTablet && isLandscape ? (
  <View style={{ flexDirection: 'row', gap: 24 }}>
    <View style={{ flex: 1 }}>{/* Calendar grid */}</View>
    <View style={{ flex: 1 }}>{/* Entries list */}</View>
  </View>
) : (
  // Current stacked layout
)}
```

---

## Phase 4: Glass Effects Enhancement

**Priority: Medium** | **Risk: Medium** | **Effort: 2-3 hours**

### 4.1 Create Adaptive Glass Component

**New file:** `components/ui/AdaptiveGlass.tsx`

```typescript
import { BlurView } from 'expo-blur';
import { View, ViewStyle } from 'react-native';

// Check if expo-glass-effect is available (iOS 26+)
let GlassView: any = null;
let isLiquidGlassAvailable = () => false;
try {
  const glassModule = require('expo-glass-effect');
  GlassView = glassModule.GlassView;
  isLiquidGlassAvailable = glassModule.isLiquidGlassAvailable;
} catch (e) {}

export function AdaptiveGlass({ children, style, intensity = 65 }: {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}) {
  if (isLiquidGlassAvailable()) {
    return <GlassView style={style}>{children}</GlassView>;
  }

  if (process.env.EXPO_OS === 'ios') {
    return (
      <BlurView tint="systemMaterial" intensity={intensity} style={style}>
        {children}
      </BlurView>
    );
  }

  // Android fallback
  return <View style={[style, { backgroundColor: '#FFFFFF' }]}>{children}</View>;
}
```

### 4.2 Update GlassCard

**File:** `components/ui/GlassCard.tsx`

Use AdaptiveGlass for progressive enhancement on iOS 26+.

---

## Phase 5: Link.Preview and Context Menus

**Priority: Medium** | **Risk: Medium** | **Effort: 2-3 hours**

### 5.1 Add Link.Preview to Entry Cards

**File:** `components/EntryCard.tsx`

```typescript
import { Link } from 'expo-router';

<Link href={`/entry/${entry.id}`} asChild>
  <Link.Trigger>
    <AnimatedPressable style={styles.container}>
      {/* Card content */}
    </AnimatedPressable>
  </Link.Trigger>
  <Link.Preview />
</Link>
```

### 5.2 Add Context Menus

**File:** `components/EntryCard.tsx`

```typescript
<Link href={`/entry/${entry.id}`}>
  <Link.Trigger>
    <AnimatedPressable>{/* Card */}</AnimatedPressable>
  </Link.Trigger>
  <Link.Menu>
    <Link.MenuAction title="Condividi" icon="square.and.arrow.up" onPress={handleShare} />
    <Link.MenuAction title="Elimina" icon="trash" destructive onPress={handleDelete} />
  </Link.Menu>
  <Link.Preview />
</Link>
```

---

## Phase 6: Native Tabs Migration (Optional)

**Priority: Lower** | **Risk: High** | **Effort: 6-8 hours**

> **Note:** The current custom TabBar has a distinctive pill-style design. NativeTabs provides platform-native appearance which may differ from the app's aesthetic. Consider this a future enhancement.

### 6.1 If Proceeding: Migration Steps

**File:** `app/(tabs)/_layout.tsx`

```typescript
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <Icon sf="square.and.pencil" />
        <Label>Diario</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendar">
        <Icon sf="calendar" />
        <Label>Ricordi</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insight">
        <Icon sf="chart.bar.fill" />
        <Label>Insight</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" />
        <Label>Profilo</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

### 6.2 Create Nested Stacks

Restructure to:
```
app/(tabs)/
  _layout.tsx          <- NativeTabs
  (diary)/
    _layout.tsx        <- Stack with headers
    index.tsx
  (calendar)/
    _layout.tsx        <- Stack
    index.tsx
  ...
```

---

## Implementation Order

| Phase | Description | Immediate Visual Impact |
|-------|-------------|------------------------|
| 1 | Layout/Exit Animations | High - Smoother list interactions |
| 2 | UI Polish | Medium - Refined look |
| 3 | Responsive | High - Tablet/landscape support |
| 4 | Glass Effects | Medium - iOS 26+ enhancement |
| 5 | Link.Preview/Menus | Medium - iOS navigation feel |
| 6 | Native Tabs | High - But optional |

**Recommended:** Phases 1 -> 2 -> 3 -> 4 -> 5 (Phase 6 optional)

---

## Critical Files

| File | Changes |
|------|---------|
| `components/ui/Animations.tsx` | Add StaggeredItem, layout utilities |
| `components/ui/GlassCard.tsx` | Add borderCurve, AdaptiveGlass |
| `components/EntryCard.tsx` | Add Link.Preview, context menus, borderCurve |
| `app/(tabs)/calendar.tsx` | Layout animations, responsive layout |
| `app/(tabs)/index.tsx` | Layout animations, responsive layout |
| `hooks/useResponsive.ts` | NEW - Responsive utilities |
| `components/ui/AdaptiveGlass.tsx` | NEW - Glass effect wrapper |

---

## Verification

After each phase:
1. Test on iOS simulator (iPhone SE, iPhone 15 Pro Max)
2. Test on Android emulator (small + large screens)
3. Test on web browser (narrow + wide)
4. Test dark/light mode
5. Test landscape orientation
6. Test animation performance (no jank)

---

## Dependencies

- **Current packages sufficient** for Phases 1-3, 5
- **expo-glass-effect** - Install for Phase 4 (iOS 26+ only)
- **expo-router 6+** - Already installed, supports Link.Preview
