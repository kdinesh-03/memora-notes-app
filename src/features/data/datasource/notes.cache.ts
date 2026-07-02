import * as SecureStore from 'expo-secure-store';

const LAST_CURSOR_KEY = 'last_notes_cursor';

export const setLastCursor = async (cursor: number): Promise<void> => {
    try {
        await SecureStore.setItemAsync(LAST_CURSOR_KEY, String(cursor));
    } catch {
        // ignore
    }
};

export const getLastCursor = async (): Promise<number | undefined> => {
    try {
        const val = await SecureStore.getItemAsync(LAST_CURSOR_KEY);
        return val ? Number(val) : undefined;
    } catch {
        return undefined;
    }
};

export const clearLastCursor = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(LAST_CURSOR_KEY);
    } catch {
        // ignore
    }
};
