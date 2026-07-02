import type { ImagePickerAsset } from 'expo-image-picker';
import { supabase } from './supabase';

const AUDIO_BUCKET = 'notes-audio';
const IMAGES_BUCKET = 'notes-images';

const uploadFile = async (
    bucket: string,
    path: string,
    uri: string
): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const { error } = await supabase.storage.from(bucket).upload(path, blob, {
        upsert: true,
        contentType: blob.type || undefined,
    });

    if (error) {
        console.log(`Storage upload error (${bucket}/${path}):`, error.message);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
};

export const uploadAudio = async (
    userId: string,
    noteId: string,
    index: number,
    audioUri: string
): Promise<string> => {
    if (audioUri.startsWith('http')) return audioUri;
    const ext = audioUri.split('.').pop() || 'm4a';
    const path = `${userId}/${noteId}/${index}.${ext}`;
    return await uploadFile(AUDIO_BUCKET, path, audioUri);
};

export const uploadImages = async (
    userId: string,
    noteId: string,
    images: ImagePickerAsset[]
): Promise<ImagePickerAsset[]> => {
    const uploaded = await Promise.all(
        images.map(async (img, index) => {
            if (img.uri.startsWith('http')) return img;
            const ext = img.uri.split('.').pop() || 'jpg';
            const path = `${userId}/${noteId}/${index}.${ext}`;
            const publicUrl = await uploadFile(IMAGES_BUCKET, path, img.uri);
            return { ...img, uri: publicUrl };
        })
    );
    return uploaded;
};

export const deleteAudio = async (path: string): Promise<void> => {
    const { error } = await supabase.storage.from(AUDIO_BUCKET).remove([path]);
    if (error) console.log('Failed to delete audio:', error.message);
};

export const deleteImages = async (paths: string[]): Promise<void> => {
    if (paths.length === 0) return;
    const { error } = await supabase.storage.from(IMAGES_BUCKET).remove(paths);
    if (error) console.log('Failed to delete images:', error.message);
};
