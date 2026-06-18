import { notesRepository } from '../../data/repository/NotesRepositoryImpl';
import { Note } from '../entities/Note';

export const updateNoteUseCase = async (
    id: string,
    title?: string,
    content?: string,
    type?: 'note' | 'reminder',
    reminderAt?: number,
    repeatDays?: string,
    isPinned?: number,
    position?: number
): Promise<Note> => {
    return await notesRepository.updateNote(id, title, content, type, reminderAt, repeatDays, isPinned, position);
};
