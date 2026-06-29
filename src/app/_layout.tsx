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
import { useAuth } from '../shared/store/useAuth';
import { supabase } from '../infrastructure/supabase/supabase';
import { useColors, useIsDark } from '../shared/theme/colors';
import { useThemeStore } from '../shared/store/useThemeStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
    const [isDbReady, setIsDbReady] = useState(false);
    const { restoreSession, setSession } = useAuth();
    const { loadTheme } = useThemeStore();

    useEffect(() => {
        const prepare = async () => {
            try {
                await Promise.all([initDb(), restoreSession(), loadTheme()]);
                await requestNotificationPermissions().catch((e) =>
                    console.log('Error requesting notification permissions:', e.message, e)
                );
            } catch (e) {
                console.log('Error during initialization:', e);
            } finally {
                setIsDbReady(true);
                await SplashScreen.hideAsync().catch(() => {});
            }
        };
        prepare();
    }, []);

    // Listen for auth state changes
    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setSession]);

    const colors = useColors();
    const isDark = useIsDark();

    if (!isDbReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
            <SafeAreaProvider>
                <KeyboardProvider>
                    <ToastProvider>
                        <StatusBar style={isDark ? 'light' : 'dark'} />
                        <Stack
                            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
                        />
                    </ToastProvider>
                </KeyboardProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
