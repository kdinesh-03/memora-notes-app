import { Note } from '../../features/domain/entities/Note';
import {
    getNoteById,
    getUnsyncedNotes,
    getSoftDeletedNotes,
    updateSyncStatus,
    upsertNoteFromRemote,
    hardDeleteNote,
} from '../../features/data/datasource/notes';
import {
    RemoteNote,
    fetchAllRemoteNotes,
    upsertRemoteNote,
    deleteRemoteNote,
    decryptRemoteNote,
} from '../../features/data/datasource/notes.remote';
import {
    getPendingItems,
    markProcessing,
    markCompleted,
    markFailed,
} from '../../features/data/datasource/syncQueue';
import { getDeviceId } from './deviceId';

export interface SyncResult {
    pushed: number;
    pulled: number;
    failed: number;
    conflicts: number;
}

/**
 * Convert a local Note to a RemoteNote format for Supabase.
 */
const toRemoteNote = (note: Note, userId: string): RemoteNote => ({
    id: note.id,
    user_id: userId,
    title: note.title,
    content: note.content,
    type: note.type,
    reminder_at: note.reminder_at ?? null,
    is_pinned: Boolean(note.is_pinned),
    audio_uri: note.audio_uri ?? null,
    images: note.images ?? null,
    is_locked: Boolean(note.is_locked),
    sync_status: 'synced',
    device_id: note.device_id ?? getDeviceId(),
    created_at: note.created_at,
    updated_at: note.updated_at,
    deleted_at: note.deleted_at ?? null,
});

/**
 * Convert a RemoteNote to a local Note format.
 */
const toLocalNote = (remote: RemoteNote): Note => ({
    id: remote.id,
    title: remote.title,
    content: remote.content,
    type: remote.type as 'note' | 'reminder',
    reminder_at: remote.reminder_at ?? undefined,
    is_pinned: remote.is_pinned ? 1 : 0,
    audio_uri: remote.audio_uri ?? undefined,
    images: remote.images ?? undefined,
    is_locked: remote.is_locked ? 1 : 0,
    sync_status: 'synced',
    device_id: remote.device_id ?? undefined,
    user_id: remote.user_id,
    deleted_at: remote.deleted_at ?? undefined,
    created_at: remote.created_at,
    updated_at: remote.updated_at,
});

/**
 * Push local pending changes to Supabase.
 */
export const pushChanges = async (userId: string): Promise<{ pushed: number; failed: number }> => {
    let pushed = 0;
    let failed = 0;

    // Push soft-deleted notes
    const deletedNotes = await getSoftDeletedNotes();
    for (const note of deletedNotes) {
        try {
            await deleteRemoteNote(note.id);
            await hardDeleteNote(note.id);
            pushed++;
        } catch (error) {
            console.log(`Failed to sync deleted note ${note.id}:`, error);
            failed++;
        }
    }

    // Push unsynced notes (created/updated)
    const unsyncedNotes = await getUnsyncedNotes();
    for (const note of unsyncedNotes) {
        try {
            const remoteNote = toRemoteNote(note, userId);
            await upsertRemoteNote(remoteNote);
            await updateSyncStatus(note.id, 'synced');
            pushed++;
        } catch (error) {
            console.log(`Failed to sync note ${note.id}:`, error);
            await updateSyncStatus(note.id, 'failed');
            failed++;
        }
    }

    // Process sync queue items
    const queueItems = await getPendingItems();
    for (const item of queueItems) {
        try {
            await markProcessing(item.id);

            if (item.action === 'delete') {
                await deleteRemoteNote(item.entity_id);
                await hardDeleteNote(item.entity_id);
            } else {
                const note = await getNoteById(item.entity_id);
                if (note) {
                    const remoteNote = toRemoteNote(note, userId);
                    await upsertRemoteNote(remoteNote);
                    await updateSyncStatus(note.id, 'synced');
                }
            }

            await markCompleted(item.id);
            pushed++;
        } catch (error) {
            console.log(`Failed to process queue item ${item.id}:`, error);
            await markFailed(item.id);
            failed++;
        }
    }

    return { pushed, failed };
};

/**
 * Pull remote notes and merge with local DB.
 * Conflict resolution: latest updated_at wins.
 */
export const pullChanges = async (
    userId: string
): Promise<{ pulled: number; conflicts: number }> => {
    let pulled = 0;
    let conflicts = 0;

    try {
        const remoteNotes = await fetchAllRemoteNotes(userId);

        for (const remoteNote of remoteNotes) {
            try {
                // Decrypt remote note content
                const decrypted = await decryptRemoteNote(remoteNote);
                const localNote = await getNoteById(remoteNote.id);

                if (!localNote) {
                    // Note doesn't exist locally — insert it
                    if (!remoteNote.deleted_at) {
                        const local = toLocalNote(decrypted);
                        await upsertNoteFromRemote(local);
                        pulled++;
                    }
                } else {
                    // Conflict resolution: latest updated_at wins
                    if (remoteNote.updated_at > localNote.updated_at) {
                        if (remoteNote.deleted_at) {
                            await hardDeleteNote(localNote.id);
                        } else {
                            const local = toLocalNote(decrypted);
                            await upsertNoteFromRemote(local);
                        }
                        pulled++;
                        conflicts++;
                    }
                    // If local is newer, it will be pushed during pushChanges
                }
            } catch (error) {
                console.log(`Failed to process remote note ${remoteNote.id}:`, error);
            }
        }
    } catch (error) {
        console.log('Failed to pull remote notes:', error);
        throw error;
    }

    return { pulled, conflicts };
};

/**
 * Full sync: pull remote changes, then push local changes.
 */
export const startSync = async (userId: string): Promise<SyncResult> => {
    console.log('Starting sync...');

    // Pull first, then push (to avoid pushing stale data)
    const pushResult = await pushChanges(userId);
    const pullResult = await pullChanges(userId);

    const result: SyncResult = {
        pushed: pushResult.pushed,
        pulled: pullResult.pulled,
        failed: pushResult.failed,
        conflicts: pullResult.conflicts,
    };

    console.log('Sync complete:', result);
    return result;
};

/**
 * Initial sync: push all existing local notes to Supabase for the first time.
 */
export const initialSync = async (userId: string): Promise<void> => {
    const unsyncedNotes = await getUnsyncedNotes();

    for (const note of unsyncedNotes) {
        try {
            const remoteNote = toRemoteNote(note, userId);
            await upsertRemoteNote(remoteNote);
            await updateSyncStatus(note.id, 'synced');
        } catch (error) {
            console.log(`Failed to initial sync note ${note.id}:`, error);
        }
    }
};
