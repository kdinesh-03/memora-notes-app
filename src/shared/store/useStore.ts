import { create } from 'zustand';
import { Note } from '../../features/domain/entities/Note';

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
    };
    setSearchQuery: (query: string) => void;
    setNotes: (notes: Note[]) => void;
    appendNotes: (newNotes: Note[]) => void;
    addNote: (note: Note) => void;
    updateNote: (note: Note) => void;
    removeNote: (id: string) => void;
    reorderNotes: (notes: Note[]) => void;
    setLoading: (loading: boolean) => void;
    setHasMore: (hasMore: boolean) => void;
    setTabCounts: (counts: { all: number; pinned: number; notes: number; reminders: number }) => void;
}

const sortNotes = (a: Note, b: Note) => {
    const pinA = a.is_pinned ?? 0;
    const pinB = b.is_pinned ?? 0;
    if (pinA !== pinB) {
        return pinB - pinA;
    }
    return b.updated_at - a.updated_at;
};

export const useStore = create<AppState>((set) => ({
    notes: [],
    loading: false,
    hasMore: true,
    searchQuery: '',
    tabCounts: { all: 0, pinned: 0, notes: 0, reminders: 0 },
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
    reorderNotes: (notes) => set({ notes }),
    setLoading: (loading) => set({ loading }),
    setHasMore: (hasMore) => set({ hasMore }),
    setTabCounts: (counts) => set({ tabCounts: counts }),
}));
