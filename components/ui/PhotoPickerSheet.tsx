import React, { forwardRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import BottomSheet from '@gorhom/bottom-sheet';
import { ActionSheet, type ActionSheetOption } from './ActionSheet';

interface PhotoPickerSheetProps {
  /**
   * Callback when photo is selected
   */
  onPhotoSelected: (uri: string) => void;

  /**
   * Callback when sheet is closed
   */
  onClose?: () => void;
}

/**
 * Native photo picker action sheet
 *
 * Features:
 * - Camera option
 * - Photo library option
 * - Permission handling
 * - Cancel option
 *
 * @example
 * ```tsx
 * const photoSheetRef = useRef<BottomSheet>(null);
 *
 * // Open sheet
 * photoSheetRef.current?.snapToIndex(0);
 *
 * <PhotoPickerSheet
 *   ref={photoSheetRef}
 *   onPhotoSelected={(uri) => setPhotoUri(uri)}
 * />
 * ```
 */
export const PhotoPickerSheet = forwardRef<BottomSheet, PhotoPickerSheetProps>(
  ({ onPhotoSelected, onClose }, ref) => {
    const requestCameraPermission = useCallback(async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permesso Necessario',
          'Devi concedere il permesso per accedere alla fotocamera.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    }, []);

    const requestLibraryPermission = useCallback(async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permesso Necessario',
          'Devi concedere il permesso per accedere alla galleria.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    }, []);

    const handleTakePhoto = useCallback(async () => {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoSelected(result.assets[0].uri);
      }
    }, [requestCameraPermission, onPhotoSelected]);

    const handleChooseFromLibrary = useCallback(async () => {
      const hasPermission = await requestLibraryPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoSelected(result.assets[0].uri);
      }
    }, [requestLibraryPermission, onPhotoSelected]);

    const handleCancel = useCallback(() => {
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.close();
      }
      onClose?.();
    }, [ref, onClose]);

    const options: ActionSheetOption[] = [
      {
        label: 'Scatta Foto',
        icon: 'camera-alt',
        onPress: handleTakePhoto,
      },
      {
        label: 'Scegli dalla Galleria',
        icon: 'photo-library',
        onPress: handleChooseFromLibrary,
      },
      {
        label: 'Annulla',
        variant: 'cancel',
        onPress: handleCancel,
      },
    ];

    return (
      <ActionSheet
        ref={ref}
        title="Aggiungi Foto"
        message="Scegli come vuoi aggiungere una foto al tuo diario"
        options={options}
        onClose={onClose}
      />
    );
  }
);

PhotoPickerSheet.displayName = 'PhotoPickerSheet';
