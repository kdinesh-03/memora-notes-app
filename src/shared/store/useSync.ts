import { create } from 'zustand';
import { startSync, SyncResult } from '../../infrastructure/sync/syncEngine';
import { getQueueCount } from '../../features/data/datasource/syncQueue';

export type SyncStatusType = 'idle' | 'syncing' | 'synced' | 'failed';

interface SyncState {
    syncStatus: SyncStatusType;
    lastSyncAt: number | null;
    pendingCount: number;
    lastResult: SyncResult | null;
    triggerSync: (userId: string) => Promise<SyncResult | null>;
    setSyncStatus: (status: SyncStatusType) => void;
    updatePendingCount: () => Promise<void>;
}

export const useSync = create<SyncState>((set, get) => ({
    syncStatus: 'idle',
    lastSyncAt: null,
    pendingCount: 0,
    lastResult: null,

    triggerSync: async (userId: string) => {
        const { syncStatus } = get();
        if (syncStatus === 'syncing') return null;

        set({ syncStatus: 'syncing' });

        try {
            const result = await startSync(userId);
            set({
                syncStatus: 'synced',
                lastSyncAt: Date.now(),
                lastResult: result,
                pendingCount: 0,
            });
            return result;
        } catch (error) {
            console.log('Sync failed:', error);
            set({ syncStatus: 'failed' });
            return null;
        }
    },

    setSyncStatus: (status) => set({ syncStatus: status }),

    updatePendingCount: async () => {
        try {
            const count = await getQueueCount();
            set({ pendingCount: count });
        } catch {
            // silently ignore
        }
    },
}));
