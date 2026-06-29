import type { ImagePickerAsset } from 'expo-image-picker';
import { Note } from '../../domain/entities/Note';

export interface INotesRepository {
    getNotes(limit: number, cursor?: number): Promise<Note[]>;
    getNoteById(id: string): Promise<Note | null>;
    createNote(
        title: string,
        content: string,
        type: 'note' | 'reminder',
        reminderAt?: number,
        audioUri?: string,
        images?: ImagePickerAsset[],
        isLocked?: number,
        userId?: string
    ): Promise<Note>;
    updateNote(
        id: string,
        title?: string,
        content?: string,
        type?: 'note' | 'reminder',
        reminderAt?: number,
        isPinned?: number,
        audioUri?: string,
        images?: ImagePickerAsset[],
        isLocked?: number
    ): Promise<Note>;
    deleteNote(id: string): Promise<void>;
    searchNotes(query: string, limit: number, offset: number): Promise<Note[]>;
    getNotesCounts(
        searchQuery?: string
    ): Promise<{ all: number; pinned: number; notes: number; reminders: number }>;
    toggleLock(id: string, isLocked: number): Promise<Note>;
    getUnsyncedNotes(): Promise<Note[]>;
}
