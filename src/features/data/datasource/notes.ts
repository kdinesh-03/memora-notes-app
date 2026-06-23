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
    const row = await db.getFirstAsync<any>('SELECT * FROM notes WHERE id = ?', [id]);
    if (!row) return null;
    return row;
};

export const createNote = async (
    title: string,
    content: string,
    type: 'note' | 'reminder' = 'note',
    reminderAt?: number
): Promise<Note> => {
    const db = await getDb();
    const id = Crypto.randomUUID();
    const now = Date.now();

    const finalReminderAt = type === 'note' ? undefined : reminderAt;

    await db.runAsync(
        `INSERT INTO notes 
   (id, title, content, type, reminder_at, is_pinned, created_at, updated_at) 
   VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
        [id, title, content, type, finalReminderAt ?? null, now, now]
    );

    return {
        id,
        title,
        content,
        type,
        reminder_at: finalReminderAt,
        is_pinned: 0,
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
    isPinned?: number
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

    await db.runAsync(
        `UPDATE notes 
   SET title = ?, content = ?, type = ?, reminder_at = ?, is_pinned = ?, updated_at = ? 
   WHERE id = ?`,
        [
            updatedTitle,
            updatedContent,
            updatedType,
            updatedReminderAt ?? null,
            updatedIsPinned,
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
        updated_at: now,
    };
};

export const deleteNote = async (id: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
};

export const searchNotes = async (
    query: string,
    limit: number,
    offset: number = 0
): Promise<Note[]> => {
    const db = await getDb();

    const searchTerms = query
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 0)
        .map((t) => `${t}*`)
        .join(' ');

    if (!searchTerms) return [];

    const sql = `
    SELECT n.*
    FROM notes n
    JOIN notes_search ON n.rowid = notes_search.rowid
    WHERE notes_search MATCH '${searchTerms}'
    ORDER BY rank
    LIMIT ${limit} OFFSET ${offset}
  `;

    const results = await db.getAllAsync<any>(sql);
    return results;
};

export const getNotesCounts = async (
    searchQuery?: string
): Promise<{ all: number; pinned: number; notes: number; reminders: number }> => {
    const db = await getDb();

    if (searchQuery && searchQuery.trim().length > 0) {
        const searchTerms = searchQuery
            .trim()
            .split(/\s+/)
            .filter((t) => t.length > 0)
            .map((t) => `${t}*`)
            .join(' ');

        if (!searchTerms) {
            return { all: 0, pinned: 0, notes: 0, reminders: 0 };
        }

        const sql = `
      SELECT 
        COUNT(*) as "all",
        COUNT(CASE WHEN n.is_pinned = 1 THEN 1 END) as "pinned",
        COUNT(CASE WHEN n.type = 'note' THEN 1 END) as "notes",
        COUNT(CASE WHEN n.type = 'reminder' THEN 1 END) as "reminders"
      FROM notes n
      JOIN notes_search ON n.rowid = notes_search.rowid
      WHERE notes_search MATCH ?
    `;
        const result = await db.getFirstAsync<any>(sql, [searchTerms]);
        return {
            all: result?.all ?? 0,
            pinned: result?.pinned ?? 0,
            notes: result?.notes ?? 0,
            reminders: result?.reminders ?? 0,
        };
    } else {
        const sql = `
      SELECT 
        COUNT(*) as "all",
        COUNT(CASE WHEN is_pinned = 1 THEN 1 END) as "pinned",
        COUNT(CASE WHEN type = 'note' THEN 1 END) as "notes",
        COUNT(CASE WHEN type = 'reminder' THEN 1 END) as "reminders"
      FROM notes
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
