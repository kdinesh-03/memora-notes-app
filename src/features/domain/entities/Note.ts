import type { ImagePickerAsset } from 'expo-image-picker';

export interface Note {
    id: string;
    title: string;
    content: string;
    type: 'note' | 'reminder';
    reminder_at?: number;
    is_pinned?: number;
    audio_uri?: string;
    images?: ImagePickerAsset[];
    is_locked?: number;
    sync_status?: string;
    device_id?: string;
    user_id?: string;
    deleted_at?: number;
    created_at: number;
    updated_at: number;
}

export type CreateNoteDTO = Omit<Note, 'id' | 'created_at' | 'updated_at'>;
export type UpdateNoteDTO = Partial<CreateNoteDTO>;

export type SyncStatus = 'local' | 'pending' | 'synced' | 'failed';
