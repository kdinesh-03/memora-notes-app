import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
    id: 'memora-notes-app',
});

export const MMKVKeys = {
    LAST_CURSOR: 'last_notes_cursor',
} as const;
