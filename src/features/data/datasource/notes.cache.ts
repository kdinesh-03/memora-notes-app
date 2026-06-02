import { MMKVKeys, storage } from '../../../infrastructure/mmkv/storage';

export const setLastCursor = (cursor: number) => {
    storage.set(MMKVKeys.LAST_CURSOR, cursor);
};

export const getLastCursor = (): number | undefined => {
    return storage.getNumber(MMKVKeys.LAST_CURSOR);
};

export const clearLastCursor = () => {
    storage.remove(MMKVKeys.LAST_CURSOR);
};
