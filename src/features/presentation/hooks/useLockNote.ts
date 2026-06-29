import * as Crypto from 'expo-crypto';
import { getSecure, setSecure, SecureKeys } from '../../../infrastructure/secure-store/secureStore';
import { toggleNoteLock } from '../../data/datasource/notes';
import { addToSyncQueue } from '../../data/datasource/syncQueue';
import { Note } from '../../domain/entities/Note';

/**
 * Check if a PIN has been set up for a specific note.
 */
export const hasPin = async (noteId: string): Promise<boolean> => {
    const hash = await getSecure(`${SecureKeys.PIN_HASH}_${noteId}`);
    return hash !== null;
};

/**
 * Set up a new PIN for a specific note by hashing it and storing in SecureStore.
 */
export const setupPin = async (noteId: string, pin: string): Promise<void> => {
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
    await setSecure(`${SecureKeys.PIN_HASH}_${noteId}`, hash);
};

/**
 * Verify a PIN against the stored hash for a specific note.
 */
export const verifyPin = async (noteId: string, pin: string): Promise<boolean> => {
    const storedHash = await getSecure(`${SecureKeys.PIN_HASH}_${noteId}`);
    if (!storedHash) return false;

    const inputHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
    return inputHash === storedHash;
};

/**
 * Toggle the lock state of a note.
 */
export const handleToggleLock = async (noteId: string, currentLockState: number): Promise<Note> => {
    const nextLocked = currentLockState === 1 ? 0 : 1;
    const updated = await toggleNoteLock(noteId, nextLocked);
    await addToSyncQueue(noteId, 'update');
    return updated;
};
