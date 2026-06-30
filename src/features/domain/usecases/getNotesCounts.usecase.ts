import { notesRepository } from '../../data/repository/NotesRepositoryImpl';

export const getNotesCountsUseCase = async (
    searchQuery?: string
): Promise<{ all: number; pinned: number; notes: number; reminders: number; locked: number }> => {
    return await notesRepository.getNotesCounts(searchQuery);
};
