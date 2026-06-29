import { fonts } from '@/shared/utils/fonts';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Mic, Image, Lock, Unlock } from 'lucide-react-native';
import { ImagePickerAsset } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useColors } from '@/shared/theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressableScale = ({
    children,
    onPress,
    style,
}: {
    children: React.ReactNode;
    onPress: () => void;
    style?: any;
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            style={[style, animatedStyle]}
            onPress={onPress}
            onPressIn={() => {
                scale.value = withTiming(0.95, { duration: 100 });
            }}
            onPressOut={() => {
                scale.value = withTiming(1, { duration: 100 });
            }}
        >
            {children}
        </AnimatedPressable>
    );
};

interface ActionProps {
    handleNoteType: () => void;
    noteType: 'note' | 'reminder';
    handleImage: (uri: ImagePickerAsset[]) => void;
    handleLock?: () => void;
    isLocked?: boolean;
}

const Actions = ({ handleNoteType, noteType, handleImage, handleLock, isLocked }: ActionProps) => {
    const colors = useColors();

    const handleImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsMultipleSelection: true,
            selectionLimit: 5,
            orderedSelection: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            handleImage(result.assets);
        }
    };

    const handleAction = async (actionId: string) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        switch (actionId) {
            case 'add-image':
                handleImagePicker();
                break;
            case 'lock-note':
                handleLock?.();
                break;
        }
    };

    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 16,
                }}
            >
                <PressableScale
                    style={[
                        styles.actionButton,
                        {
                            borderWidth: 1,
                            borderColor: colors.accent,
                            backgroundColor: colors.cardBackground,
                        },
                    ]}
                    onPress={handleNoteType}
                >
                    <Text
                        style={[
                            styles.actionButtonText,
                            { letterSpacing: 0.2, color: colors.accent },
                        ]}
                    >
                        {noteType === 'reminder' ? 'Reminder' : 'Note'}
                    </Text>
                </PressableScale>
                <View style={[styles.verticalLine, { backgroundColor: colors.border }]} />

                <PressableScale
                    style={[
                        styles.actionButton,
                        { backgroundColor: colors.cardBackground, borderColor: colors.border },
                    ]}
                    onPress={() => handleAction('record-voice-note')}
                >
                    <Mic size={18} color={colors.textSecondary} />
                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
                        Record Voice Note
                    </Text>
                </PressableScale>

                <PressableScale
                    style={[
                        styles.actionButton,
                        { backgroundColor: colors.cardBackground, borderColor: colors.border },
                    ]}
                    onPress={() => handleAction('add-image')}
                >
                    <Image size={18} color={colors.textSecondary} />
                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
                        Add Image
                    </Text>
                </PressableScale>

                <PressableScale
                    style={[
                        styles.actionButton,
                        { backgroundColor: colors.cardBackground, borderColor: colors.border },
                        isLocked && {
                            borderColor: colors.accent,
                            backgroundColor: colors.accentLight,
                        },
                    ]}
                    onPress={() => handleAction('lock-note')}
                >
                    {isLocked ? (
                        <Unlock size={17} color={colors.accent} />
                    ) : (
                        <Lock size={17} color={colors.textSecondary} />
                    )}
                    <Text
                        style={[
                            styles.actionButtonText,
                            { color: colors.textSecondary },
                            isLocked && { color: colors.accent },
                        ]}
                    >
                        {isLocked ? 'Unlock Note' : 'Lock Note'}
                    </Text>
                </PressableScale>
            </ScrollView>
        </View>
    );
};

export default Actions;

const styles = StyleSheet.create({
    verticalLine: {
        height: '80%',
        width: 1,
        backgroundColor: '#333',
        marginHorizontal: 3,
    },
    actionButton: {
        backgroundColor: '#1c1c1e',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    actionButtonActive: {
        borderColor: '#007AFF',
        backgroundColor: '#007AFF15',
    },
    actionButtonText: {
        color: '#AAA',
        fontSize: 14,
        ...fonts.fontMedium,
    },
});
