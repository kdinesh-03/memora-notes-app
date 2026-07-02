import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Play, Pause, RotateCcw, Trash2, Mic } from 'lucide-react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useColors } from '@/shared/theme/colors';
import { fonts } from '@/shared/utils/fonts';

const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface VoicePlayerProps {
    audioUris: string[];
    onDelete: (index: number) => void;
}

export const VoicePlayer = ({ audioUris, onDelete }: VoicePlayerProps) => {
    const colors = useColors();
    const [activeIndex, setActiveIndex] = useState(0);
    const activeUri = audioUris[activeIndex] ?? audioUris[0];

    if (!activeUri) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    Voice Notes ({audioUris.length})
                </Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
            >
                {audioUris.map((uri, index) => (
                    <VoiceNoteItem
                        key={`${index}-${uri}`}
                        uri={uri}
                        index={index}
                        isActive={index === activeIndex}
                        onSelect={() => setActiveIndex(index)}
                        onDelete={() => onDelete(index)}
                        colors={colors}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const VoiceNoteItem = ({
    uri,
    index,
    isActive,
    onSelect,
    onDelete,
    colors,
}: {
    uri: string;
    index: number;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
    colors: any;
}) => {
    const player = useAudioPlayer(uri);
    const status = useAudioPlayerStatus(player);

    const togglePlayPause = () => {
        if (!isActive) {
            onSelect();
        }
        if (status.playing) {
            player.pause();
        } else {
            if (status.currentTime >= status.duration && status.duration > 0) {
                player.seekTo(0);
            }
            player.play();
        }
    };

    const replay = () => {
        if (!isActive) {
            onSelect();
        }
        player.seekTo(0);
        player.play();
    };

    const progress =
        isActive && status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

    return (
        <View
            style={[
                styles.item,
                isActive && {
                    borderColor: colors.accent,
                    backgroundColor: colors.accentLight,
                },
                { borderColor: isActive ? colors.accent : colors.border },
            ]}
        >
            <View style={styles.itemHeader}>
                <Mic size={16} color={isActive ? colors.accent : colors.textTertiary} />
                <Text
                    style={[
                        styles.itemLabel,
                        { color: isActive ? colors.accent : colors.textSecondary },
                    ]}
                >
                    Recording {index + 1}
                </Text>
                <Pressable onPress={onDelete} hitSlop={8}>
                    <Trash2 size={16} color={colors.textTertiary} />
                </Pressable>
            </View>

            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${progress}%`, backgroundColor: colors.accent },
                    ]}
                />
            </View>

            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Text style={[styles.timeText, { color: colors.textTertiary }]}>
                    {formatTime(status.currentTime)}
                </Text>
                <Text style={[styles.timeText, { color: colors.textTertiary }]}>
                    {formatTime(status.duration)}
                </Text>
            </View>

            <View style={styles.itemControls}>
                <Pressable onPress={replay} style={styles.smallButton}>
                    <RotateCcw size={16} color={colors.textSecondary} />
                </Pressable>
                <Pressable
                    onPress={togglePlayPause}
                    style={[styles.playButton, { backgroundColor: colors.accent }]}
                >
                    {status.playing ? (
                        <Pause size={18} color="#fff" />
                    ) : (
                        <Play size={18} color="#fff" style={{ marginLeft: 1 }} />
                    )}
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        ...fonts.fontSemiBold,
    },
    list: {
        width: '100%',
        flexDirection: 'column',
        gap: 10,
    },
    item: {
        width: '100%',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    itemLabel: {
        flex: 1,
        fontSize: 15,
        ...fonts.fontMedium,
    },
    progressBar: {
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(128,128,128,0.2)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 1.5,
    },
    timeText: {
        fontSize: 13,
        ...fonts.fontMedium,
        fontVariant: ['tabular-nums'],
    },
    itemControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    smallButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
