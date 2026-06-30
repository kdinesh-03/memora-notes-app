import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import type { ImagePickerAsset } from 'expo-image-picker';
import {
    scheduleNoteNotifications,
    requestNotificationPermissions,
} from '../../../shared/services/notifications';
import { createNoteUseCase } from '../../domain/usecases/createNote.usecase';
import { getNoteByIdUseCase } from '../../domain/usecases/getNoteById.usecase';
import { updateNoteUseCase } from '../../domain/usecases/updateNote.usecase';
import { toggleLockUseCase } from '../../domain/usecases/toggleLock.usecase';
import { Toast } from '@/features/presentation/context/ToastProvider';
import { useAuth } from '../../../shared/store/useAuth';
import * as Crypto from 'expo-crypto';
import { useNoteStore } from '@/shared/store/useNoteStore';

export const useNoteEditor = (id?: string) => {
    const { addNote, updateNote, toggleNoteLock } = useNoteStore();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [noteType, setNoteType] = useState<'note' | 'reminder'>('note');
    const [reminderAt, setReminderAt] = useState<number | undefined>(undefined);
    const [audioUri, setAudioUri] = useState<string | undefined>(undefined);
    const [images, setImages] = useState<ImagePickerAsset[]>([]);
    const [isLocked, setIsLocked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const noteIdRef = useRef<string>(id || Crypto.randomUUID());

    useEffect(() => {
        if (id) {
            setLoading(true);
            getNoteByIdUseCase(id).then((note) => {
                if (note) {
                    setTitle(note.title);
                    setContent(note.content);
                    setNoteType(note.type);
                    setReminderAt(note.reminder_at);
                    setAudioUri(note.audio_uri);
                    setImages(note.images || []);
                    setIsLocked(note.is_locked === 1);
                }
                setLoading(false);
            });
        }
    }, [id]);

    const handleSave = async () => {
        if (!title.trim() && !content.trim() && !audioUri && images.length === 0) return;

        setSaving(true);
        try {
            if (noteType === 'reminder') {
                if (!reminderAt) {
                    Toast.show({ message: 'Please select a date and time for the reminder' });
                    setSaving(false);
                    return;
                }
                const hasPermission = await requestNotificationPermissions();
                if (!hasPermission) {
                    Toast.show({ message: 'Notification permission is required to set reminders' });
                    setSaving(false);
                    return;
                }
            }

            if (id) {
                const updated = await updateNoteUseCase(
                    noteIdRef.current,
                    title,
                    content,
                    noteType,
                    reminderAt,
                    undefined,
                    audioUri,
                    images,
                    isLocked ? 1 : 0
                );
                updateNote(updated);
                await scheduleNoteNotifications(updated);
                Toast.show({
                    message: `${noteType === 'note' ? 'Note' : 'Reminder'} updated successfully`,
                });
            } else {
                const newNote = await createNoteUseCase(
                    noteIdRef.current,
                    title,
                    content,
                    noteType,
                    reminderAt,
                    audioUri,
                    images,
                    isLocked ? 1 : 0,
                    user?.id
                );
                addNote(newNote);
                await scheduleNoteNotifications(newNote);
                Toast.show({
                    message: `${noteType === 'note' ? 'Note' : 'Reminder'} created successfully`,
                });
            }
            router.back();
        } catch (error) {
            console.log('Failed to save note:', error);
            Toast.show({ message: `Failed to save ${noteType === 'note' ? 'Note' : 'Reminder'}` });
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (text: string) => {
        setTitle(text);
    };

    const handleContentChange = (text: string) => {
        setContent(text);
    };

    const toggleType = () => {
        setNoteType((prev) => {
            const newType = prev === 'note' ? 'reminder' : 'note';
            if (newType === 'reminder' && !reminderAt) {
                const now = new Date();
                now.setSeconds(0);
                now.setMilliseconds(0);
                setReminderAt(now.getTime());
            }
            return newType;
        });
    };

    const handleToggleLock = async () => {
        if (id) {
            try {
                const nextLocked = isLocked ? 0 : 1;
                await toggleLockUseCase(noteIdRef.current, nextLocked);
                toggleNoteLock(noteIdRef.current, nextLocked);
                setIsLocked(!isLocked);
                Toast.show({ message: !isLocked ? 'Note locked' : 'Note unlocked' });
            } catch (error) {
                console.log('Failed to toggle lock:', error);
                Toast.show({ message: 'Failed to toggle lock' });
            }
        } else {
            setIsLocked(!isLocked);
            Toast.show({ message: !isLocked ? 'Note locked' : 'Note unlocked' });
        }
    };

    return {
        title,
        content,
        noteType,
        reminderAt,
        audioUri,
        setAudioUri,
        images,
        setImages,
        isLocked,
        loading,
        saving,
        handleTitleChange,
        handleContentChange,
        toggleType,
        setReminderAt,
        handleSave,
        handleToggleLock,
        noteId: noteIdRef.current,
    };
};
