# UI Features & Material Design 3 (Android) Look and Feel Conversion Plan

This implementation plan maps the existing iOS design specs to their Android counterparts using Material Design 3 guidelines to ensure a native feel on both platforms.

## 1. Dark Theme System
**Goal**: Adapt "True Black" iOS OLED theme to Material Dark Theme.
- **Conversion**:
  - `background`: Use `#121212` mainly (standard Material Dark) or kept as `#000000` if "AMOLED Black" theme is desired explicitly. Material Guidelines recommend dark grey to reduce eye strain and smear.
  - `surface`: Use `Surface Container` colors (e.g., `#1E1E1E` to `#2C2C2C`).
  - `cardSolid`: Map to `Surface Variant` or `Surface Container High`.
  - **Dynamic Color**: Use `Material You` (Monet) if possible via `expo-material3-theme` to pull colors from user wallpaper.

## 2. Typography Scale
**Goal**: Map iOS Dynamic Type to Material Type Scale.
- **Conversion**:
  - `largeTitle` -> `Display Small` (36sp) or `Headline Large` (32sp).
  - `title2` -> `Headline Small` (24sp).
  - `headline` -> `Title Medium` (16sp, weight 500).
  - `footnote` -> `Body Small` (12sp).
- **Implementation**: logic in `constants/Typography.ts` to switch based on `Platform.OS`.

## 3. Bottom Tab Bar
**Goal**: Replace "Floating Blur" with "NavigationBar".
- **iOS**: Floating, Blur background, hidden labels (optional), line icons.
- **Android**:
  - **Component**: `NavigationBar` from `extract-react-native-paper` or standard View.
  - **Style**: Solid container (or slightly translucent `Surface`), full width (not floating).
  - **Indicators**: Pill-shaped indicator for active state.
  - **Labels**: Always visible or user-selectable behavior.
- **Implementation**: Conditional render in `app/(tabs)/_layout.tsx` or `TabBar.tsx` component. `if (Platform.OS === 'android') return <AndroidNavBar />`.

## 4. Large Card Carousel
**Goal**: Adapt "App Store" style to "Material Carousel".
- **Conversion**:
  - Keep logic mostly same.
  - **Android tweak**: Remove heavy box-shadows if performance is poor, use `elevation` instead.
  - **Snap**: `SnapHelper` behavior logic is cross-platform via Reanimated/ScrollView.
  - **Feedback**: Add `Ripple` effect on press.

## 5. Modal Detail Screens
**Goal**: Convert "Sheet Modal" to "Full Screen" or "Bottom Sheet".
- **iOS**: `presentation: 'modal'` (Native iOS sheet).
- **Android**:
  - `presentation: 'modal'` renders as full screen with slide up.
  - **Recommendation**: Use `presentation: 'transparentModal'` with a custom Bottom Sheet implementation (like `@gorhom/bottom-sheet`) for truly native-feeling sheets, OR keep full-screen with "Reveal" transition.

## 6. Blur Buttons
**Goal**: Replace "Frosted Glass" buttons.
- **Android**: Use standard FAB (Floating Action Button) or `Icon Button` with solid container.
  - Blur is computationally expensive on Android.
  - **Alternative**: Semi-transparent solid background (e.g., `rgba(0,0,0,0.5)`) without blur.

## 7. Haptic Feedback
**Goal**: Map core haptics to Android standard vibrations.
- **Conversion**:
  - `ImpactFeedbackStyle.Medium` -> `Haptics.notificationAsync` or `Vibration.vibrate`.
  - **Note**: `expo-haptics` supports Android, but feels different. Test mapping.

## 8. Press States
**Goal**: Replace "Scale & Opacity" with "Ripple".
- **iOS**: `opacity: 0.8, scale: 0.98`.
- **Android**: Use `TouchableNativeFeedback` or `Pressable` with `android_ripple` config.
  - `android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}`.

## 9. Pull-to-Refresh
**Goal**: Native styling.
- **Conversion**:
  - Standard `RefreshControl` in React Native uses standard Android spinner. No custom code needed mostly, just ensure `colors` prop sets the distinct color (e.g., brand primary).

## 10. Safe Area
**Goal**: Handle status bars.
- **Conversion**:
  - Android typically draws behind status bar (edge-to-edge) in modern apps.
  - Use `StatusBar.setTranslucent(true)` and `backgroundColor="transparent"`.

## 11. Navigation Transitions
**Goal**: Material Shared Axis or Standard Fade/Slide.
- **iOS**: `slide_from_right`.
- **Android**: `fade_from_bottom` or `animation: 'simple_push'` depending on library version. Use `animation: 'default'` to let OS decide.

## Summary Checklist for Android Spec
- [ ] Create `AndroidNavigationBar` component.
- [ ] Update `GlassCard.tsx` to use `android_ripple` on Android.
- [ ] Update `Colors.ts` to include Material palette or check contrast.
- [ ] Verify `expo-blur` fallback (ensure it doesn't look broken).
- [ ] Test Navigation transitions.
