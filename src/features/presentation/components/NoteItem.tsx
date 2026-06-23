import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, Pin, StickyNote } from 'lucide-react-native';
import { fonts } from '../../../shared/utils/fonts';
import { Note } from '../../domain/entities/Note';

const formatUpcomingTime = (timestamp?: number) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();

    const formatTime = () =>
        date
            .toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
            .replace(/am|pm/i, (match) => match.toUpperCase());

    if (date.toDateString() === now.toDateString()) {
        return `Today, ${formatTime()}`;
    }

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${formatTime()}`;
    }

    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
    }) + `, ${formatTime()}`;
};

interface NoteItemProps {
    note: Note;
    onPress: (id: string) => void;
    onTogglePin: (note: Note) => void;
    onLongPress?: () => void;
    isActive?: boolean;
}

export const NoteItem = memo(({ note, onPress, onTogglePin, onLongPress, isActive }: NoteItemProps) => {
    const isUpcoming =
        note.type === 'reminder' && note.reminder_at && note.reminder_at > Date.now();

    return (
        <Pressable
            onPress={() => onPress(note.id)}
            onLongPress={onLongPress}
            delayLongPress={200}
            disabled={isActive}
            style={[styles.noteCard, isActive && styles.activeCard]}
        >
            <View style={styles.titleContainer}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.noteTitle} numberOfLines={1}>
                        {note.title || 'Untitled'}
                    </Text>
                </View>
                <Pressable onPress={() => onTogglePin(note)} hitSlop={10} style={styles.pinButton}>
                    <Pin
                        size={17}
                        color={note.is_pinned === 1 ? '#007AFF' : '#666'}
                        fill={note.is_pinned === 1 ? '#007AFF' : 'transparent'}
                    />
                </Pressable>
            </View>

            <Text style={styles.noteSnippet} numberOfLines={2}>
                {note.content || 'No content'}
            </Text>
            <View style={styles.footer}>
                <View style={styles.footerLeft}>
                    {note.type === 'reminder' ? (
                        <View
                            style={[
                                styles.timeBadge,
                                isUpcoming
                                    ? styles.upcomingTimeBadge
                                    : styles.expiredTimeBadge,
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
                                    {
                                        color: isUpcoming
                                            ? '#FFD60A'
                                            : '#8E8E93',
                                    },
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
    activeCard: {
        opacity: 0.9,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderColor: '#007AFF',
        borderWidth: 1,
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 4,
        marginLeft: 8,
    },
    typeBadgeNote: {
        backgroundColor: '#2C2C2E',
    },
    typeBadgeReminder: {
        backgroundColor: '#FFD60A15',
        borderColor: '#FFD60A30',
        borderWidth: 0.5,
    },
    typeBadgeText: {
        fontSize: 10,
        ...fonts.fontSemiBold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
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
