import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar, ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../../../shared/utils/fonts';
import { useNoteEditor } from '../hooks/useNoteEditor';

export const NoteEditorScreen = () => {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const {
        title,
        content,
        noteType,
        reminderAt,
        handleTitleChange,
        handleContentChange,
        toggleType,
        setReminderAt,
        loading,
        saving,
        handleSave,
    } = useNoteEditor(id);
    const { bottom, top } = useSafeAreaInsets();
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

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

    if (loading) {
        return (
            <View style={[styles.container, darkStyles.container, styles.centered]}>
                <ActivityIndicator size={20} color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000', paddingTop: top }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.container,
                    darkStyles.container,
                    { paddingBottom: bottom },
                ]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Pressable onPress={router.back} style={styles.backButton}>
                        <ChevronLeft color={'#FFF'} size={28} />
                        <Text style={[styles.backText, { color: '#FFF' }]}>Back</Text>
                    </Pressable>

                    <View style={styles.headerActions}>
                        <Pressable
                            style={[
                                styles.typeButton,
                                noteType === 'reminder' && styles.typeButtonActive,
                            ]}
                            onPress={toggleType}
                        >
                            <Text
                                style={[
                                    styles.typeText,
                                    noteType === 'reminder' && styles.typeTextActive,
                                ]}
                            >
                                {noteType === 'reminder' ? 'Reminder' : 'Note'}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSave}
                            disabled={saving}
                            style={[styles.saveButton, saving && { opacity: 0.7 }]}
                        >
                            {saving ? (
                                <ActivityIndicator size={20} color="#007AFF" />
                            ) : (
                                <Text style={styles.saveText}>Save</Text>
                            )}
                        </Pressable>
                    </View>
                </View>

                <TextInput
                    placeholder="Title"
                    placeholderTextColor={'#666'}
                    style={[styles.titleInput, darkStyles.text]}
                    value={title}
                    onChangeText={handleTitleChange}
                    multiline
                    autoFocus
                    autoCorrect
                />

                <TextInput
                    placeholder="Start writing..."
                    placeholderTextColor={'#666'}
                    style={[styles.contentInput, darkStyles.text]}
                    value={content}
                    onChangeText={handleContentChange}
                    multiline
                    textAlignVertical="top"
                    autoCorrect
                />

                {noteType === 'reminder' && (
                    <View style={styles.reminderSettings}>
                        <View style={styles.reminderRow}>
                            <Text style={styles.reminderLabel}>Remind At</Text>
                            <Pressable
                                onPress={() => {
                                    setPickerMode('date');
                                    setShowPicker(true);
                                }}
                                style={styles.datePickerButton}
                            >
                                <Calendar size={16} color="#007AFF" />
                                <Text style={styles.datePickerText}>
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
                                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                                        if (event.type === 'dismissed') {
                                            setShowPicker(false);
                                            setPickerMode('date');
                                            return;
                                        }

                                        if (date) {
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
                                        }
                                    }}
                                    textColor="#FFF"
                                    themeVariant="dark"
                                />
                                {Platform.OS === 'ios' && (
                                    <Pressable
                                        onPress={() => setShowPicker(false)}
                                        style={styles.doneButton}
                                    >
                                        <Text style={styles.doneButtonText}>Done</Text>
                                    </Pressable>
                                )}
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, paddingHorizontal: 20 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: { flexDirection: 'row', alignItems: 'center', marginLeft: -10 },
    backText: { fontSize: 18, ...fonts.fontMedium },
    saveButton: {
        backgroundColor: '#1c1c1e',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    saveText: {
        color: '#007AFF',
        fontSize: 16,
        ...fonts.fontSemiBold,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reminderToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1c1c1e',
        paddingLeft: 12,
        paddingRight: 4,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
    },
    reminderText: {
        color: '#AAA',
        fontSize: 14,
        ...fonts.fontMedium,
    },
    typeButton: {
        backgroundColor: '#1c1c1e',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    typeButtonActive: {
        borderColor: '#007AFF',
    },
    typeText: {
        color: '#AAA',
        fontSize: 14,
        ...fonts.fontMedium,
    },
    typeTextActive: {
        color: '#007AFF',
    },
    reminderSettings: {
        marginTop: 20,
        backgroundColor: '#1c1c1e',
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    reminderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reminderLabel: {
        color: '#FFF',
        fontSize: 16,
        ...fonts.fontMedium,
    },
    titleInput: {
        fontSize: 32,
        ...fonts.fontBold,
        marginBottom: 20,
        maxHeight: 120,
    },
    contentInput: {
        flex: 1,
        fontSize: 18,
        lineHeight: 24,
        ...fonts.fontRegular,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2c2c2e',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    datePickerText: {
        color: '#007AFF',
        fontSize: 14,
        ...fonts.fontMedium,
    },
    doneButton: {
        alignSelf: 'flex-end',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    doneButtonText: {
        color: '#007AFF',
        fontSize: 16,
        ...fonts.fontSemiBold,
    },
    repeatRow: {
        gap: 12,
        marginTop: 4,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    dayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2c2c2e',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    dayButtonActive: {
        backgroundColor: '#007AFF20',
        borderColor: '#007AFF',
    },
    dayText: {
        color: '#AAA',
        fontSize: 14,
        ...fonts.fontMedium,
    },
    dayTextActive: {
        color: '#007AFF',
        ...fonts.fontSemiBold,
    },
});

const darkStyles = StyleSheet.create({
    container: { backgroundColor: '#000' },
    text: { color: '#FFF' },
});
