import { ToastProvider } from '@/features/presentation/context/ToastProvider';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { initDb } from '../infrastructure/database/sqlite';
import { requestNotificationPermissions } from '../shared/services/notifications';
import { Stack } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
    const [isDbReady, setIsDbReady] = useState(false);

    useEffect(() => {
        const prepare = async () => {
            try {
                await initDb();
                await requestNotificationPermissions().catch((e) =>
                    console.log('Error requesting notification permissions:', e.message, e)
                );
            } catch (e) {
                console.log('Error during database initialization:', e);
            } finally {
                setIsDbReady(true);
                await SplashScreen.hideAsync().catch(() => { });
            }
        };
        prepare();
    }, []);

    if (!isDbReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
            <SafeAreaProvider>
                <KeyboardProvider>
                    <ToastProvider>
                        <StatusBar style="light" />
                        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
                            <Stack.Screen name="index" />
                            <Stack.Screen name="editor" />
                            <Stack.Screen
                                name="register"
                                options={{
                                    presentation: 'formSheet',
                                    sheetCornerRadius: 20,
                                    sheetElevation: 10,
                                    sheetGrabberVisible: true,
                                    sheetResizeAnimationEnabled: true,
                                    keyboardHandlingEnabled: true,
                                }}
                            />
                        </Stack>
                    </ToastProvider>
                </KeyboardProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
