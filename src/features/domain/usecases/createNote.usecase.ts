import type { ImagePickerAsset } from 'expo-image-picker';
import { notesRepository } from '../../data/repository/NotesRepositoryImpl';
import { Note } from '../entities/Note';

export const createNoteUseCase = async (
    id: string,
    title: string,
    content: string,
    type: 'note' | 'reminder' = 'note',
    reminderAt?: number,
    audioUri?: string[],
    images?: ImagePickerAsset[],
    isLocked?: number,
    userId?: string
): Promise<Note> => {
    return await notesRepository.createNote(
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
};
