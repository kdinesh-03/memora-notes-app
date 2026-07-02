import { Toast, ToastProvider } from '@/features/presentation/context/ToastProvider';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { initDb } from '../infrastructure/database/sqlite';
import { router, Stack } from 'expo-router';
import { useAuth } from '../shared/store/useAuth';
import { supabase } from '../infrastructure/supabase/supabase';
import { useColors, useIsDark } from '../shared/theme/colors';
import { useThemeStore } from '../shared/store/useThemeStore';
import { useAppLock } from '../shared/store/useAppLock';
import { BottomSheetProvider, AppLockOverlay } from '@/features/presentation/components';
import * as Linking from 'expo-linking';
import { useOnboardingStore } from '@/shared/store/useOnboardingStore';

SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
    const [isDbReady, setIsDbReady] = useState(false);

    const { restoreSession, setSession } = useAuth();
    const { loadTheme } = useThemeStore();
    const { onboardingCompleted } = useOnboardingStore();
    const { isAppLocked, isAppLockEnabled, loadAppLockSettings, setAppLocked, authenticate } = useAppLock();

    useEffect(() => {
        const prepare = async () => {
            try {
                await Promise.all([
                    restoreSession(),
                    loadTheme(),
                    initDb(),
                ]);
            } catch (e) {
                console.log('Error during initialization:', e);
            } finally {
                setIsDbReady(true);
                await SplashScreen.hideAsync().catch(() => { });
            }
        };
        prepare();

        loadAppLockSettings().catch(() => { });
    }, []);

    useEffect(() => {
        if (!isDbReady) return;

        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                if (isAppLockEnabled) {
                    setAppLocked(true);
                    authenticate();
                }
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                if (isAppLockEnabled) {
                    setAppLocked(true);
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        if (isAppLockEnabled && isAppLocked) {
            authenticate();
        }

        return () => {
            subscription.remove();
        };
    }, [isDbReady, isAppLockEnabled, isAppLocked, setAppLocked, authenticate]);

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

    const extractTokensFromUrl = useCallback((url: string) => {
        const hash = url.split('#')[1];
        if (!hash) return {};

        const params = new URLSearchParams(hash);

        return {
            access_token: params.get('access_token'),
            refresh_token: params.get('refresh_token'),
            type: params.get('type'),
        };
    }, []);

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
    }, [extractTokensFromUrl]);

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
                            >
                                <Stack.Protected guard={!onboardingCompleted}>
                                    <Stack.Screen name='onboarding' />
                                </Stack.Protected>
                                <Stack.Protected guard={onboardingCompleted}>
                                    <Stack.Screen name='index' />
                                    <Stack.Screen name='editor' />
                                    <Stack.Screen name='menu' />
                                    <Stack.Screen name='register' />
                                    <Stack.Screen name='reset-password' />
                                </Stack.Protected>
                            </Stack>
                            {isAppLocked && isAppLockEnabled && <AppLockOverlay />}
                        </ToastProvider>
                    </BottomSheetProvider>
                </KeyboardProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
