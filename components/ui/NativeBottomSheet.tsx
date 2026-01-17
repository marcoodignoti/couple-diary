import React, { forwardRef, useCallback, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView, useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetProps } from '@gorhom/bottom-sheet';
import { Colors, BorderRadius, Spacing, FontSizes, Shadows } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';

interface NativeBottomSheetProps {
  /**
   * Sheet content
   */
  children: React.ReactNode;

  /**
   * Optional title shown in header
   */
  title?: string;

  /**
   * Optional subtitle shown under title
   */
  subtitle?: string;

  /**
   * Show close button in header
   */
  showCloseButton?: boolean;

  /**
   * Callback when sheet is closed
   */
  onClose?: () => void;

  /**
   * Snap points (heights) for the sheet
   * Default: ['50%', '90%']
   * Use 'CONTENT_HEIGHT' for dynamic sizing
   */
  snapPoints?: (string | number)[];

  /**
   * Initial snap index (0 = first snap point)
   */
  initialSnapIndex?: number;

  /**
   * Enable dynamic snap points based on content
   */
  enableDynamicSizing?: boolean;

  /**
   * Background style - 'default' uses theme, 'transparent' for custom backgrounds
   */
  backgroundStyle?: 'default' | 'transparent';

  /**
   * Enable pan down to close gesture
   */
  enablePanDownToClose?: boolean;

  /**
   * Additional BottomSheet props
   */
  bottomSheetProps?: Partial<BottomSheetProps>;
}

/**
 * Native bottom sheet component following iOS and Android design guidelines
 *
 * Features:
 * - Native gestures and animations
 * - iOS-style handle indicator
 * - Material Design backdrop
 * - Dark mode support
 * - Dynamic height sizing
 * - Keyboard handling
 *
 * @example
 * ```tsx
 * const bottomSheetRef = useRef<BottomSheet>(null);
 *
 * <NativeBottomSheet
 *   ref={bottomSheetRef}
 *   title="Seleziona Mood"
 *   snapPoints={['50%']}
 *   onClose={() => console.log('closed')}
 * >
 *   <Text>Content here</Text>
 * </NativeBottomSheet>
 * ```
 */
export const NativeBottomSheet = forwardRef<BottomSheet, NativeBottomSheetProps>(
  (
    {
      children,
      title,
      subtitle,
      showCloseButton = true,
      onClose,
      snapPoints: customSnapPoints,
      initialSnapIndex = 0,
      enableDynamicSizing = false,
      backgroundStyle = 'default',
      enablePanDownToClose = true,
      bottomSheetProps,
    },
    ref
  ) => {
    const { isDark, colors } = useTheme();

    // Snap points configuration
    const snapPoints = useMemo(() => {
      if (enableDynamicSizing) {
        return ['CONTENT_HEIGHT'];
      }
      return customSnapPoints || ['50%', '90%'];
    }, [customSnapPoints, enableDynamicSizing]);

    // Backdrop component with native animations
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={isDark ? 0.8 : 0.5}
          pressBehavior="close"
        />
      ),
      [isDark]
    );

    // Handle sheet changes (closed)
    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1 && onClose) {
          onClose();
        }
      },
      [onClose]
    );

    // Background style based on theme
    const backgroundStyles = useMemo(() => {
      if (backgroundStyle === 'transparent') {
        return { backgroundColor: 'transparent' };
      }

      return {
        backgroundColor: isDark ? Colors.stone[900] : Colors.white,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: isDark ? 0.5 : 0.15,
            shadowRadius: 16,
          },
          android: {
            elevation: 16,
          },
        }),
      };
    }, [isDark, backgroundStyle]);

    // Handle indicator style (iOS)
    const handleIndicatorStyle = useMemo(
      () => ({
        backgroundColor: isDark ? Colors.stone[600] : Colors.stone[300],
        width: 36,
        height: 4,
      }),
      [isDark]
    );

    return (
      <BottomSheet
        ref={ref}
        snapPoints={snapPoints}
        index={initialSnapIndex}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={handleIndicatorStyle}
        backgroundStyle={backgroundStyles}
        onChange={handleSheetChanges}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        enableDynamicSizing={enableDynamicSizing}
        {...bottomSheetProps}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                {title && (
                  <Text
                    style={[
                      styles.title,
                      { color: isDark ? Colors.white : Colors.text.light },
                    ]}
                  >
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text
                    style={[
                      styles.subtitle,
                      { color: isDark ? Colors.stone[400] : Colors.stone[500] },
                    ]}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>

              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    {
                      backgroundColor: isDark ? Colors.stone[800] : Colors.stone[100],
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  hitSlop={8}
                >
                  <Icon
                    name="close"
                    size={20}
                    color={isDark ? Colors.stone[300] : Colors.stone[600]}
                  />
                </Pressable>
              )}
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

NativeBottomSheet.displayName = 'NativeBottomSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone[200],
  } as ViewStyle,
  headerTextContainer: {
    flex: 1,
    marginRight: Spacing[4],
  } as ViewStyle,
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing[1],
  } as TextStyle,
  subtitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  } as TextStyle,
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  } as ViewStyle,
});
