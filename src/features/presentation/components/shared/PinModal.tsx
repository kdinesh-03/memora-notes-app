import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { fonts } from '@/shared/utils/fonts';
import { useColors } from '@/shared/theme/colors';

interface PinModalProps {
    visible: boolean;
    mode: 'setup' | 'verify';
    onSuccess: (pin: string) => void;
    onCancel: () => void;
    onVerify?: (pin: string) => Promise<boolean>;
    title?: string;
    subtitle?: string;
}

const PIN_LENGTH = 4;

const PinModal = ({
    visible,
    mode,
    onSuccess,
    onCancel,
    onVerify,
    title,
    subtitle,
}: PinModalProps) => {
    const colors = useColors();
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState<'enter' | 'confirm'>('enter');
    const [error, setError] = useState('');
    const inputRef = useRef<TextInput>(null);

    const shakeX = useSharedValue(0);

    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
    }));

    const triggerShake = () => {
        shakeX.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    };

    useEffect(() => {
        if (visible) {
            setPin('');
            setConfirmPin('');
            setStep('enter');
            setError('');
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [visible]);

    const handleKeyPress = async (digit: string) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (step === 'enter') {
            const newPin = pin + digit;
            setPin(newPin);
            setError('');

            if (newPin.length === PIN_LENGTH) {
                if (mode === 'setup') {
                    setTimeout(() => {
                        setStep('confirm');
                        setConfirmPin('');
                    }, 200);
                } else if (mode === 'verify' && onVerify) {
                    const valid = await onVerify(newPin);
                    if (valid) {
                        onSuccess(newPin);
                    } else {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        triggerShake();
                        setError('Incorrect PIN');
                        setTimeout(() => setPin(''), 300);
                    }
                }
            }
        } else if (step === 'confirm') {
            const newConfirm = confirmPin + digit;
            setConfirmPin(newConfirm);
            setError('');

            if (newConfirm.length === PIN_LENGTH) {
                if (newConfirm === pin) {
                    onSuccess(pin);
                } else {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    triggerShake();
                    setError('PINs do not match');
                    setTimeout(() => {
                        setConfirmPin('');
                        setStep('enter');
                        setPin('');
                    }, 800);
                }
            }
        }
    };

    const handleDelete = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (step === 'enter') {
            setPin((prev) => prev.slice(0, -1));
        } else {
            setConfirmPin((prev) => prev.slice(0, -1));
        }
    };

    const currentPin = step === 'enter' ? pin : confirmPin;
    const displayTitle =
        title ||
        (mode === 'setup'
            ? step === 'enter'
                ? 'Set Your PIN'
                : 'Confirm Your PIN'
            : 'Enter Your PIN');
    const displaySubtitle =
        subtitle ||
        (mode === 'setup'
            ? step === 'enter'
                ? 'Choose a 4-digit PIN to lock your notes'
                : 'Re-enter your PIN to confirm'
            : 'Enter your PIN to unlock');

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View
                style={[
                    styles.overlay,
                    {
                        backgroundColor:
                            colors.background === '#000000'
                                ? 'rgba(0, 0, 0, 0.85)'
                                : 'rgba(0, 0, 0, 0.5)',
                    },
                ]}
            >
                <View
                    style={[
                        styles.container,
                        { backgroundColor: colors.cardBackground, borderColor: colors.border },
                    ]}
                >
                    <View style={styles.header}>
                        <View style={{ flex: 1 }} />
                        <Pressable onPress={onCancel} hitSlop={10} style={styles.closeBtn}>
                            <X size={22} color={colors.textSecondary} />
                        </Pressable>
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>{displayTitle}</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {displaySubtitle}
                    </Text>

                    <Animated.View style={[styles.dotsContainer, shakeStyle]}>
                        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    { borderColor: colors.borderDark },
                                    i < currentPin.length && [
                                        styles.dotFilled,
                                        {
                                            backgroundColor: colors.accent,
                                            borderColor: colors.accent,
                                        },
                                    ],
                                    error && [styles.dotError, { borderColor: colors.error }],
                                ]}
                            />
                        ))}
                    </Animated.View>

                    {error ? (
                        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                    ) : (
                        <View style={{ height: 20 }} />
                    )}

                    <View style={styles.numpad}>
                        {[
                            ['1', '2', '3'],
                            ['4', '5', '6'],
                            ['7', '8', '9'],
                            ['', '0', '⌫'],
                        ].map((row, ri) => (
                            <View key={ri} style={styles.numpadRow}>
                                {row.map((digit, ci) => {
                                    if (digit === '') {
                                        return <View key={ci} style={styles.numpadKeyEmpty} />;
                                    }
                                    if (digit === '⌫') {
                                        return (
                                            <Pressable
                                                key={ci}
                                                style={({ pressed }) => [
                                                    styles.numpadKey,
                                                    { backgroundColor: colors.numpadKey },
                                                    pressed && [
                                                        styles.numpadKeyPressed,
                                                        {
                                                            backgroundColor:
                                                                colors.numpadKeyPressed,
                                                        },
                                                    ],
                                                ]}
                                                onPress={handleDelete}
                                            >
                                                <Text
                                                    style={[
                                                        styles.numpadKeyText,
                                                        { color: colors.text },
                                                    ]}
                                                >
                                                    ⌫
                                                </Text>
                                            </Pressable>
                                        );
                                    }
                                    return (
                                        <Pressable
                                            key={ci}
                                            style={({ pressed }) => [
                                                styles.numpadKey,
                                                { backgroundColor: colors.numpadKey },
                                                pressed && [
                                                    styles.numpadKeyPressed,
                                                    { backgroundColor: colors.numpadKeyPressed },
                                                ],
                                            ]}
                                            onPress={() => handleKeyPress(digit)}
                                            disabled={currentPin.length >= PIN_LENGTH}
                                        >
                                            <Text
                                                style={[
                                                    styles.numpadKeyText,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {digit}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default PinModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '88%',
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    header: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        marginBottom: 8,
    },
    closeBtn: {
        padding: 4,
    },
    title: {
        fontSize: 22,
        color: '#FFF',
        ...fonts.fontBold,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#8E8E93',
        ...fonts.fontRegular,
        textAlign: 'center',
        marginBottom: 24,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#48484A',
        backgroundColor: 'transparent',
    },
    dotFilled: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    dotError: {
        borderColor: '#FF453A',
        backgroundColor: 'transparent',
    },
    errorText: {
        color: '#FF453A',
        fontSize: 13,
        ...fonts.fontMedium,
        height: 20,
    },
    numpad: {
        marginTop: 16,
        gap: 12,
    },
    numpadRow: {
        flexDirection: 'row',
        gap: 20,
        justifyContent: 'center',
    },
    numpadKey: {
        width: 72,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#2C2C2E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    numpadKeyEmpty: {
        width: 72,
        height: 56,
    },
    numpadKeyPressed: {
        backgroundColor: '#48484A',
        transform: [{ scale: 0.95 }],
    },
    numpadKeyText: {
        fontSize: 26,
        color: '#FFF',
        ...fonts.fontMedium,
    },
});
