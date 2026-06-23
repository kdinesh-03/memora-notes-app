import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { Note } from '../../domain/entities/Note';
import { deleteNoteUseCase } from '../../domain/usecases/deleteNote.usecase';
import { getNotesUseCase } from '../../domain/usecases/getNotes.usecase';
import { searchNotesUseCase } from '../../domain/usecases/searchNotes.usecase';
import { updateNoteUseCase } from '../../domain/usecases/updateNote.usecase';

import { cancelNoteNotifications } from '../../../shared/services/notifications';
import { Toast } from '../context/ToastProvider';

const PAGE_SIZE = 20;

export const useNotes = () => {
    const {
        notes,
        loading,
        hasMore,
        searchQuery,
        setNotes,
        appendNotes,
        setLoading,
        setHasMore,
        removeNote,
        updateNote,
    } = useStore();

    const searchPageRef = useRef(0);

    const fetchNotes = useCallback(
        async (isNextPage = false) => {
            if (isNextPage && loading) return;

            const currentQuery = useStore.getState().searchQuery.trim();

            setLoading(true);
            try {
                let result: Note[];
                if (currentQuery) {
                    const offset = isNextPage ? (searchPageRef.current + 1) * PAGE_SIZE : 0;
                    result = await searchNotesUseCase(currentQuery, PAGE_SIZE, offset);

                    if (currentQuery !== useStore.getState().searchQuery) return;

                    if (isNextPage) {
                        searchPageRef.current += 1;
                    } else {
                        searchPageRef.current = 0;
                    }
                    setHasMore(result.length === PAGE_SIZE);
                } else {
                    const cursor =
                        isNextPage && notes.length > 0
                            ? notes[notes.length - 1].updated_at
                            : undefined;

                    result = await getNotesUseCase(PAGE_SIZE, cursor);

                    if (useStore.getState().searchQuery !== '') return;

                    setHasMore(result.length === PAGE_SIZE);
                }

                if (isNextPage) {
                    appendNotes(result);
                } else {
                    setNotes(result);
                }
            } catch (error) {
                console.log('Failed to fetch notes:', error);
            } finally {
                setLoading(false);
            }
        },
        [
            notes.length,
            searchQuery,
            loading,
            appendNotes,
            setNotes,
            setLoading,
            setHasMore,
        ]
    );

    const onLoadMore = () => {
        if (hasMore && !loading) {
            fetchNotes(true);
        }
    };

    const handleDelete = async (id: string, noteType: 'note' | 'reminder') => {
        try {
            await deleteNoteUseCase(id);
            removeNote(id);
            await cancelNoteNotifications(id);
            Toast.show({
                message: `${noteType === 'note' ? 'Note' : 'Reminder'} deleted successfully`,
            });
        } catch (error) {
            console.log('Failed to delete note:', error);
            Toast.show({
                message: `Failed to delete ${noteType === 'note' ? 'Note' : 'Reminder'}`,
            });
        }
    };

    const handleTogglePin = async (note: Note) => {
        try {
            const nextPinned = (note.is_pinned ?? 0) === 1 ? 0 : 1;
            const updatedNote = await updateNoteUseCase(
                note.id,
                undefined,
                undefined,
                undefined,
                undefined,
                nextPinned
            );
            updateNote(updatedNote);
            Toast.show({ message: nextPinned === 1 ? 'Note pinned' : 'Note unpinned' });
        } catch (error) {
            console.log('Failed to toggle pin:', error);
            Toast.show({ message: 'Failed to toggle pin' });
        }
    };

    useEffect(() => {
        searchPageRef.current = 0;
        fetchNotes(false);
    }, [searchQuery]);

    return {
        notes,
        loading,
        onLoadMore,
        handleDelete,
        handleTogglePin,
    };
};
