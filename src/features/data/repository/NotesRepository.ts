import { Note } from '../../domain/entities/Note';

export interface INotesRepository {
    getNotes(limit: number, cursor?: number): Promise<Note[]>;
    getNoteById(id: string): Promise<Note | null>;
    createNote(title: string, content: string): Promise<Note>;
    updateNote(id: string, title?: string, content?: string): Promise<Note>;
    deleteNote(id: string): Promise<void>;
    searchNotes(query: string): Promise<Note[]>;
}
