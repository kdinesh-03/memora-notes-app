import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { AudioWaveform, Calendar, ChevronLeft, Mic, X } from 'lucide-react-native';
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
import { useSpeechToText } from '../hooks/useSpeechToText';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Actions from '../components/editor/Actions';
import ImageCollage from '../components/editor/ImageCollage';

export const NoteEditorScreen = () => {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const {
        title,
        content,
        noteType,
        reminderAt,
        images,
        setImages,
        handleTitleChange,
        handleContentChange,
        toggleType,
        setReminderAt,
        loading,
        saving,
        handleSave,
    } = useNoteEditor(id);

    const { bottom, top } = useSafeAreaInsets();
    const { isRecording, transcript, start, stop } = useSpeechToText();

    const [focusedField, setFocusedField] = useState<'title' | 'content'>('title');

    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    useEffect(() => {
        if (transcript) {
            if (focusedField === 'title') handleTitleChange(transcript);
            else handleContentChange(transcript)
        }
    }, [transcript])

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

    const rotation = useSharedValue(0);

    useEffect(() => {
        if (isRecording) {
            rotation.value = withRepeat(
                withTiming(360, {
                    duration: 2000,
                    easing: Easing.linear,
                }),
                -1
            );
        } else {
            rotation.value = 0;
        }
    }, [isRecording]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const handlePress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (isRecording) stop();
        else await start();
    };

    const handleNoteType = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        toggleType();
    }

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
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
                    { paddingBottom: bottom },
                ]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <Pressable onPress={router.back} style={styles.backButton}>
                            <ChevronLeft color={'#FFF'} size={28} />
                            <Text style={[styles.backText, { color: '#FFF' }]}>Back</Text>
                        </Pressable>
                    </View>

                    <Actions
                        handleNoteType={handleNoteType}
                        noteType={noteType}
                        handleImage={(assets) => {
                            setImages(prev => {
                                const newImages = [...prev, ...assets];
                                return newImages.slice(0, 5);
                            });
                        }}
                    />

                    <View style={{ flex: 1, paddingHorizontal: 16 }}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Title"
                                placeholderTextColor={'#666'}
                                style={styles.titleInput}
                                value={title}
                                onChangeText={handleTitleChange}
                                multiline
                                autoFocus
                                autoCorrect
                                onFocus={() => setFocusedField('title')}
                            />
                            {focusedField === 'title' && (
                                <Pressable
                                    onPress={handlePress}
                                    style={styles.recordingBtn}
                                    hitSlop={10}
                                >
                                    {isRecording && (
                                        <Animated.View style={[styles.ring, animatedStyle]} />
                                    )}
                                    {isRecording ? (
                                        <AudioWaveform color="#007AFF" size={20} />
                                    ) : (
                                        <Mic color="#007AFF" size={20} />
                                    )}
                                </Pressable>
                            )}
                        </View>

                        <ImageCollage
                            images={images}
                            onRemoveImage={(index) => {
                                setImages(prev => prev.filter((_, i) => i !== index));
                            }}
                        />

                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Start writing..."
                                placeholderTextColor={'#666'}
                                style={styles.contentInput}
                                value={content}
                                onChangeText={handleContentChange}
                                multiline
                                textAlignVertical="top"
                                autoCorrect
                                onFocus={() => setFocusedField('content')}
                            />
                            {focusedField === 'content' && (
                                <Pressable
                                    onPress={handlePress}
                                    style={styles.recordingBtn}
                                    hitSlop={10}
                                >
                                    {isRecording && (
                                        <Animated.View style={[styles.ring, animatedStyle]} />
                                    )}
                                    {isRecording ? (
                                        <AudioWaveform color="#007AFF" size={20} />
                                    ) : (
                                        <Mic color="#007AFF" size={20} />
                                    )}
                                </Pressable>
                            )}
                        </View>
                    </View>
                </View>

                <View style={{ paddingHorizontal: 16, gap: 16 }}>
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
                                        onValueChange={(event: DateTimePickerChangeEvent, date: Date) => {
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
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#000' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        gap: 16,
        paddingBottom: 20,
        paddingTop: 5,
        paddingHorizontal: 16
    },
    backButton: { flexDirection: 'row', alignItems: 'center', left: -8 },
    backText: { fontSize: 18, ...fonts.fontMedium },
    saveButton: {
        alignItems: 'center',
        backgroundColor: '#1c1c1e',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    saveText: {
        color: '#007AFF',
        fontSize: 16,
        ...fonts.fontSemiBold,
        letterSpacing: 0.2
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
    inputContainer: {
        position: "relative",
        marginTop: 24,
        display: "flex",
        justifyContent: "center",
    },
    recordingBtn: {
        backgroundColor: '#1c1c1e',
        width: 40,
        height: 40,
        borderRadius: 50,
        position: "absolute",
        right: 0,
        top: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    ring: {
        position: "absolute",
        width: 40,
        height: 40,
        borderRadius: 100,
        borderWidth: 2,
        borderTopColor: "#007AFF",
        borderRightColor: "#007AFF",
        borderBottomColor: "transparent",
        borderLeftColor: "transparent",
    },
    reminderLabel: {
        color: '#FFF',
        fontSize: 16,
        ...fonts.fontMedium,
    },
    titleInput: {
        fontSize: 32,
        ...fonts.fontBold,
        maxHeight: 120,
        color: '#FFF'
    },
    contentInput: {
        flex: 1,
        fontSize: 18,
        lineHeight: 24,
        ...fonts.fontRegular,
        color: '#FFF'
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
