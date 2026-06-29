import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { Note } from '../../domain/entities/Note';
import { deleteNoteUseCase } from '../../domain/usecases/deleteNote.usecase';
import { getNotesUseCase } from '../../domain/usecases/getNotes.usecase';
import { searchNotesUseCase } from '../../domain/usecases/searchNotes.usecase';
import { updateNoteUseCase } from '../../domain/usecases/updateNote.usecase';
import { toggleLockUseCase } from '../../domain/usecases/toggleLock.usecase';

import { cancelNoteNotifications } from '../../../shared/services/notifications';
import { Toast } from '@/features/presentation/context/ToastProvider';
import { useAuth } from '../../../shared/store/useAuth';
import { useSync } from '../../../shared/store/useSync';

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
        toggleNoteLock,
    } = useStore();

    const { isAuthenticated, user } = useAuth();
    const { triggerSync, syncStatus } = useSync();

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
        [notes.length, searchQuery, loading, appendNotes, setNotes, setLoading, setHasMore]
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

    const handleToggleLock = async (note: Note) => {
        try {
            const nextLocked = (note.is_locked ?? 0) === 1 ? 0 : 1;
            const updatedNote = await toggleLockUseCase(note.id, nextLocked);
            toggleNoteLock(note.id, nextLocked);
            Toast.show({
                message: nextLocked === 1 ? 'Note locked' : 'Note unlocked',
            });
            return updatedNote;
        } catch (error) {
            console.log('Failed to toggle lock:', error);
            Toast.show({ message: 'Failed to toggle lock' });
            return null;
        }
    };

    // Trigger background sync if authenticated
    const handleSync = useCallback(async () => {
        if (isAuthenticated && user?.id && syncStatus !== 'syncing') {
            try {
                await triggerSync(user.id);
                // Refresh notes after sync
                await fetchNotes(false);
            } catch (error) {
                console.log('Background sync failed:', error);
            }
        }
    }, [isAuthenticated, user?.id, syncStatus, triggerSync, fetchNotes]);

    useEffect(() => {
        searchPageRef.current = 0;
        fetchNotes(false);
    }, [searchQuery]);

    // Trigger sync on mount if authenticated
    useEffect(() => {
        handleSync();
    }, [isAuthenticated]);

    return {
        notes,
        loading,
        onLoadMore,
        handleDelete,
        handleTogglePin,
        handleToggleLock,
        handleSync,
        syncStatus,
    };
};
