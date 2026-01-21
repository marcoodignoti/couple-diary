import {
    launchCameraAsync,
    launchImageLibraryAsync,
    requestCameraPermissionsAsync,
    requestMediaLibraryPermissionsAsync
} from 'expo-image-picker';
import { supabase } from './supabase';

const BUCKET_NAME = 'entry-photos';
const PROFILE_BUCKET_NAME = 'profile-photos';

/**
 * Request camera roll permissions
 */
export async function requestMediaLibraryPermissions(): Promise<boolean> {
    const { status } = await requestMediaLibraryPermissionsAsync();
    return status === 'granted';
}

/**
 * Pick an image from the camera roll
 */
export async function pickImage(): Promise<string | null> {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
        throw new Error('Media library permission not granted');
    }

    const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) {
        return null;
    }

    return result.assets[0].uri;
}

/**
 * Take a photo with the camera
 */
export async function takePhoto(): Promise<string | null> {
    const { status } = await requestCameraPermissionsAsync();
    if (status !== 'granted') {
        throw new Error('Camera permission not granted');
    }

    const result = await launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) {
        return null;
    }

    return result.assets[0].uri;
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadPhoto(userId: string, imageUri: string): Promise<string> {
    let uploadUri = imageUri;

    // Read file using standard fetch API (works for local URIs in RN)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    const response = await fetch(uploadUri, { signal: controller.signal });
    clearTimeout(timeoutId);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // Generate unique filename
    const extension = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${Date.now()}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, arrayBuffer, {
            contentType: `image/${extension}`,
            upsert: false,
        });

    if (error) {
        console.error('Supabase upload error details:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to upload photo: ${error.message || 'Unknown error'}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

/**
 * Delete a photo from Supabase Storage
 */
export async function deletePhoto(photoUrl: string): Promise<void> {
    // Extract path from URL
    const path = photoUrl.split(`${BUCKET_NAME}/`)[1];
    if (!path) return;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

    if (error) {
        console.error('Failed to delete photo');
    }
}

/**
 * Pick a profile image from the camera roll (square aspect ratio)
 */
export async function pickProfileImage(): Promise<string | null> {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
        throw new Error('Media library permission not granted');
    }

    const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Square for profile photos
        quality: 0.7,
    });

    if (result.canceled || !result.assets[0]?.uri) {
        return null;
    }

    return result.assets[0].uri;
}

/**
 * Upload a profile photo to Supabase Storage (private - only user can see)
 */
export async function uploadProfilePhoto(userId: string, imageUri: string): Promise<string> {
    // Read file using standard fetch API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(imageUri, { signal: controller.signal });
    clearTimeout(timeoutId);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // Use fixed filename to overwrite previous avatar
    const extension = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/avatar.${extension}`;

    // Upload to Supabase Storage (upsert to replace existing)
    const { data, error } = await supabase.storage
        .from(PROFILE_BUCKET_NAME)
        .upload(fileName, arrayBuffer, {
            contentType: `image/${extension}`,
            upsert: true,
        });

    if (error) {
        console.error('Profile upload error');
        throw new Error('Impossibile caricare la foto. Riprova.');
    }

    // Get public URL with cache-busting timestamp
    const { data: urlData } = supabase.storage
        .from(PROFILE_BUCKET_NAME)
        .getPublicUrl(data.path);

    return `${urlData.publicUrl}?t=${Date.now()}`;
}
