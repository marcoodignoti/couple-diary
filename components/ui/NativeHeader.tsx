import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { 
  interpolate, 
  useAnimatedStyle, 
  SharedValue 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export interface NativeHeaderAction {
  icon: string;
  onPress: () => void;
  color?: string;
  badge?: number | string;
}

export interface NativeHeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: NativeHeaderAction | 'back';
  rightAction?: NativeHeaderAction;
  largeTitle?: boolean;
  style?: ViewStyle;
  /**
   * Reanimated SharedValue representing the scroll offset (contentOffset.y)
   */
  scrollY?: SharedValue<number>;
  /**
   * The height at which the header becomes fully opaque/blurred.
   * Default is 20.
   */
  scrollThreshold?: number;
}

/**
 * A native-feeling iOS header with Liquid Glass blur effect.
 * Conforms to Apple HIG: 44pt touch targets, typography, and safe areas.
 * Handles Dynamic Island and Status Bar padding automatically.
 */
export function NativeHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  largeTitle = false,
  style,
  scrollY,
  scrollThreshold = 20,
}: NativeHeaderProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const router = useRouter();

  const _leftAction =
    leftAction === 'back'
      ? {
          icon: 'arrow-back-ios',
          onPress: () => router.canGoBack() && router.back(),
        }
      : leftAction;

  // Header height logic: 44 (standard) + safe area top
  const headerHeight = 44 + insets.top;

  // Animated style for progressive blur and border
  const animatedHeaderStyle = useAnimatedStyle(() => {
    if (!scrollY) return { opacity: 1, borderBottomWidth: StyleSheet.hairlineWidth };

    // Progressive opacity for the background blur
    // Starts transparent at the very top, becomes solid/blurred as you scroll
    const opacity = interpolate(
      scrollY.value,
      [0, scrollThreshold],
      [0, 1],
      'clamp'
    );

    // Border becomes visible as we scroll
    const borderWidth = interpolate(
      scrollY.value,
      [0, scrollThreshold],
      [0, StyleSheet.hairlineWidth],
      'clamp'
    );

    return {
      backgroundColor: isDark ? `rgba(28, 25, 23, ${opacity * 0.8})` : `rgba(250, 249, 246, ${opacity * 0.8})`,
      borderBottomWidth: borderWidth,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: headerHeight,
          paddingTop: insets.top,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        },
        animatedHeaderStyle,
        style,
      ]}
    >
      {/* The BlurView sits underneath the content to provide the progressive effect */}
      {scrollY ? (
        <AnimatedBlurView
          intensity={Platform.OS === 'ios' ? 80 : 100}
          tint={isDark ? 'dark' : 'light'}
          style={[
            StyleSheet.absoluteFillObject,
            useAnimatedStyle(() => ({
              opacity: interpolate(scrollY.value, [0, scrollThreshold], [0, 1], 'clamp'),
            })),
          ]}
        />
      ) : (
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 100}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <View style={styles.content}>
        {/* Left Action / Back */}
        <View style={styles.actionContainer}>
          {_leftAction && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={_leftAction.onPress}
              accessibilityRole="button"
              accessibilityLabel="Indietro"
            >
              <Icon
                name={_leftAction.icon}
                size={24}
                color={_leftAction.color || Colors.primary.DEFAULT}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Title / Subtitle */}
        <View style={styles.titleContainer}>
          {title && (
            <Text
              style={[
                styles.title,
                largeTitle && styles.largeTitle,
                { color: isDark ? Colors.white : Colors.stone[900] },
              ]}
              numberOfLines={1}
              accessibilityRole="header"
            >
              {title}
            </Text>
          )}
          {subtitle && !largeTitle && (
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? Colors.stone[400] : Colors.stone[500] },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Action */}
        <View style={[styles.actionContainer, styles.rightAction]}>
          {rightAction && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={rightAction.onPress}
              accessibilityRole="button"
            >
              <View>
                <Icon
                  name={rightAction.icon}
                  size={24}
                  color={rightAction.color || Colors.primary.DEFAULT}
                />
                {!!rightAction.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{rightAction.badge}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  content: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
  },
  actionContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rightAction: {
    alignItems: 'flex-end',
  },
  actionButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'left',
    width: '100%',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
