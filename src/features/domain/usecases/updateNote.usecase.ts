import type { ImagePickerAsset } from 'expo-image-picker';
import { notesRepository } from '../../data/repository/NotesRepositoryImpl';
import { Note } from '../entities/Note';

export const updateNoteUseCase = async (
    id: string,
    title?: string,
    content?: string,
    type?: 'note' | 'reminder',
    reminderAt?: number,
    isPinned?: number,
    audioUri?: string[],
    images?: ImagePickerAsset[],
    isLocked?: number
): Promise<Note> => {
    return await notesRepository.updateNote(
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
};
