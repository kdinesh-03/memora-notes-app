import { notesRepository } from '../../data/repository/NotesRepositoryImpl';

export const updateNotePositionsUseCase = async (
    positions: { id: string; position: number }[]
): Promise<void> => {
    return await notesRepository.updateNotePositions(positions);
};
