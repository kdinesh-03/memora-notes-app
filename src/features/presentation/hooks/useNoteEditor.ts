import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import type { ImagePickerAsset } from 'expo-image-picker';
import { scheduleNoteNotifications, requestNotificationPermissions } from '../../../shared/services/notifications';
import { useStore } from '../../../shared/store/useStore';
import { createNoteUseCase } from '../../domain/usecases/createNote.usecase';
import { getNoteByIdUseCase } from '../../domain/usecases/getNoteById.usecase';
import { updateNoteUseCase } from '../../domain/usecases/updateNote.usecase';
import { Toast } from '../context/ToastProvider';

export const useNoteEditor = (id?: string) => {
    const { addNote, updateNote } = useStore();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [noteType, setNoteType] = useState<'note' | 'reminder'>('note');
    const [reminderAt, setReminderAt] = useState<number | undefined>(undefined);
    const [audioUri, setAudioUri] = useState<string | undefined>(undefined);
    const [images, setImages] = useState<ImagePickerAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const noteIdRef = useRef<string | undefined>(id);

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

            if (noteIdRef.current) {
                const updated = await updateNoteUseCase(
                    noteIdRef.current,
                    title,
                    content,
                    noteType,
                    reminderAt,
                    undefined,
                    audioUri,
                    images
                );
                updateNote(updated);
                await scheduleNoteNotifications(updated);
                Toast.show({
                    message: `${noteType === 'note' ? 'Note' : 'Reminder'} updated successfully`,
                });
            } else {
                const newNote = await createNoteUseCase(title, content, noteType, reminderAt, audioUri, images);
                noteIdRef.current = newNote.id;
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

    return {
        title,
        content,
        noteType,
        reminderAt,
        audioUri,
        setAudioUri,
        images,
        setImages,
        loading,
        saving,
        handleTitleChange,
        handleContentChange,
        toggleType,
        setReminderAt,
        handleSave,
    };
};
