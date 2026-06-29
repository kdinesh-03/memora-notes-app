import * as Crypto from 'expo-crypto';
import { getDb } from '../../../infrastructure/database/sqlite';

export interface SyncQueueItem {
    id: string;
    entity_id: string;
    entity_type: string;
    action: 'create' | 'update' | 'delete';
    payload: string | null;
    status: 'pending' | 'processing' | 'failed';
    retries: number;
    created_at: number;
}

export const addToSyncQueue = async (
    entityId: string,
    action: 'create' | 'update' | 'delete',
    payload?: any
): Promise<void> => {
    const db = await getDb();
    const id = Crypto.randomUUID();
    const now = Date.now();

    // Remove any existing pending entries for the same entity to avoid duplicates
    await db.runAsync("DELETE FROM sync_queue WHERE entity_id = ? AND status = 'pending'", [
        entityId,
    ]);

    await db.runAsync(
        `INSERT INTO sync_queue (id, entity_id, entity_type, action, payload, status, retries, created_at)
         VALUES (?, ?, 'note', ?, ?, 'pending', 0, ?)`,
        [id, entityId, action, payload ? JSON.stringify(payload) : null, now]
    );
};

export const getPendingItems = async (): Promise<SyncQueueItem[]> => {
    const db = await getDb();
    const result = await db.getAllAsync<SyncQueueItem>(
        "SELECT * FROM sync_queue WHERE status IN ('pending', 'failed') AND retries < 5 ORDER BY created_at ASC"
    );
    return result;
};

export const markProcessing = async (id: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync("UPDATE sync_queue SET status = 'processing' WHERE id = ?", [id]);
};

export const markCompleted = async (id: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
};

export const markFailed = async (id: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync(
        "UPDATE sync_queue SET status = 'failed', retries = retries + 1 WHERE id = ?",
        [id]
    );
};

export const clearCompleted = async (): Promise<void> => {
    const db = await getDb();
    await db.runAsync("DELETE FROM sync_queue WHERE status = 'completed'");
};

export const getQueueCount = async (): Promise<number> => {
    const db = await getDb();
    const result = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sync_queue WHERE status IN ('pending', 'failed')"
    );
    return result?.count ?? 0;
};
