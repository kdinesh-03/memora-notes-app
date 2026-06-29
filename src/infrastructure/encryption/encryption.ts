import * as Crypto from 'expo-crypto';
import aesjs from 'aes-js';
import { getSecure, setSecure, SecureKeys } from '../secure-store/secureStore';

/**
 * Generate a new random 256-bit encryption key and return as hex string.
 */
export const generateEncryptionKey = async (): Promise<string> => {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return aesjs.utils.hex.fromBytes(Array.from(randomBytes));
};

/**
 * Get the existing encryption key from SecureStore, or create a new one.
 * Returns the key as a Uint8Array (32 bytes).
 */
export const getOrCreateEncryptionKey = async (): Promise<Uint8Array> => {
    let keyHex = await getSecure(SecureKeys.ENCRYPTION_KEY);
    if (!keyHex) {
        keyHex = await generateEncryptionKey();
        await setSecure(SecureKeys.ENCRYPTION_KEY, keyHex);
    }
    return new Uint8Array(aesjs.utils.hex.toBytes(keyHex));
};

/**
 * Encrypt plaintext using AES-256-CTR mode.
 * Returns hex string: IV (32 hex chars) + ciphertext (variable length).
 */
export const encrypt = async (plaintext: string): Promise<string> => {
    if (!plaintext) return plaintext;
    const key = await getOrCreateEncryptionKey();

    // Generate random 16-byte IV
    const ivBytes = await Crypto.getRandomBytesAsync(16);
    const iv = Array.from(ivBytes);

    const textBytes = aesjs.utils.utf8.toBytes(plaintext);
    const aesCtr = new aesjs.ModeOfOperation.ctr(Array.from(key), new aesjs.Counter(iv));
    const encryptedBytes = aesCtr.encrypt(textBytes);

    const ivHex = aesjs.utils.hex.fromBytes(iv);
    const cipherHex = aesjs.utils.hex.fromBytes(Array.from(encryptedBytes));

    return `ENC:${ivHex}${cipherHex}`;
};

/**
 * Decrypt an AES-256-CTR encrypted hex string back to plaintext.
 * Expects format: "ENC:" + IV (32 hex chars) + ciphertext hex.
 */
export const decrypt = async (ciphertext: string): Promise<string> => {
    if (!ciphertext || !isEncrypted(ciphertext)) return ciphertext;

    const key = await getOrCreateEncryptionKey();
    const hexData = ciphertext.slice(4); // Remove "ENC:" prefix

    const ivHex = hexData.slice(0, 32);
    const cipherHex = hexData.slice(32);

    const iv = aesjs.utils.hex.toBytes(ivHex);
    const encryptedBytes = aesjs.utils.hex.toBytes(cipherHex);

    const aesCtr = new aesjs.ModeOfOperation.ctr(Array.from(key), new aesjs.Counter(iv));
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);

    return aesjs.utils.utf8.fromBytes(Array.from(decryptedBytes));
};

/**
 * Check if a string is encrypted (has the ENC: prefix).
 */
export const isEncrypted = (text: string): boolean => {
    return typeof text === 'string' && text.startsWith('ENC:');
};
