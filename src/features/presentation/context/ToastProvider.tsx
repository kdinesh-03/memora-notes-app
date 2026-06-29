import { fonts } from '@/shared/utils/fonts';
import React, { useEffect, useState } from 'react';
import { Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/shared/theme/colors';

interface ToastProps {
    message: string;
}

interface ToastComponent extends React.FC<ToastProps> {
    show: (props: ToastProps) => void;
}

let showToastRef: ((props: ToastProps) => void) | null = null;

const DURATION = 2000;

export const Toast: ToastComponent = ({ message }) => {
    const { bottom } = useSafeAreaInsets();
    const colors = useColors();

    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50);

    useEffect(() => {
        opacity.value = withTiming(1, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
        });

        translateY.value = withTiming(0, {
            duration: 260,
            easing: Easing.out(Easing.cubic),
        });

        const timer = setTimeout(() => {
            opacity.value = withTiming(0, {
                duration: 220,
                easing: Easing.in(Easing.cubic),
            });

            translateY.value = withTiming(50, {
                duration: 220,
                easing: Easing.in(Easing.cubic),
            });
        }, DURATION);

        return () => clearTimeout(timer);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{
                position: 'absolute',
                alignSelf: 'center',
                width: '100%',
                zIndex: 9999,
                bottom: bottom + 20,
            }}
            pointerEvents="box-none"
        >
            <Animated.View style={[animatedStyle]}>
                <View style={{ paddingHorizontal: 20 }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 16,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: colors.toastBorder,
                            borderLeftWidth: 3,
                            borderLeftColor: colors.accent,
                            backgroundColor: colors.cardBackground,
                        }}
                    >
                        <Text
                            style={{
                                flex: 1,
                                fontSize: 15,
                                color: colors.text,
                                letterSpacing: 0.2,
                                ...fonts.fontMedium,
                            }}
                            numberOfLines={2}
                        >
                            {message}
                        </Text>
                    </View>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
};

const ToastWrapper: React.FC<ToastProps & { onDone: () => void }> = ({ message, onDone }) => {
    useEffect(() => {
        const timer = setTimeout(onDone, DURATION + 250);
        return () => clearTimeout(timer);
    }, []);

    return <Toast message={message} />;
};

Toast.show = (props: ToastProps) => {
    if (showToastRef) {
        showToastRef(props);
    } else {
        console.warn('Toast Provider is not mounted');
    }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<(ToastProps & { id: number }) | null>(null);

    useEffect(() => {
        showToastRef = (props: ToastProps) => {
            setToast({
                ...props,
                id: Date.now(),
            });
        };
        return () => {
            showToastRef = null;
        };
    }, []);

    return (
        <>
            {children}
            {toast && (
                <ToastWrapper
                    key={toast.id}
                    message={toast.message}
                    onDone={() => setToast(null)}
                />
            )}
        </>
    );
};
