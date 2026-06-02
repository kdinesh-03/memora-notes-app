import { notesRepository } from '../../data/repository/NotesRepositoryImpl';
import { Note } from '../entities/Note';

export const getNoteByIdUseCase = async (id: string): Promise<Note | null> => {
    return await notesRepository.getNoteById(id);
};
