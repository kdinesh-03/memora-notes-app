import { notesRepository } from '../../data/repository/NotesRepositoryImpl';
import { Note } from '../entities/Note';

export const createNoteUseCase = async (
    title: string,
    content: string,
    type: 'note' | 'reminder' = 'note',
    reminderAt?: number,
    repeatDays?: string
): Promise<Note> => {
    return await notesRepository.createNote(title, content, type, reminderAt, repeatDays);
};
