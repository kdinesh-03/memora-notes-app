import { notesRepository } from '../../data/repository/NotesRepositoryImpl';
import { Note } from '../entities/Note';

export const createNoteUseCase = async (
    title: string,
    content: string,
    type: 'note' | 'reminder' = 'note',
    notify: boolean = false,
    reminderAt?: number,
    repeatDays?: string
): Promise<Note> => {
    return await notesRepository.createNote(title, content, type, notify, reminderAt, repeatDays);
};
