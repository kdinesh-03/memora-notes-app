import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Square, X } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useColors } from '@/shared/theme/colors';
import { fonts } from '@/shared/utils/fonts';

const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

interface VoiceRecorderProps {
    duration: number;
    onStop: () => void;
    onDiscard: () => void;
}

export const VoiceRecorder = ({ duration, onStop, onDiscard }: VoiceRecorderProps) => {
    const colors = useColors();
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, [opacity]);

    const animatedDotStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.indicatorRow}>
                <Animated.View style={[styles.dot, animatedDotStyle]} />
                <Text style={[styles.recordingLabel, { color: '#FF453A' }]}>Recording</Text>
            </View>

            <Text style={[styles.timer, { color: colors.text }]}>{formatDuration(duration)}</Text>

            <View style={styles.controls}>
                <Pressable onPress={onDiscard} style={styles.controlButton}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.border }]}>
                        <X size={18} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.controlLabel, { color: colors.textTertiary }]}>
                        Discard
                    </Text>
                </Pressable>

                <Pressable onPress={onStop} style={styles.controlButton}>
                    <View style={[styles.stopCircle]}>
                        <Square size={18} color="#fff" fill="#fff" />
                    </View>
                    <Text style={[styles.controlLabel, { color: colors.textTertiary }]}>Stop</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 16,
    },
    indicatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF453A',
    },
    recordingLabel: {
        fontSize: 15,
        ...fonts.fontSemiBold,
    },
    timer: {
        fontSize: 48,
        ...fonts.fontBold,
        letterSpacing: 2,
        fontVariant: ['tabular-nums'],
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 48,
    },
    controlButton: {
        alignItems: 'center',
        gap: 6,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FF453A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlLabel: {
        fontSize: 12,
        ...fonts.fontMedium,
    },
});
