import type { ImagePickerAsset } from 'expo-image-picker';
import { notesRepository } from '../../data/repository/NotesRepositoryImpl';
import { Note } from '../entities/Note';

export const createNoteUseCase = async (
    title: string,
    content: string,
    type: 'note' | 'reminder' = 'note',
    reminderAt?: number,
    audioUri?: string,
    images?: ImagePickerAsset[]
): Promise<Note> => {
    return await notesRepository.createNote(title, content, type, reminderAt, audioUri, images);
};
