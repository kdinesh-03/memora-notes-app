import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { requestNotificationPermissions, scheduleNoteNotifications } from '../../../shared/services/notifications';
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
    const [repeatDays, setRepeatDays] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isRepeatDaysModified, setIsRepeatDaysModified] = useState(false);
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
                    setRepeatDays(note.repeat_days);
                    setIsRepeatDaysModified(true);
                }
                setLoading(false);
            });
        }
    }, [id]);

    useEffect(() => {
        if (noteType === 'reminder' && reminderAt && !loading && !isRepeatDaysModified) {
            const date = new Date(reminderAt);
            const dayIndex = date.getDay();
            const chars = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            const days = Array(7).fill('-');
            days[dayIndex] = chars[dayIndex];
            setRepeatDays(days.join(''));
        }
    }, [reminderAt, noteType, loading, isRepeatDaysModified]);

    const handleSave = async () => {
        if (!title.trim() && !content.trim()) return;

        setSaving(true);
        try {
            if (noteType === 'reminder' && !reminderAt) {
                Toast.show({ message: 'Please select a date and time for the reminder' });
                setSaving(false);
                return;
            }

            if (noteIdRef.current) {
                const updated = await updateNoteUseCase(noteIdRef.current, title, content, noteType, reminderAt, repeatDays);
                updateNote(updated);
                await scheduleNoteNotifications(updated);
                Toast.show({ message: `${noteType === 'note' ? 'Note' : 'Reminder'} updated successfully` });
            } else {
                const newNote = await createNoteUseCase(title, content, noteType, reminderAt, repeatDays);
                noteIdRef.current = newNote.id;
                addNote(newNote);
                await scheduleNoteNotifications(newNote);
                Toast.show({ message: `${noteType === 'note' ? 'Note' : 'Reminder'} created successfully` });
            }
            router.back();
        } catch (error) {
            console.error('Failed to save note:', error);
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
        setNoteType(prev => {
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

    const toggleRepeatDay = (dayIndex: number) => {
        setIsRepeatDaysModified(true);
        setRepeatDays(prev => {
            const days = prev ? prev.split('') : '-------'.split('');
            const chars = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            if (days[dayIndex] === '-') {
                days[dayIndex] = chars[dayIndex];
            } else {
                days[dayIndex] = '-';
            }
            return days.join('');
        });
    };

    return {
        title,
        content,
        noteType,
        reminderAt,
        repeatDays,
        loading,
        saving,
        handleTitleChange,
        handleContentChange,
        toggleType,
        toggleRepeatDay,
        setReminderAt,
        handleSave,
    };
};
