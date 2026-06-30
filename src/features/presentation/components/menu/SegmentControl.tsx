import { View, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useColors } from '@/shared/theme/colors';
import { useEffect, useState } from 'react';
import { styles } from '../../styles/MenuScreen.styles';

type SegmentControlProps<T> = {
    options: { key: T; label: string }[];
    handleSelection: (key: T) => void;
    value: T;
};

const SegmentControl = <T extends string>({
    options,
    handleSelection,
    value,
}: SegmentControlProps<T>) => {
    const colors = useColors();

    const translateX = useSharedValue(0);
    const [containerWidth, setContainerWidth] = useState(0);

    const totalGap = (options.length - 1) * 3;

    const segmentWidth = (containerWidth - totalGap - 6) / options.length;

    useEffect(() => {
        const index = options.findIndex((opt) => opt.key === value);

        translateX.value = withTiming(index * (segmentWidth + 3), {
            duration: 400,
        });
    }, [value, containerWidth]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <View
            onLayout={(e) => {
                if (containerWidth > 0) return;
                setContainerWidth(e.nativeEvent.layout.width);
            }}
            style={[styles.segement, { backgroundColor: colors.border }]}
        >
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        height: '100%',
                        width: segmentWidth,
                        backgroundColor: colors.cardBackground,
                        borderRadius: 8,
                        left: 3,
                        top: 3,
                    },
                    animatedStyle,
                ]}
            />
            {options.map(({ key, label }) => (
                <Pressable
                    key={key}
                    onPress={() => handleSelection(key)}
                    style={styles.segementBtn}
                >
                    <Text
                        style={[
                            styles.segementText,
                            { color: value === key ? colors.accent : colors.textTertiary },
                            value === key && styles.segementTextActive,
                        ]}
                    >
                        {label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
};

export default SegmentControl;
