---
name: agent-expo
description: Best practices for Expo React Native development with cross-platform compatibility
model: inherit
color: green
---

# Agent: Expo React Native Best Practices

Comprehensive best practices for Expo React Native development with proper cross-platform compatibility, font handling, and performance optimization.

## =1 CRITICAL: Cross-Platform Compatibility

### Issue: Platform-Specific Code Breaks
Expo apps run on iOS, Android, and Web with different capabilities and behaviors. Code that works on one platform may crash on another.

**ERROR:** `Platform.OS === 'web'` checks missing, web-specific APIs used on native, native APIs used on web

### Solution: Always Use Platform Checks

```typescript
import { Platform } from 'react-native';

// ❌ FAILS - No platform check
const setupFeature = () => {
  window.localStorage.setItem('key', 'value'); // Crashes on native
};

// ✅ WORKS - Platform-aware code
const setupFeature = () => {
  if (Platform.OS === 'web') {
    window.localStorage.setItem('key', 'value');
  } else {
    // Use AsyncStorage or SecureStore for native
    import('@react-native-async-storage/async-storage').then(AsyncStorage => {
      AsyncStorage.default.setItem('key', 'value');
    });
  }
};

// ✅ WORKS - Platform-specific imports
const Storage = Platform.select({
  web: () => require('./storage.web'),
  default: () => require('./storage.native'),
})();
```

## =2 CRITICAL: Font Management

### Issue: Font Loading Breaks App Render
Improper font loading can cause blank screens, especially on web where fonts load asynchronously.

**ERROR:** App shows blank white screen, fonts not applied consistently, `fontFamily` not working

### Solution: Proper Font Loading Pattern

```typescript
// ❌ FAILS - Blocks render, no fallbacks
const [fontsLoaded] = useFonts({ CustomFont });
if (!fontsLoaded) return null; // Blocks forever if font fails

// ✅ WORKS - Proper font loading with splash screen
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@expo-google-fonts/space-grotesk';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Custom-Regular': require('./assets/fonts/Custom-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <YourApp />;
}

// ✅ WORKS - Font constants for consistency
export const fonts = {
  regular: 'Custom-Regular',
  bold: 'Custom-Bold',
} as const;

// ✅ WORKS - Component-level font application
const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.regular, // Always specify in styles
  },
});
```

### Avoid Global Font Overrides
```typescript
// ❌ FAILS - Unreliable on web
Text.defaultProps = { style: { fontFamily: 'Custom' } };

// ✅ WORKS - Component-specific fonts
const CustomText = ({ style, ...props }) => (
  <Text style={[{ fontFamily: fonts.regular }, style]} {...props} />
);
```

## =3 CRITICAL: Environment Configuration

### Issue: Environment Variables Not Working
Expo has specific requirements for environment variables that differ from standard React apps.

**ERROR:** `process.env.MY_VAR` is undefined, env vars not loading

### Solution: Proper Expo Environment Setup

```bash
# ✅ WORKS - .env.local file
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_CLERK_KEY=pk_test_...

# ❌ FAILS - Without EXPO_PUBLIC_ prefix (not accessible in client)
API_URL=https://api.example.com
```

```typescript
// ✅ WORKS - Access public env vars
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// ✅ WORKS - Runtime environment checks
const isDev = __DEV__;
const isWeb = Platform.OS === 'web';

// ✅ WORKS - App config (app.json)
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.example.com"
    }
  }
}

// Access via Constants
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

## =4 WEB-SPECIFIC: Navigation and Routing

### Issue: Web Navigation Breaks
Expo Router works differently on web vs native, requiring special handling.

### Solution: Web-Aware Navigation

```typescript
// ✅ WORKS - Proper Expo Router usage
import { router } from 'expo-router';

const navigateToScreen = () => {
  if (Platform.OS === 'web') {
    // Web handles history automatically
    router.push('/screen');
  } else {
    // Native needs replace for certain flows
    router.replace('/screen');
  }
};

// ✅ WORKS - Web-specific meta tags
export default function Layout() {
  return (
    <>
      <Stack.Screen options={{
        title: 'My App',
        // Web-specific options
        ...(Platform.OS === 'web' && {
          headerShown: true,
        }),
      }} />
    </>
  );
}
```

## =5 PERFORMANCE: Bundle Size and Loading

### Issue: Large Bundle Sizes on Web
Expo web bundles can become large if not properly optimized.

### Solution: Code Splitting and Lazy Loading

```typescript
// ✅ WORKS - Dynamic imports
const HeavyComponent = Platform.select({
  web: lazy(() => import('./HeavyComponent.web')),
  default: lazy(() => import('./HeavyComponent.native')),
});

// ✅ WORKS - Conditional imports
const useNativeFeature = () => {
  if (Platform.OS !== 'web') {
    return require('./nativeFeature').useNativeFeature();
  }
  return null;
};

