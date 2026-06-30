import React, { createContext, useContext, useRef, useState, ReactNode, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Modal,
    BackHandler,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const BottomSheetContext = createContext({
    showBottomSheet: (
        renderer: () => React.ReactNode,
        bgColor?: string,
        dismissFlag?: 'hide' | 'none',
        maxHeightPercent?: number,
        onClose?: () => void
    ) => {},
    hideBottomSheet: () => {},
});

export const useBottomSheet = () => useContext(BottomSheetContext);

export const BottomSheetProvider = ({ children }: { children: ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [renderer, setRenderer] = useState<(() => React.ReactNode) | null>(null);
    const [backdropDismiss, setBackdropDismiss] = useState(true);

    const [bgColor, setBgColor] = useState('#fff');

    const onCloseRef = useRef<(() => void) | null>(null);

    const translateY = useSharedValue(height);
    const backdrop = useSharedValue(0);

    const maxHeightRef = useRef<number>(height);

    const showBottomSheet = (
        renderer: () => React.ReactNode,
        bgColor?: string,
        dismissFlag?: 'hide' | 'none',
        maxHeightPercent?: number,
        onClose?: () => void
    ) => {
        maxHeightRef.current = maxHeightPercent ? height * maxHeightPercent : height;
        onCloseRef.current = onClose ?? null;
        setBgColor(bgColor ?? '#fff');
        setRenderer(() => renderer);
        setVisible(true);
        setBackdropDismiss(dismissFlag === 'hide');
    };

    const hideBottomSheet = () => {
        Keyboard.dismiss();
        translateY.value = withTiming(height, { duration: 500 });
        backdrop.value = withTiming(0, { duration: 200 }, () => {
            'worklet';
            runOnJS(setVisible)(false);
            runOnJS(setRenderer)(null);
            onCloseRef.current?.();
            onCloseRef.current = null;
        });
    };

    useEffect(() => {
        if (visible) {
            translateY.value = maxHeightRef.current;
            backdrop.value = 0;
            translateY.value = withTiming(0, { duration: 220 });
            backdrop.value = withTiming(1, { duration: 220 });
        }

        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            if (visible) {
                hideBottomSheet();
                return true;
            }
            return false;
        });

        return () => sub.remove();
    }, [visible]);

    const { top } = useSafeAreaInsets();

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdrop.value,
    }));

    return (
        <BottomSheetContext.Provider value={{ showBottomSheet, hideBottomSheet }}>
            {children}
            <Modal
                transparent
                visible={visible}
                animationType="none"
                statusBarTranslucent
                navigationBarTranslucent
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={[styles.overlay, { paddingTop: top }]}>
                        <TouchableWithoutFeedback
                            onPress={backdropDismiss ? hideBottomSheet : () => {}}
                            style={{ flex: 1 }}
                        >
                            <Animated.View style={[styles.backdrop, backdropStyle]} />
                        </TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.sheet,
                                {
                                    backgroundColor: bgColor,
                                    maxHeight: maxHeightRef.current,
                                },
                                sheetStyle,
                            ]}
                        >
                            {renderer?.()}
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </BottomSheetContext.Provider>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.40)',
    },
    sheet: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        width: '100%',
        overflow: 'hidden',
    },
});
