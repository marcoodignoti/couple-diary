UI Features & Native iOS Look and Feel
1. Dark Theme System
// src/constants/theme.ts
colors: {
  background: '#000000',      // True black for OLED
  surface: '#1a1a1a',         // Elevated surfaces
  cardSolid: '#1C1C1E',       // iOS system gray 6
  border: '#38383A',          // iOS separator color
}

Uses Apple’s Human Interface Guidelines color palette for dark mode.
——————————————

2. Typography Scale
typography: {
  largeTitle: { fontSize: 34, fontWeight: '700' },  // Screen headers
  title2: { fontSize: 22, fontWeight: '700' },      // Section headers
  headline: { fontSize: 17, fontWeight: '600' },    // Card titles
  footnote: { fontSize: 13 },                       // Metadata
}

Matches iOS Dynamic Type sizes exactly.
——————————————

3. Bottom Tab Bar with Blur
// src/navigation/AppNavigator.tsx
const TabBarBackground = () => (
  <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
);

tabBarStyle: {
  position: 'absolute',
  backgroundColor: 'transparent',
}

Floating tab bar with blur effect like Apple Music/App Store.
——————————————

4. Large Card Carousel
// MediaCarousel with cardSize="large"
- Width: 55% of screen
- Gradient overlay at bottom
- Title/subtitle positioned over image
- Snap-to-card scrolling

Mimics the featured content sections in App Store.
—————————————

5. Modal Detail Screens
// Stack navigation
presentation: 'modal',
animation: 'slide_from_bottom',
gestureEnabled: true,

Slides up from bottom with swipe-to-dismiss, like iOS sheets.
——————————————

6. Blur Buttons on Detail Screen

<BlurView intensity={80} style={styles.blurButton}>
  <Ionicons name="close" size={24} />
</BlurView>

Close/menu buttons with frosted glass effect over backdrop.
——————————

7. Haptic Feedback

import * as Haptics from 'expo-haptics';

// On button press
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// On star rating
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

Tactile feedback on interactions like native apps.
—————————

8. Press States

<Pressable
  style={({ pressed }) => [
    styles.container,
    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
  ]}
>

Subtle scale-down animation on press, like iOS buttons.
———————-

9. Collection Cards with Stacked Posters

// CollectionCard.tsx
posterBack: {
  transform: [{ rotate: '8deg' }, { translateX: 15 }],
},
posterFront: {
  transform: [{ rotate: '-5deg' }, { translateX: -10 }],
}

Layered poster effect like Apple TV app library.
————————-

10. Pull-to-Refresh

<RefreshControl
  refreshing={isRefreshing}
  onRefresh={handleRefresh}
  tintColor={colors.text}  // White spinner on dark bg
/>

Native iOS refresh control styling.
—————————

11. Safe Area Handling

<SafeAreaView edges={['top']}>

Respects notch/Dynamic Island on modern iPhones.
—————————-

12. Image Loading with expo-image

<Image
  source={{ uri: posterUrl }}
  contentFit="cover"
  transition={200}  // Smooth fade-in
/>

Optimized image caching with subtle load transitions.
——————-

13. Pill-Shaped Action Buttons

borderRadius: borderRadius.round,  // 9999px = pill shape

Rounded buttons matching iOS 15+ button style.
——————

14. Rating Badges Layout

Horizontal scroll of compact rating indicators (Critics, Audience, IMDb, Runtime) with colored icons - similar to Rotten Tomatoes/Letterboxd native apps.

Key Libraries Used:
 ∙ expo-blur - Frosted glass effects
 ∙ expo-linear-gradient - Smooth gradients on cards
 ∙ expo-haptics - Tactile feedback
 ∙ expo-image - Optimized image loading
 ∙ react-native-safe-area-context - Notch handling