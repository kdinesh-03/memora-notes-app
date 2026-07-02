import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '@/infrastructure/secure-store/zustandStorage';
import * as LocalAuthentication from 'expo-local-authentication';

interface AppLockState {
    isAppLockEnabled: boolean;
    isAppLocked: boolean;
    isAuthenticating: boolean;
    setAppLockEnabled: (enabled: boolean) => void;
    setAppLocked: (locked: boolean) => void;
    loadAppLockSettings: () => Promise<void>;
    authenticate: () => Promise<boolean>;
    checkBiometricSupport: () => Promise<boolean>;
}

export const useAppLock = create<AppLockState>()(
    persist(
        (set, get) => ({
            isAppLockEnabled: false,
            isAppLocked: false,
            isAuthenticating: false,

            setAppLockEnabled: (enabled: boolean) => {
                set({ isAppLockEnabled: enabled });
            },

            setAppLocked: (locked: boolean) => {
                set({ isAppLocked: locked });
            },

            loadAppLockSettings: async () => {
                if (!useAppLock.persist.hasHydrated()) {
                    await useAppLock.persist.rehydrate();
                }
                const state = get();
                if (state.isAppLockEnabled) {
                    set({ isAppLocked: true });
                }
            },

            checkBiometricSupport: async () => {
                try {
                    const compatible = await LocalAuthentication.hasHardwareAsync();
                    const enrolled = await LocalAuthentication.isEnrolledAsync();
                    const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
                    return (
                        compatible &&
                        (enrolled || securityLevel !== LocalAuthentication.SecurityLevel.NONE)
                    );
                } catch (e) {
                    console.log('Check biometric support error:', e);
                    return false;
                }
            },

            authenticate: async () => {
                const { isAuthenticating } = get();
                if (isAuthenticating) return false;

                try {
                    const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
                    if (securityLevel === LocalAuthentication.SecurityLevel.NONE) {
                        set({ isAppLocked: false, isAuthenticating: false });
                        return true;
                    }

                    set({ isAuthenticating: true });

                    const result = await LocalAuthentication.authenticateAsync({
                        promptMessage: 'Unlock Memora',
                        fallbackLabel: 'Use Passcode',
                        disableDeviceFallback: false,
                    });

                    if (result.success) {
                        set({ isAppLocked: false, isAuthenticating: false });
                        return true;
                    } else {
                        set({ isAuthenticating: false });
                        return false;
                    }
                } catch (e) {
                    console.log('App authentication error:', e);
                    set({ isAuthenticating: false });
                    return false;
                }
            },
        }),
        {
            name: 'app_lock_preference',
            storage: createJSONStorage(() => secureStorage),
            partialize: (state) => ({ isAppLockEnabled: state.isAppLockEnabled }),
        }
    )
);
