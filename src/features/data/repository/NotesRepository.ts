import { Note } from '../../domain/entities/Note';

export interface INotesRepository {
    getNotes(limit: number, cursor?: number): Promise<Note[]>;
    getNoteById(id: string): Promise<Note | null>;
    createNote(title: string, content: string, type: 'note' | 'reminder', reminderAt?: number, repeatDays?: string): Promise<Note>;
    updateNote(id: string, title?: string, content?: string, type?: 'note' | 'reminder', reminderAt?: number, repeatDays?: string, isPinned?: number, position?: number): Promise<Note>;
    updateNotePositions(positions: { id: string; position: number }[]): Promise<void>;
    deleteNote(id: string): Promise<void>;
    searchNotes(query: string, limit: number, offset: number): Promise<Note[]>;
}
