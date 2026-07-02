import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar, ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNoteEditor } from '../hooks/useNoteEditor';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import * as Haptics from 'expo-haptics';
import Actions from '../components/editor/Actions';
import ImageCollage from '../components/editor/ImageCollage';
import { VoiceRecorder } from '../components/editor/VoiceRecorder';
import { VoicePlayer } from '../components/editor/VoicePlayer';
import PinModal from '../components/shared/PinModal';
import { hasPin, setupPin } from '../hooks/useLockNote';
import { useColors } from '@/shared/theme/colors';
import { styles } from '../styles/NoteEditorScreen.styles';
import { deleteAudio, deleteImages } from '@/infrastructure/supabase/storage';
import { useAuth } from '@/shared/store/useAuth';

export const NoteEditorScreen = () => {
    const colors = useColors();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const {
        title,
        content,
        noteType,
        reminderAt,
        audioUri,
        setAudioUri,
        images,
        setImages,
        handleTitleChange,
        handleContentChange,
        toggleType,
        setReminderAt,
        loading,
        saving,
        handleSave,
        isLocked,
        handleToggleLock,
        noteId,
    } = useNoteEditor(id);

    const { isRecording, duration, start, stop, cancel, handlePermission } = useAudioRecorder();

    const { user } = useAuth();

    const { bottom, top } = useSafeAreaInsets();

    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    const [pinModalVisible, setPinModalVisible] = useState(false);

    const handleRecordVoiceNote = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await handlePermission();
        if (isRecording) {
            const uri = await stop();
            if (uri) {
                setAudioUri((prev) => [...prev, uri]);
            }
        } else {
            await start();
        }
    };

    const handleDiscardRecording = async () => {
        if (isRecording) {
            await cancel();
        }
    };

    const handleDeleteRecording = async (index: number) => {
        const uri = audioUri[index];
        if (uri?.startsWith('http') && user?.id) {
            const ext = uri.split('.').pop() || 'm4a';
            const path = `${user.id}/${noteId}/${index}.${ext}`;
            await deleteAudio(path);
        }
        setAudioUri((prev) => prev.filter((_, i) => i !== index));
    };

    const handleLockPress = async () => {
        const pinExists = await hasPin(noteId);
        if (!pinExists) {
            setPinModalVisible(true);
        } else {
            await handleToggleLock();
        }
    };

    useEffect(() => {
        if (noteType === 'note') {
            setShowPicker(false);
            setPickerMode('date');
        }
    }, [noteType]);

    const formatDateTime = (timestamp?: number) => {
        if (!timestamp) return 'Select Date & Time';
        const date = new Date(timestamp);
        const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const timeStr = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        return `${dateStr}, ${timeStr.toUpperCase()}`;
    };

    const handleNoteType = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        toggleType();
    };

    if (loading) {
        return (
            <View
                style={[styles.container, styles.centered, { backgroundColor: colors.background }]}
            >
                <ActivityIndicator size={20} color={colors.accent} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: colors.background },
                    { paddingTop: top, paddingBottom: bottom },
                ]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <Pressable onPress={router.back} style={styles.backButton}>
                            <ChevronLeft color={colors.text} size={25} />
                            <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
                        </Pressable>
                    </View>

                    <Actions
                        handleNoteType={handleNoteType}
                        noteType={noteType}
                        handleImage={(assets) => {
                            setImages((prev) => {
                                const newImages = [...prev, ...assets];
                                return newImages.slice(0, 5);
                            });
                        }}
                        handleLock={handleLockPress}
                        isLocked={isLocked}
                        isRecording={isRecording}
                        recordingDuration={duration}
                        onRecordVoiceNote={handleRecordVoiceNote}
                        audioUri={audioUri}
                    />

                    <View style={{ flex: 1, paddingHorizontal: 16 }}>
                        <View>
                            <TextInput
                                placeholder="Title"
                                placeholderTextColor={colors.textTertiary}
                                style={[styles.titleInput, { color: colors.text }]}
                                value={title}
                                onChangeText={handleTitleChange}
                                multiline
                                autoFocus
                                autoCorrect
                            />
                        </View>

                        {images.length > 0 && (
                            <ImageCollage
                                images={images}
                                onRemoveImage={async (index) => {
                                    const img = images[index];
                                    if (img?.uri?.startsWith('http') && user?.id) {
                                        const ext = img.uri.split('.').pop() || 'jpg';
                                        const path = `${user.id}/${noteId}/${index}.${ext}`;
                                        await deleteImages([path]);
                                    }
                                    setImages((prev) => prev.filter((_, i) => i !== index));
                                }}
                            />
                        )}

                        {isRecording ? (
                            <VoiceRecorder
                                duration={duration}
                                onStop={handleRecordVoiceNote}
                                onDiscard={handleDiscardRecording}
                            />
                        ) : audioUri.length > 0 ? (
                            <VoicePlayer audioUris={audioUri} onDelete={handleDeleteRecording} />
                        ) : (
                            <View>
                                <TextInput
                                    placeholder="Start writing..."
                                    placeholderTextColor={colors.textTertiary}
                                    style={[styles.contentInput, { color: colors.text }]}
                                    value={content}
                                    onChangeText={handleContentChange}
                                    multiline
                                    textAlignVertical="top"
                                    autoCorrect
                                />
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ paddingHorizontal: 16, gap: 16 }}>
                    {noteType === 'reminder' && (
                        <View
                            style={[
                                styles.reminderSettings,
                                { backgroundColor: colors.cardBackground },
                            ]}
                        >
                            <View style={styles.reminderRow}>
                                <Text style={[styles.reminderLabel, { color: colors.text }]}>
                                    Remind At
                                </Text>
                                <Pressable
                                    onPress={() => {
                                        setPickerMode('date');
                                        setShowPicker(true);
                                    }}
                                    style={[
                                        styles.datePickerButton,
                                        { backgroundColor: colors.border },
                                    ]}
                                >
                                    <Calendar size={16} color={colors.accent} />
                                    <Text style={[styles.datePickerText, { color: colors.accent }]}>
                                        {formatDateTime(reminderAt)}
                                    </Text>
                                </Pressable>
                            </View>

                            {showPicker && (
                                <>
                                    <DateTimePicker
                                        value={reminderAt ? new Date(reminderAt) : new Date()}
                                        mode={Platform.OS === 'ios' ? 'datetime' : pickerMode}
                                        is24Hour={false}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        minimumDate={new Date()}
                                        onValueChange={(
                                            event: DateTimePickerChangeEvent,
                                            date: Date
                                        ) => {
                                            const newDate = new Date(reminderAt || Date.now());
                                            if (Platform.OS === 'android') {
                                                if (pickerMode === 'date') {
                                                    newDate.setFullYear(
                                                        date.getFullYear(),
                                                        date.getMonth(),
                                                        date.getDate()
                                                    );
                                                    setReminderAt(newDate.getTime());
                                                    setShowPicker(false);
                                                    setTimeout(() => {
                                                        setPickerMode('time');
                                                        setShowPicker(true);
                                                    }, 100);
                                                } else {
                                                    newDate.setHours(
                                                        date.getHours(),
                                                        date.getMinutes(),
                                                        0,
                                                        0
                                                    );
                                                    setReminderAt(newDate.getTime());
                                                    setShowPicker(false);
                                                    setPickerMode('date');
                                                }
                                            } else {
                                                const finalDate = new Date(date);
                                                finalDate.setSeconds(0);
                                                finalDate.setMilliseconds(0);
                                                setReminderAt(finalDate.getTime());
                                            }
                                        }}
                                        onDismiss={() => {
                                            setShowPicker(false);
                                            setPickerMode('date');
                                        }}
                                        textColor={colors.text}
                                        themeVariant={
                                            colors.background === '#000000' ? 'dark' : 'light'
                                        }
                                    />
                                    {Platform.OS === 'ios' && (
                                        <Pressable
                                            onPress={() => setShowPicker(false)}
                                            style={styles.doneButton}
                                        >
                                            <Text
                                                style={[
                                                    styles.doneButtonText,
                                                    { color: colors.accent },
                                                ]}
                                            >
                                                Done
                                            </Text>
                                        </Pressable>
                                    )}
                                </>
                            )}
                        </View>
                    )}
                    <Pressable
                        onPress={handleSave}
                        disabled={saving}
                        style={[
                            styles.saveButton,
                            { backgroundColor: colors.saveButtonBg, borderColor: colors.border },
                            saving && { opacity: 0.7 },
                        ]}
                    >
                        {saving ? (
                            <ActivityIndicator size={20} color={colors.accent} />
                        ) : (
                            <Text style={[styles.saveText, { color: colors.accent }]}>Save</Text>
                        )}
                    </Pressable>
                </View>
            </ScrollView>

            <PinModal
                visible={pinModalVisible}
                mode="setup"
                onSuccess={async (pin) => {
                    await setupPin(noteId, pin);
                    setPinModalVisible(false);
                    await handleToggleLock();
                }}
                onCancel={() => setPinModalVisible(false)}
            />
        </View>
    );
};

export default NoteEditorScreen;
