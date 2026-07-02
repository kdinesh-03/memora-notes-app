import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'memora_device_id';

let cachedDeviceId: string | null = null;

export const getDeviceId = async (): Promise<string> => {
    if (cachedDeviceId) return cachedDeviceId;

    try {
        let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
        if (!deviceId) {
            deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
        }
        cachedDeviceId = deviceId;
        return deviceId;
    } catch {
        const fallbackId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        cachedDeviceId = fallbackId;
        return fallbackId;
    }
};
