import * as SecureStore from 'expo-secure-store';

export const SecureKeys = {
    ENCRYPTION_KEY: 'memora_encryption_key',
    PIN_HASH: 'memora_pin_hash',
} as const;

export const setSecure = async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
};

export const getSecure = async (key: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(key);
};

export const removeSecure = async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
};
