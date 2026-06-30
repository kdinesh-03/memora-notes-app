import { Toast, ToastProvider } from '@/features/presentation/context/ToastProvider';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { initDb } from '../infrastructure/database/sqlite';
import { requestNotificationPermissions } from '../shared/services/notifications';
import { router, Stack } from 'expo-router';
import { useAuth } from '../shared/store/useAuth';
import { supabase } from '../infrastructure/supabase/supabase';
import { useColors, useIsDark } from '../shared/theme/colors';
import { useThemeStore } from '../shared/store/useThemeStore';
import { BottomSheetProvider } from '@/features/presentation/components';
import * as Linking from 'expo-linking';

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

    const extractTokensFromUrl = (url: string) => {
        const hash = url.split('#')[1];
        if (!hash) return {};

        const params = new URLSearchParams(hash);

        return {
            access_token: params.get('access_token'),
            refresh_token: params.get('refresh_token'),
            type: params.get('type'),
        };
    };

    useEffect(() => {
        const handleDeepLink = async (url: string) => {
            try {
                const { access_token, refresh_token, type } = extractTokensFromUrl(url);

                if (!access_token || !refresh_token || type !== 'recovery') {
                    console.log('Invalid or missing recovery tokens');
                    return;
                }

                const { data, error } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                });

                if (error) {
                    console.log('Session Error:', error.message);
                    Toast.show({ message: 'Invalid or expired password reset link' });
                    return;
                }

                router.replace('/reset-password');
            } catch (e: any) {
                console.log('Deep link error:', e.message);
            }
        };

        const subscription = Linking.addEventListener('url', ({ url }) => {
            console.log('Deep link URL:', url);
            handleDeepLink(url);
        });

        return () => subscription.remove();
    }, []);

    if (!isDbReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
            <SafeAreaProvider>
                <KeyboardProvider>
                    <BottomSheetProvider>
                        <ToastProvider>
                            <StatusBar style={isDark ? 'light' : 'dark'} />
                            <Stack
                                screenOptions={{
                                    headerShown: false,
                                    animation: 'slide_from_right',
                                }}
                            />
                        </ToastProvider>
                    </BottomSheetProvider>
                </KeyboardProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
