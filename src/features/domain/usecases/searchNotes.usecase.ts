import { notesRepository } from '../../data/repository/NotesRepositoryImpl';
import { Note } from '../entities/Note';

export const searchNotesUseCase = async (query: string, limit: number, offset: number): Promise<Note[]> => {
    if (!query) return [];
    return await notesRepository.searchNotes(query, limit, offset);
};
