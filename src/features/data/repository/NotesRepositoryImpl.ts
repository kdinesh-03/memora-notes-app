import { Note } from '../../domain/entities/Note';
import {
    createNote,
    deleteNote,
    getNoteById,
    getNotes,
    searchNotes,
    updateNote,
    getNotesCounts,
} from '../datasource/notes';

export const notesRepository = {
    async getNotes(limit: number, cursor?: number): Promise<Note[]> {
        const notes = await getNotes(limit, cursor);
        return notes;
    },

    async getNoteById(id: string): Promise<Note | null> {
        return await getNoteById(id);
    },

    async createNote(
        title: string,
        content: string,
        type: 'note' | 'reminder',
        reminderAt?: number
    ): Promise<Note> {
        return await createNote(title, content, type, reminderAt);
    },

    async updateNote(
        id: string,
        title?: string,
        content?: string,
        type?: 'note' | 'reminder',
        reminderAt?: number,
        isPinned?: number
    ): Promise<Note> {
        return await updateNote(id, title, content, type, reminderAt, isPinned);
    },

    async deleteNote(id: string): Promise<void> {
        return await deleteNote(id);
    },

    async searchNotes(query: string, limit: number, offset: number): Promise<Note[]> {
        return await searchNotes(query, limit, offset);
    },

    async getNotesCounts(searchQuery?: string): Promise<{ all: number; pinned: number; notes: number; reminders: number }> {
        return await getNotesCounts(searchQuery);
    },
};
