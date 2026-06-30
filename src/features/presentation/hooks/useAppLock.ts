import { useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export const useAppLock = () => {
    const [isLocked, setIsLocked] = useState(true);
    const [isEnabled, setIsEnabled] = useState(false);

    const checkBiometricSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        return compatible && enrolled;
    };

    const authenticate = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock App',
                fallbackLabel: 'Use Passcode',
                disableDeviceFallback: false,
            });

            if (result.success) {
                setIsLocked(false);
            } else {
                setIsLocked(true);
            }
        } catch (e) {
            setIsLocked(true);
        }
    };

    return {
        isLocked,
        isEnabled,
        setIsEnabled,
        authenticate,
        checkBiometricSupport,
    };
};
