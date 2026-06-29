import { storage } from '../mmkv/storage';

const DEVICE_ID_KEY = 'memora_device_id';

let cachedDeviceId: string | null = null;

export const getDeviceId = (): string => {
    if (cachedDeviceId) return cachedDeviceId;

    let deviceId = storage.getString(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        storage.set(DEVICE_ID_KEY, deviceId);
    }
    cachedDeviceId = deviceId;
    return deviceId;
};
