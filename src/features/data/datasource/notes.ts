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

    query += ' ORDER BY updated_at DESC LIMIT ?';
    params.push(limit);

    const result = await db.getAllAsync<any>(query, ...params);
    return result.map(row => ({
        ...row,
        notify: !!row.notify
    }));
};

export const getNoteById = async (id: string): Promise<Note | null> => {
    const db = await getDb();
    const row = await db.getFirstAsync<any>('SELECT * FROM notes WHERE id = ?', id);
    if (!row) return null;
    return {
        ...row,
        notify: !!row.notify
    };
};

export const createNote = async (
    title: string,
    content: string,
    type: 'note' | 'reminder' = 'note',
    notify: boolean = false,
    reminderAt?: number,
    repeatDays?: string
): Promise<Note> => {
    const db = await getDb();
    const id = Crypto.randomUUID();
    const now = Date.now();
    const notifyVal = notify ? 1 : 0;

    await db.runAsync(
        'INSERT INTO notes (id, title, content, type, notify, reminder_at, repeat_days, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        id,
        title,
        content,
        type,
        notifyVal,
        reminderAt ?? null,
        repeatDays ?? null,
        now,
        now
    );

    return { id, title, content, type, notify, reminder_at: reminderAt, repeat_days: repeatDays, created_at: now, updated_at: now };
};

export const updateNote = async (
    id: string,
    title?: string,
    content?: string,
    type?: 'note' | 'reminder',
    notify?: boolean,
    reminderAt?: number,
    repeatDays?: string
): Promise<Note> => {
    const db = await getDb();
    const now = Date.now();
    const existing = await getNoteById(id);

    if (!existing) throw new Error('Note not found');

    const updatedTitle = title ?? existing.title;
    const updatedContent = content ?? existing.content;
    const updatedType = type ?? existing.type;
    const updatedNotify = notify ?? existing.notify;
    const updatedReminderAt = reminderAt ?? existing.reminder_at;
    const updatedRepeatDays = repeatDays ?? existing.repeat_days;
    const notifyVal = updatedNotify ? 1 : 0;

    await db.runAsync(
        'UPDATE notes SET title = ?, content = ?, type = ?, notify = ?, reminder_at = ?, repeat_days = ?, updated_at = ? WHERE id = ?',
        updatedTitle,
        updatedContent,
        updatedType,
        notifyVal,
        updatedReminderAt ?? null,
        updatedRepeatDays ?? null,
        now,
        id
    );

    return {
        ...existing,
        title: updatedTitle,
        content: updatedContent,
        type: updatedType,
        notify: updatedNotify,
        reminder_at: updatedReminderAt,
        repeat_days: updatedRepeatDays,
        updated_at: now
    };
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

    return results.map(row => ({
        ...row,
        notify: !!row.notify
    }));
};
