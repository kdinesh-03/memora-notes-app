import type { StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export const secureStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(name);
        } catch {
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(name, value);
        } catch (e) {
            console.log(`Failed to save ${name}:`, e);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(name);
        } catch {
            // ignore
        }
    },
};
