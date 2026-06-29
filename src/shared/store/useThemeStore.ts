import { storage } from '@/infrastructure/mmkv/storage';
import { create } from 'zustand';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    loadTheme: () => void;
}

const THEME_STORAGE_KEY = 'app_theme_preference';

export const useThemeStore = create<ThemeState>((set) => ({
    theme: 'system',

    setTheme: (theme: ThemeMode) => {
        set({ theme });
        try {
            storage.set(THEME_STORAGE_KEY, theme);
        } catch (e) {
            console.log('Failed to save theme preference:', e);
        }
    },

    loadTheme: () => {
        try {
            const stored = storage.getString(THEME_STORAGE_KEY);
            if (stored === 'light' || stored === 'dark' || stored === 'system') {
                set({ theme: stored });
            }
        } catch (e) {
            console.log('Failed to load theme preference:', e);
        }
    },
}));
