import { Note } from '../../domain/entities/Note';

export interface INotesRepository {
    getNotes(limit: number, cursor?: number): Promise<Note[]>;
    getNoteById(id: string): Promise<Note | null>;
    createNote(
        title: string,
        content: string,
        type: 'note' | 'reminder',
        reminderAt?: number
    ): Promise<Note>;
    updateNote(
        id: string,
        title?: string,
        content?: string,
        type?: 'note' | 'reminder',
        reminderAt?: number,
        isPinned?: number
    ): Promise<Note>;
    deleteNote(id: string): Promise<void>;
    searchNotes(query: string, limit: number, offset: number): Promise<Note[]>;
    getNotesCounts(searchQuery?: string): Promise<{ all: number; pinned: number; notes: number; reminders: number }>;
}
