import { notesRepository } from '../../data/repository/NotesRepositoryImpl';
import { Note } from '../entities/Note';

export const getNotesUseCase = async (limit: number, cursor?: number): Promise<Note[]> => {
    return await notesRepository.getNotes(limit, cursor);
};
