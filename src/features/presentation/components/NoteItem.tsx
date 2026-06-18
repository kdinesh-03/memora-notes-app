import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, Pin } from 'lucide-react-native';
import { fonts } from '../../../shared/utils/fonts';
import { Note } from '../../domain/entities/Note';

const formatUpcomingTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()}`;
    }

    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

interface NoteItemProps {
    note: Note;
    onPress: (id: string) => void;
    onTogglePin: (note: Note) => void;
}

export const NoteItem = memo(({ note, onPress, onTogglePin }: NoteItemProps) => {
    const isUpcoming =
        note.type === 'reminder' && note.reminder_at && note.reminder_at > Date.now();

    return (
        <View style={styles.noteCard}>
            <View style={styles.titleContainer}>
                <Pressable style={{ flex: 1, marginRight: 8 }} onPress={() => onPress(note.id)}>
                    <Text style={styles.noteTitle} numberOfLines={1}>
                        {note.title || 'Untitled'}
                    </Text>
                </Pressable>
                <Pressable onPress={() => onTogglePin(note)} hitSlop={10} style={styles.pinButton}>
                    <Pin
                        size={17}
                        color={note.is_pinned === 1 ? '#007AFF' : '#666'}
                        fill={note.is_pinned === 1 ? '#007AFF' : 'transparent'}
                    />
                </Pressable>
            </View>

            <Pressable onPress={() => onPress(note.id)}>
                <Text style={styles.noteSnippet} numberOfLines={2}>
                    {note.content || 'No content'}
                </Text>
                <View style={styles.footer}>
                    <View style={styles.footerLeft}>
                        {note.type === 'reminder' ? (
                            <View
                                style={[
                                    styles.timeBadge,
                                    isUpcoming ? styles.upcomingTimeBadge : styles.expiredTimeBadge,
                                ]}
                            >
                                <Bell
                                    size={12}
                                    color={isUpcoming ? '#FFD60A' : '#8E8E93'}
                                    fill={isUpcoming ? '#FFD60A' : 'transparent'}
                                />
                                <Text
                                    style={[
                                        styles.timeBadgeText,
                                        { color: isUpcoming ? '#FFD60A' : '#8E8E93' },
                                    ]}
                                >
                                    {formatUpcomingTime(note.reminder_at)}
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.noteDate}>
                                {new Date(note.updated_at).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                </View>
            </Pressable>
        </View>
    );
});

const styles = StyleSheet.create({
    noteCard: {
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 12,
        gap: 2,
        backgroundColor: '#1c1c1e',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    noteTitle: { flex: 1, fontSize: 18, ...fonts.fontSemiBold, color: '#fff' },
    pinButton: {
        padding: 4,
    },
    noteSnippet: { fontSize: 14, ...fonts.fontRegular, marginBottom: 8, color: '#ccc' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerLeft: { flexDirection: 'row', alignItems: 'center' },
    noteDate: { fontSize: 12, color: '#8E8E93', letterSpacing: 0.2, ...fonts.fontMedium },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    upcomingTimeBadge: {
        backgroundColor: '#FFD60A15',
        borderColor: '#FFD60A40',
        borderWidth: 0.5,
    },
    expiredTimeBadge: {
        backgroundColor: '#2C2C2E',
    },
    timeBadgeText: {
        fontSize: 12,
        ...fonts.fontMedium,
    },
});
