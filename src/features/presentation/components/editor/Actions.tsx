import { fonts } from '@/shared/utils/fonts';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Mic, Image, Lock } from 'lucide-react-native';
import { useMemo } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const features = [
    {
        id: 'record-voice-note',
        name: 'Record Voice Note',
        icon: <Mic size={18} color={'#AAA'} />,
        type: 'note-reminder',
    },
    {
        id: 'add-image',
        name: 'Add Image',
        icon: <Image size={18} color={'#AAA'} />,
        type: 'note-reminder'
    },
    {
        id: 'lock-note',
        name: 'Lock Note',
        icon: <Lock size={17} color={'#AAA'} />,
        type: 'note'
    },
];

interface ActionProps {
    handleNoteType: () => void;
    noteType: 'note' | 'reminder';
    handleImage: (uri: ImagePickerAsset[]) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressableScale = ({ children, onPress, style }: { children: React.ReactNode, onPress: () => void, style?: any }) => {
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

const Actions = ({ handleNoteType, noteType, handleImage }: ActionProps) => {

    const filteredActions = useMemo(() => {
        if (noteType === 'note') {
            return features.filter((feature) => feature.type === 'note' || feature.type === 'note-reminder')
        } else {
            return features.filter((feature) => feature.type === 'reminder' || feature.type === 'note-reminder')
        }
    }, [noteType])

    const handleImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
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
        }
    }

    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 16,
                }}
            >
                <PressableScale
                    style={[
                        styles.actionButton,
                        { borderWidth: 1, borderColor: "#007AFF" }
                    ]}
                    onPress={handleNoteType}
                >
                    <Text style={[styles.actionButtonText, { letterSpacing: 0.2, color: "#007AFF" }]}>
                        {noteType === 'reminder' ? 'Reminder' : 'Note'}
                    </Text>
                </PressableScale>
                <View style={styles.verticalLine} />
                {filteredActions.map((action) => (
                    <PressableScale
                        key={action.id}
                        style={styles.actionButton}
                        onPress={() => handleAction(action.id)}
                    >
                        {action.icon}
                        <Text
                            style={[
                                styles.actionButtonText,
                            ]}
                        >
                            {action.name}
                        </Text>
                    </PressableScale>
                ))}
            </ScrollView>
        </View>
    )
}

export default Actions

const styles = StyleSheet.create({
    verticalLine: {
        height: "80%",
        width: 1,
        backgroundColor: '#333',
        marginHorizontal: 3
    },
    actionButton: {
        backgroundColor: '#1c1c1e',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    actionButtonText: {
        color: '#AAA',
        fontSize: 14,
        ...fonts.fontMedium,
    },
});
