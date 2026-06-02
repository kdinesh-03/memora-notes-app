import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
    id: 'notes-app-storage',
});

export const MMKVKeys = {
    LAST_CURSOR: 'last_notes_cursor',
    USER_PREFERENCES: 'user_preferences',
} as const;
