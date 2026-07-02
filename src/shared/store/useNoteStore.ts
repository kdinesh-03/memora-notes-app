import { create } from 'zustand';
import { Note } from '../../features/domain/entities/Note';
import { startSync, SyncResult } from '../../infrastructure/sync/syncEngine';
import { getQueueCount } from '../../features/data/datasource/syncQueue';

export type SyncStatusType = 'idle' | 'syncing' | 'synced' | 'failed';

interface AppState {
    notes: Note[];
    loading: boolean;
    hasMore: boolean;
    searchQuery: string;
    tabCounts: {
        all: number;
        pinned: number;
        notes: number;
        reminders: number;
        locked: number;
    };
    syncStatus: SyncStatusType;
    lastSyncAt: number | null;
    pendingCount: number;
    lastResult: SyncResult | null;
    setSearchQuery: (query: string) => void;
    setNotes: (notes: Note[]) => void;
    appendNotes: (newNotes: Note[]) => void;
    addNote: (note: Note) => void;
    updateNote: (note: Note) => void;
    removeNote: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setHasMore: (hasMore: boolean) => void;
    setTabCounts: (counts: {
        all: number;
        pinned: number;
        notes: number;
        reminders: number;
        locked: number;
    }) => void;
    toggleNoteLock: (id: string, isLocked: number) => void;
    triggerSync: (userId: string) => Promise<SyncResult | null>;
    setSyncStatus: (status: SyncStatusType) => void;
    updatePendingCount: () => Promise<void>;
}

const sortNotes = (a: Note, b: Note) => {
    const pinA = a.is_pinned ?? 0;
    const pinB = b.is_pinned ?? 0;
    if (pinA !== pinB) {
        return pinB - pinA;
    }
    return b.updated_at - a.updated_at;
};

export const useNoteStore = create<AppState>((set, get) => ({
    notes: [],
    loading: false,
    hasMore: true,
    searchQuery: '',
    tabCounts: { all: 0, pinned: 0, notes: 0, reminders: 0, locked: 0 },
    syncStatus: 'idle',
    lastSyncAt: null,
    pendingCount: 0,
    lastResult: null,

    setSearchQuery: (query) => set({ searchQuery: query }),
    setNotes: (notes) => set({ notes: [...notes].sort(sortNotes) }),
    appendNotes: (newNotes) =>
        set((state) => ({
            notes: [...state.notes, ...newNotes].sort(sortNotes),
        })),
    addNote: (note) =>
        set((state) => ({
            notes: [note, ...state.notes].sort(sortNotes),
        })),
    updateNote: (note) =>
        set((state) => ({
            notes: state.notes.map((n) => (n.id === note.id ? note : n)).sort(sortNotes),
        })),
    removeNote: (id) =>
        set((state) => ({
            notes: state.notes.filter((n) => n.id !== id),
        })),
    setLoading: (loading) => set({ loading }),
    setHasMore: (hasMore) => set({ hasMore }),
    setTabCounts: (counts) => set({ tabCounts: counts }),
    toggleNoteLock: (id, isLocked) =>
        set((state) => ({
            notes: state.notes
                .map((n) =>
                    n.id === id ? { ...n, is_locked: isLocked, updated_at: Date.now() } : n
                )
                .sort(sortNotes),
        })),

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
