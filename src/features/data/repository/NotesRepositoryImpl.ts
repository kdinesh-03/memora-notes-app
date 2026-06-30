import type { ImagePickerAsset } from 'expo-image-picker';
import { Note } from '../../domain/entities/Note';
import {
    createNote,
    deleteNote,
    getNoteById,
    getNotes,
    searchNotes,
    updateNote,
    getNotesCounts,
    toggleNoteLock,
    getUnsyncedNotes,
} from '../datasource/notes';
import { addToSyncQueue } from '../datasource/syncQueue';

export const notesRepository = {
    async getNotes(limit: number, cursor?: number): Promise<Note[]> {
        const notes = await getNotes(limit, cursor);
        return notes;
    },

    async getNoteById(id: string): Promise<Note | null> {
        return await getNoteById(id);
    },

    async createNote(
        id: string,
        title: string,
        content: string,
        type: 'note' | 'reminder',
        reminderAt?: number,
        audioUri?: string,
        images?: ImagePickerAsset[],
        isLocked?: number,
        userId?: string
    ): Promise<Note> {
        const note = await createNote(
            id,
            title,
            content,
            type,
            reminderAt,
            audioUri,
            images,
            isLocked,
            userId
        );
        await addToSyncQueue(note.id, 'create');
        return note;
    },

    async updateNote(
        id: string,
        title?: string,
        content?: string,
        type?: 'note' | 'reminder',
        reminderAt?: number,
        isPinned?: number,
        audioUri?: string,
        images?: ImagePickerAsset[],
        isLocked?: number
    ): Promise<Note> {
        const note = await updateNote(
            id,
            title,
            content,
            type,
            reminderAt,
            isPinned,
            audioUri,
            images,
            isLocked
        );
        await addToSyncQueue(note.id, 'update');
        return note;
    },

    async deleteNote(id: string): Promise<void> {
        await deleteNote(id);
        await addToSyncQueue(id, 'delete');
    },

    async searchNotes(query: string, limit: number, offset: number): Promise<Note[]> {
        return await searchNotes(query, limit, offset);
    },

    async getNotesCounts(
        searchQuery?: string
    ): Promise<{ all: number; pinned: number; notes: number; reminders: number; locked: number }> {
        return await getNotesCounts(searchQuery);
    },

    async toggleLock(id: string, isLocked: number): Promise<Note> {
        const note = await toggleNoteLock(id, isLocked);
        await addToSyncQueue(id, 'update');
        return note;
    },

    async getUnsyncedNotes(): Promise<Note[]> {
        return await getUnsyncedNotes();
    },
};
