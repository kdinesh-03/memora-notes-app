import * as Crypto from 'expo-crypto';
import { getDb } from '../../../infrastructure/database/sqlite';
import { Note } from '../../domain/entities/Note';
import type { ImagePickerAsset } from 'expo-image-picker';
import { getDeviceId } from '../../../infrastructure/sync/deviceId';
import { encrypt, decrypt, isEncrypted } from '../../../infrastructure/encryption/encryption';
import { mapInIdle } from '../../../shared/utils/idle';

const parseNoteRow = async (row: any): Promise<Note> => {
    let decryptedContent = row.content;
    if (isEncrypted(row.content)) {
        try {
            decryptedContent = await decrypt(row.content);
        } catch (e) {
            console.log('Failed to decrypt local note content:', e);
            decryptedContent = '[Encrypted - unable to decrypt]';
        }
    }

    return {
        ...row,
        content: decryptedContent,
        images: row.images ? JSON.parse(row.images) : undefined,
    };
};

export const getNotes = async (limit: number, cursor?: number): Promise<Note[]> => {
    const db = await getDb();
    let query = 'SELECT * FROM notes WHERE deleted_at IS NULL';
    const params: any[] = [];

    if (cursor) {
        query += ' AND updated_at < ?';
        params.push(cursor);
    }

    query += ' ORDER BY is_pinned DESC, updated_at DESC LIMIT ?';
    params.push(limit);

    const result = await db.getAllAsync<any>(query, ...params);
    return mapInIdle(result, 20, parseNoteRow);
};

export const getNoteById = async (id: string): Promise<Note | null> => {
    const db = await getDb();
    const row = await db.getFirstAsync<any>(
        'SELECT * FROM notes WHERE id = ? AND deleted_at IS NULL',
        [id]
    );
    if (!row) return null;
    return await parseNoteRow(row);
};

