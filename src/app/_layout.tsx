import { ToastProvider } from '@/features/presentation/context/ToastProvider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDb } from '../infrastructure/database/sqlite';

export default function RootLayout() {
    useEffect(() => {
        initDb().catch(console.error);
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <KeyboardProvider>
                    <ToastProvider>
                        <StatusBar style="light" />
                        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
                    </ToastProvider>
                </KeyboardProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
