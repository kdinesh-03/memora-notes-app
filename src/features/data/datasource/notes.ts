import * as Crypto from 'expo-crypto';
import { getDb } from '../../../infrastructure/database/sqlite';
import { Note } from '../../domain/entities/Note';

export const getNotes = async (limit: number, cursor?: number): Promise<Note[]> => {
    const db = await getDb();
    let query = 'SELECT * FROM notes';
    const params: any[] = [];

    if (cursor) {
        query += ' WHERE updated_at < ?';
        params.push(cursor);
    }

    query += ' ORDER BY is_pinned DESC, updated_at DESC LIMIT ?';
    params.push(limit);

    const result = await db.getAllAsync<any>(query, ...params);
    return result;
};

export const getNoteById = async (id: string): Promise<Note | null> => {
    const db = await getDb();
    const row = await db.getFirstAsync<any>('SELECT * FROM notes WHERE id = ?', id);
    if (!row) return null;
    return row;
};

export const createNote = async (
    title: string,
    content: string,
    type: 'note' | 'reminder' = 'note',
    reminderAt?: number,
    repeatDays?: string
): Promise<Note> => {
    const db = await getDb();
    const id = Crypto.randomUUID();
    const now = Date.now();

    const finalReminderAt = type === 'note' ? undefined : reminderAt;
    const finalRepeatDays = type === 'note' ? undefined : repeatDays;

    await db.runAsync(
        'INSERT INTO notes (id, title, content, type, reminder_at, repeat_days, is_pinned, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)',
        id,
        title,
        content,
        type,
        finalReminderAt ?? null,
        finalRepeatDays ?? null,
        now,
        now
    );

    return { id, title, content, type, reminder_at: finalReminderAt, repeat_days: finalRepeatDays, is_pinned: 0, position: 0, created_at: now, updated_at: now };
};

export const updateNote = async (
    id: string,
    title?: string,
    content?: string,
    type?: 'note' | 'reminder',
    reminderAt?: number,
    repeatDays?: string,
    isPinned?: number,
    position?: number
): Promise<Note> => {
    const db = await getDb();
    const now = Date.now();
    const existing = await getNoteById(id);

    if (!existing) throw new Error('Note not found');

    const updatedTitle = title ?? existing.title;
    const updatedContent = content ?? existing.content;
    const updatedType = type ?? existing.type;
    const updatedReminderAt = updatedType === 'note' ? undefined : (reminderAt ?? existing.reminder_at);
    const updatedRepeatDays = updatedType === 'note' ? undefined : (repeatDays ?? existing.repeat_days);
    const updatedIsPinned = isPinned ?? (existing.is_pinned ?? 0);
    const updatedPosition = position ?? (existing.position ?? 0);

    await db.runAsync(
        'UPDATE notes SET title = ?, content = ?, type = ?, reminder_at = ?, repeat_days = ?, is_pinned = ?, position = ?, updated_at = ? WHERE id = ?',
        updatedTitle,
        updatedContent,
        updatedType,
        updatedReminderAt ?? null,
        updatedRepeatDays ?? null,
        updatedIsPinned,
        updatedPosition,
        now,
        id
    );

    return {
        ...existing,
        title: updatedTitle,
        content: updatedContent,
        type: updatedType,
        reminder_at: updatedReminderAt,
        repeat_days: updatedRepeatDays,
        is_pinned: updatedIsPinned,
        position: updatedPosition,
        updated_at: now
    };
};

export const updateNotePositions = async (positions: { id: string; position: number }[]): Promise<void> => {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
        for (const item of positions) {
            await db.runAsync('UPDATE notes SET position = ? WHERE id = ?', item.position, item.id);
        }
    });
};

export const deleteNote = async (id: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync('DELETE FROM notes WHERE id = ?', id);
};

export const searchNotes = async (query: string, limit: number, offset: number = 0): Promise<Note[]> => {
    const db = await getDb();

    // Process query for FTS5: split words and add * for prefix search on each
    const searchTerms = query.trim().split(/\s+/).filter(t => t.length > 0).map(t => `${t}*`).join(' ');

    if (!searchTerms) return [];

    const results = await db.getAllAsync<any>(
        `SELECT n.*
         FROM notes n
         JOIN notes_search ON n.rowid = notes_search.rowid
         WHERE notes_search MATCH ?
         ORDER BY notes_search.rank
         LIMIT ? OFFSET ?`,
        searchTerms,
        limit,
        offset
    );

    return results;
};
