import { notesRepository } from '../../data/repository/NotesRepositoryImpl';

export const toggleLockUseCase = async (id: string, isLocked: number) => {
    return notesRepository.toggleLock(id, isLocked);
};
