import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { useColors } from '@/shared/theme/colors';
import { styles } from '../../styles/MenuScreen.styles';
import { ChevronRight } from 'lucide-react-native';

type SettingsRowProps = {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    labelColor?: string;
};

export const SettingsRow = (props: SettingsRowProps) => {
    const { icon, iconBg, label, value, onPress, rightElement, labelColor } = props;
    const colors = useColors();

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.row, pressed && onPress && { opacity: 0.7 }]}
        >
            <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>{icon}</View>
            <Text style={[styles.rowLabel, { color: labelColor || colors.text }]}>{label}</Text>
            {value && (
                <Text style={[styles.rowValue, { color: colors.textTertiary }]}>{value}</Text>
            )}
            {rightElement}
            {onPress && !rightElement && <ChevronRight size={18} color={colors.textTertiary} />}
        </Pressable>
    );
};