export const createNote = async (
    id: string,
    title: string,
    content: string,
    type: 'note' | 'reminder' = 'note',
    reminderAt?: number,
    audioUri?: string,
    images?: ImagePickerAsset[],
    isLocked?: number,
    userId?: string
): Promise<Note> => {
    const db = await getDb();
    const now = Date.now();
    const deviceId = getDeviceId();

    const finalReminderAt = type === 'note' ? undefined : reminderAt;
    const serializedImages = images ? JSON.stringify(images) : null;
    const encryptedContent = await encrypt(content);

    await db.runAsync(
        `INSERT INTO notes 
   (id, title, content, type, reminder_at, is_pinned, audio_uri, images, is_locked, sync_status, device_id, user_id, created_at, updated_at) 
   VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
        [
            id,
            title,
            encryptedContent,
            type,
            finalReminderAt ?? null,
            audioUri ?? null,
            serializedImages,
            isLocked ?? 0,
            deviceId,
            userId ?? null,
            now,
            now,
        ]
    );

    return {
        id,
        title,
        content,
        type,
        reminder_at: finalReminderAt,
        is_pinned: 0,
        audio_uri: audioUri,
        images: images,
        is_locked: isLocked ?? 0,
        sync_status: 'pending',
        device_id: deviceId,
        user_id: userId,
        created_at: now,
        updated_at: now,
    };
};

export const updateNote = async (
    id: string,
    title?: string,
    content?: string,
    type?: 'note' | 'reminder',
    reminderAt?: number,
    isPinned?: number,
    audioUri?: string,
    images?: ImagePickerAsset[],
    isLocked?: number
): Promise<Note> => {
    const db = await getDb();
    const now = Date.now();
    const existing = await getNoteById(id);

    if (!existing) throw new Error('Note not found');

    const updatedTitle = title ?? existing.title;
    const updatedContent = content ?? existing.content;
    const updatedType = type ?? existing.type;
    const updatedReminderAt =
        updatedType === 'note' ? undefined : (reminderAt ?? existing.reminder_at);
    const updatedIsPinned = isPinned ?? existing.is_pinned ?? 0;
    const updatedAudioUri = audioUri !== undefined ? audioUri : existing.audio_uri;
    const updatedImages = images !== undefined ? images : existing.images;
    const updatedIsLocked = isLocked !== undefined ? isLocked : (existing.is_locked ?? 0);
    const serializedImages = updatedImages ? JSON.stringify(updatedImages) : null;
    const encryptedContent = await encrypt(updatedContent);

    await db.runAsync(
        `UPDATE notes 
   SET title = ?, content = ?, type = ?, reminder_at = ?, is_pinned = ?, audio_uri = ?, images = ?, is_locked = ?, sync_status = 'pending', updated_at = ? 
   WHERE id = ?`,
        [
            updatedTitle,
            encryptedContent,
            updatedType,
            updatedReminderAt ?? null,
            updatedIsPinned,
            updatedAudioUri ?? null,
            serializedImages,
            updatedIsLocked,
            now,
            id,
        ]
    );

    return {
        ...existing,
        title: updatedTitle,
        content: updatedContent,
        type: updatedType,
        reminder_at: updatedReminderAt,
        is_pinned: updatedIsPinned,
        audio_uri: updatedAudioUri,
        images: updatedImages,
        is_locked: updatedIsLocked,
        sync_status: 'pending',
        updated_at: now,
    };
};

export const deleteNote = async (id: string): Promise<void> => {
    const db = await getDb();
    const now = Date.now();
    // Soft delete — mark as deleted, set sync_status to pending
    await db.runAsync(
        "UPDATE notes SET deleted_at = ?, sync_status = 'pending', updated_at = ? WHERE id = ?",
        [now, now, id]
    );
};

export const hardDeleteNote = async (id: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
};

export const toggleNoteLock = async (id: string, isLocked: number): Promise<Note> => {
    const db = await getDb();
    const now = Date.now();
    await db.runAsync(
        "UPDATE notes SET is_locked = ?, sync_status = 'pending', updated_at = ? WHERE id = ?",
        [isLocked, now, id]
    );
    const updated = await getNoteById(id);
    if (!updated) throw new Error('Note not found');
    return updated;
};

export const updateSyncStatus = async (id: string, status: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync('UPDATE notes SET sync_status = ? WHERE id = ?', [status, id]);
};

export const getUnsyncedNotes = async (): Promise<Note[]> => {
    const db = await getDb();
    const result = await db.getAllAsync<any>("SELECT * FROM notes WHERE sync_status = 'pending'");
    return mapInIdle(result, 20, parseNoteRow);
};

export const getSoftDeletedNotes = async (): Promise<Note[]> => {
    const db = await getDb();
    const result = await db.getAllAsync<any>(
        "SELECT * FROM notes WHERE deleted_at IS NOT NULL AND sync_status = 'pending'"
    );
    return mapInIdle(result, 20, parseNoteRow);
};

export const upsertNoteFromRemote = async (note: Note): Promise<void> => {
    const db = await getDb();
    const serializedImages = note.images ? JSON.stringify(note.images) : null;
    const encryptedContent = await encrypt(note.content);

    await db.runAsync(
        `INSERT OR REPLACE INTO notes 
   (id, title, content, type, reminder_at, is_pinned, audio_uri, images, is_locked, sync_status, device_id, user_id, deleted_at, created_at, updated_at) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, ?, ?, ?)`,
        [
            note.id,
            note.title,
            encryptedContent,
            note.type,
            note.reminder_at ?? null,
            note.is_pinned ?? 0,
            note.audio_uri ?? null,
            serializedImages,
            note.is_locked ?? 0,
            note.device_id ?? null,
            note.user_id ?? null,
            note.deleted_at ?? null,
            note.created_at,
            note.updated_at,
        ]
    );
};

export const searchNotes = async (
    query: string,
    limit: number,
    offset: number = 0
): Promise<Note[]> => {
    const searchTerms = query.trim().toLowerCase();
    if (!searchTerms) return [];

    // Fallback to JS-level search because SQLite FTS doesn't work on encrypted data
    const allNotes = await getNotes(1000); // Fetch a reasonable amount for local search
    const filtered = allNotes.filter(
        (n) =>
            n.title.toLowerCase().includes(searchTerms) ||
            n.content.toLowerCase().includes(searchTerms)
    );

    return filtered.slice(offset, offset + limit);
};

export const getNotesCounts = async (
    searchQuery?: string
): Promise<{ all: number; pinned: number; notes: number; reminders: number }> => {
    const db = await getDb();

    if (searchQuery && searchQuery.trim().length > 0) {
        const searchTerms = searchQuery.trim().toLowerCase();

        // JS-level filtering since FTS doesn't work with encryption
        const allNotes = await getNotes(1000);
        const filtered = allNotes.filter(
            (n) =>
                n.title.toLowerCase().includes(searchTerms) ||
                n.content.toLowerCase().includes(searchTerms)
        );

        return {
            all: filtered.length,
            pinned: filtered.filter((n) => n.is_pinned === 1).length,
            notes: filtered.filter((n) => n.type === 'note').length,
            reminders: filtered.filter((n) => n.type === 'reminder').length,
        };
    } else {
        const sql = `
      SELECT 
        COUNT(*) as "all",
        COUNT(CASE WHEN is_pinned = 1 THEN 1 END) as "pinned",
        COUNT(CASE WHEN type = 'note' THEN 1 END) as "notes",
        COUNT(CASE WHEN type = 'reminder' THEN 1 END) as "reminders"
      FROM notes
      WHERE deleted_at IS NULL
    `;
        const result = await db.getFirstAsync<any>(sql);
        return {
            all: result?.all ?? 0,
            pinned: result?.pinned ?? 0,
            notes: result?.notes ?? 0,
            reminders: result?.reminders ?? 0,
        };
    }
};
