import { deleteNote } from '../../data/datasource/notes';

export const deleteNoteUseCase = async (id: string): Promise<void> => {
    return await deleteNote(id);
};
