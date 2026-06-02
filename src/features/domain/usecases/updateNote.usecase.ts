import { notesRepository } from '../../data/repository/NotesRepositoryImpl';
import { Note } from '../entities/Note';

export const updateNoteUseCase = async (
    id: string,
    title?: string,
    content?: string,
    type?: 'note' | 'reminder',
    notify?: boolean,
    reminderAt?: number,
    repeatDays?: string
): Promise<Note> => {
    return await notesRepository.updateNote(id, title, content, type, notify, reminderAt, repeatDays);
};
