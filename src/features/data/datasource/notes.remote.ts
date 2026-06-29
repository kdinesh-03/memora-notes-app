import { supabase } from '../../../infrastructure/supabase/supabase';
import { encrypt, decrypt, isEncrypted } from '../../../infrastructure/encryption/encryption';

export interface RemoteNote {
    id: string;
    user_id: string;
    title: string;
    content: string;
    type: string;
    reminder_at: number | null;
    is_pinned: boolean;
    audio_uri: string | null;
    images: any | null;
    is_locked: boolean;
    sync_status: string;
    device_id: string | null;
    created_at: number;
    updated_at: number;
    deleted_at: number | null;
}

export const fetchRemoteNotes = async (userId: string): Promise<RemoteNote[]> => {
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

    if (error) {
        console.log('Error fetching remote notes:', error.message);
        throw error;
    }

    return data ?? [];
};

export const fetchAllRemoteNotes = async (userId: string): Promise<RemoteNote[]> => {
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.log('Error fetching all remote notes:', error.message);
        throw error;
    }

    return data ?? [];
};

export const upsertRemoteNote = async (note: RemoteNote): Promise<void> => {
    // Encrypt content before sending to Supabase
    const encryptedContent = await encrypt(note.content);

    const remoteNote = {
        ...note,
        content: encryptedContent,
        is_pinned: Boolean(note.is_pinned),
        is_locked: Boolean(note.is_locked),
        sync_status: 'synced',
    };

    const { error } = await supabase.from('notes').upsert(remoteNote, { onConflict: 'id' });

    if (error) {
        console.log('Error upserting remote note:', error.message);
        throw error;
    }
};

export const batchUpsertRemoteNotes = async (notes: RemoteNote[]): Promise<void> => {
    if (notes.length === 0) return;

    const encryptedNotes = await Promise.all(
        notes.map(async (note) => {
            const encryptedContent = await encrypt(note.content);
            return {
                ...note,
                content: encryptedContent,
                is_pinned: Boolean(note.is_pinned),
                is_locked: Boolean(note.is_locked),
                sync_status: 'synced',
            };
        })
    );

    const { error } = await supabase.from('notes').upsert(encryptedNotes, { onConflict: 'id' });

    if (error) {
        console.log('Error batch upserting remote notes:', error.message);
        throw error;
    }
};

export const deleteRemoteNote = async (noteId: string): Promise<void> => {
    const { error } = await supabase.from('notes').delete().eq('id', noteId);

    if (error) {
        console.log('Error deleting remote note:', error.message);
        throw error;
    }
};

export const decryptRemoteNote = async (note: RemoteNote): Promise<RemoteNote> => {
    let decryptedContent = note.content;
    if (isEncrypted(note.content)) {
        try {
            decryptedContent = await decrypt(note.content);
        } catch (e) {
            console.log('Failed to decrypt note content:', e);
            decryptedContent = '[Encrypted - unable to decrypt]';
        }
    }

    return {
        ...note,
        content: decryptedContent,
    };
};