// ✅ WORKS - Platform-specific dependencies
// package.json
{
  "dependencies": {
    "react-native-web": "web-only-package"
  },
  "react-native": {
    "react-native-web": false // Don't bundle on native
  }
}
```

## =6 STYLING: Cross-Platform Styles

### Issue: Styles Break Across Platforms
React Native styling has platform differences that can break layouts.

### Solution: Platform-Aware Styling

```typescript
// ✅ WORKS - Platform-specific styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      ios: {
        paddingTop: 44, // Status bar height
      },
      android: {
        paddingTop: 24,
      },
      web: {
        maxWidth: 800, // Web-specific constraint
        margin: '0 auto',
      },
    }),
  },
  // ✅ WORKS - Web-safe properties
  text: {
    fontFamily: Platform.OS === 'web' ? 'system-ui' : 'System',
    // Avoid web-incompatible properties
    textShadowOffset: Platform.OS !== 'web' ? { width: 1, height: 1 } : undefined,
  },
});

// ✅ WORKS - Responsive design for web
const useResponsiveStyle = () => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        setWindowWidth(window.width);
      });
      return subscription?.remove;
    }
  }, []);

  return windowWidth > 768 ? styles.desktop : styles.mobile;
};
```

## =7 NATIVE FEATURES: Camera, Notifications, etc.

### Issue: Native Features Don't Work on Web
Many Expo modules don't work on web or need fallbacks.

### Solution: Feature Detection and Fallbacks

```typescript
// ✅ WORKS - Feature detection
import * as Camera from 'expo-camera';

const useCameraFeature = () => {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Use web camera API or show alternative
      setHasPermission('granted');
      return;
    }

    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  const takePicture = async () => {
    if (Platform.OS === 'web') {
      // Web fallback - file input or WebRTC
      return showWebCameraFallback();
    }
    
    // Native camera functionality
    return await cameraRef.current.takePictureAsync();
  };

  return { hasPermission, takePicture };
};
```

## =8 TESTING: Platform-Specific Testing

### Issue: Tests Don't Cover All Platforms
Tests may pass on one platform but fail on others.

### Solution: Multi-Platform Test Strategy

```javascript
// ✅ WORKS - Platform-specific tests
describe('MyComponent', () => {
  beforeEach(() => {
    Platform.OS = 'ios'; // Mock platform
  });

  it('renders correctly on iOS', () => {
    // iOS-specific test
  });

  it('renders correctly on web', () => {
    Platform.OS = 'web';
    // Web-specific test
  });
});

// ✅ WORKS - Feature detection tests
it('uses correct storage method', async () => {
  const originalPlatform = Platform.OS;
  
  Platform.OS = 'web';
  expect(getStorageMethod()).toBe('localStorage');
  
  Platform.OS = 'ios';
  expect(getStorageMethod()).toBe('SecureStore');
  
  Platform.OS = originalPlatform;
});
```

## =9 DEBUGGING: Platform-Specific Issues

### Issue: Hard to Debug Platform-Specific Problems
Different platforms have different debugging tools and limitations.

### Solution: Enhanced Debug Setup

```typescript
// ✅ WORKS - Enhanced logging
const logger = {
  info: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[${Platform.OS}] ${message}`, data);
      
      // Web-specific debugging
      if (Platform.OS === 'web' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        // Enhanced web debugging
      }
    }
  },
  error: (error: Error) => {
    console.error(`[${Platform.OS}] Error:`, error);
    
    // Platform-specific error reporting
    if (Platform.OS !== 'web') {
      // Use native crash reporting
      // crashlytics().recordError(error);
    }
  },
};

// ✅ WORKS - Development overlays
if (__DEV__ && Platform.OS === 'web') {
  // Web-specific dev tools
  import('react-devtools').then(({ connectToDevTools }) => {
    connectToDevTools();
  });
}
```

## =10 DEPLOYMENT: Platform-Specific Builds

### Issue: Build Configuration Differences
Each platform requires different build configurations and optimizations.

### Solution: Proper Build Setup

```json
// app.json
{
  "expo": {
    "platforms": ["ios", "android", "web"],
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/favicon.png"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourapp.app"
    },
    "android": {
      "package": "com.yourapp.app",
      "versionCode": 1
    }
  }
}
```

```bash
# ✅ WORKS - Platform-specific builds
npx expo build:web          # Web build
npx expo build:ios          # iOS build  
npx expo build:android      # Android build

# ✅ WORKS - Development commands
npx expo start --web        # Web only
npx expo start --ios        # iOS only
npx expo start --android    # Android only
```

## Common Patterns Summary

1. **Always use Platform.OS checks** for platform-specific code
2. **Load fonts properly** with splash screen management
3. **Use EXPO_PUBLIC_** prefix for client-accessible env vars
4. **Test on all target platforms** before deployment
5. **Implement fallbacks** for native features on web
6. **Use platform-specific styling** where needed
7. **Handle async operations** carefully across platforms
8. **Debug with platform context** in mind

## Quick Checklist

- [ ] All platform-specific code has `Platform.OS` checks
- [ ] Fonts load properly with splash screen
- [ ] Environment variables use correct prefixes
- [ ] Navigation works on web and native
- [ ] Styles are responsive and cross-platform compatible
- [ ] Native features have web fallbacks
- [ ] App has been tested on all target platforms
- [ ] Build configurations are platform-specific
- [ ] Error handling is platform-aware
- [ ] Performance is optimized for each platform