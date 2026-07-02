import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, Pin } from 'lucide-react-native';
import { fonts } from '../../../../shared/utils/fonts';
import { Note } from '../../../domain/entities/Note';
import { useColors } from '@/shared/theme/colors';

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

    return (
        date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
        }) + `, ${formatTime()}`
    );
};

const getSyncDotColor = (syncStatus?: string) => {
    switch (syncStatus) {
        case 'synced':
            return '#30D158';
        case 'pending':
            return '#FF9F0A';
        case 'failed':
            return '#FF453A';
        default:
            return '#48484A';
    }
};

interface NoteItemProps {
    note: Note;
    onPress: (id: string) => void;
    onTogglePin: (note: Note) => void;
}

export const NoteItem = memo(({ note, onPress, onTogglePin }: NoteItemProps) => {
    const colors = useColors();
    const isUpcoming =
        note.type === 'reminder' && note.reminder_at && note.reminder_at > Date.now();
    const isLocked = note.is_locked === 1;

    return (
        <Pressable
            onPress={() => onPress(note.id)}
            style={[
                styles.noteCard,
                {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderWidth: 1,
                },
            ]}
        >
            <View style={styles.titleContainer}>
                <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
                    {note.title || 'Untitled'}
                </Text>
                <Pressable onPress={() => onTogglePin(note)} hitSlop={10} style={styles.pinButton}>
                    <Pin
                        size={17}
                        color={note.is_pinned === 1 ? colors.accent : colors.textTertiary}
                        fill={note.is_pinned === 1 ? colors.accent : 'transparent'}
                    />
                </Pressable>
            </View>

            <Text style={[styles.noteSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
                {isLocked
                    ? '🔒 This note is locked'
                    : note.content ||
                      (note.audio_uri && note.audio_uri.length > 0 ? 'Audio Note' : 'No content')}
            </Text>

            <View style={styles.footer}>
                <View style={styles.footerLeft}>
                    {note.type === 'reminder' ? (
                        <View
                            style={[
                                styles.timeBadge,
                                isUpcoming
                                    ? styles.upcomingTimeBadge
                                    : [
                                          styles.expiredTimeBadge,
                                          { backgroundColor: colors.tabCountBadge },
                                      ],
                            ]}
                        >
                            <Bell
                                size={12}
                                color={isUpcoming ? '#FFD60A' : colors.textTertiary}
                                fill={isUpcoming ? '#FFD60A' : 'transparent'}
                            />
                            <Text
                                style={[
                                    styles.timeBadgeText,
                                    {
                                        color: isUpcoming ? '#FFD60A' : colors.textSecondary,
                                    },
                                ]}
                            >
                                {formatUpcomingTime(note.reminder_at)}
                            </Text>
                        </View>
                    ) : (
                        <Text style={[styles.noteDate, { color: colors.textTertiary }]}>
                            {new Date(note.updated_at).toLocaleDateString()}
                        </Text>
                    )}
                </View>
                {/* Sync status dot */}
                <View
                    style={[styles.syncDot, { backgroundColor: getSyncDotColor(note.sync_status) }]}
                />
            </View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    noteCard: {
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 12,
        boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1)',
        marginBottom: 12,
        gap: 2,
        backgroundColor: '#1c1c1e',
    },
    activeCard: {
        opacity: 0.9,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6,
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
    syncDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
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
