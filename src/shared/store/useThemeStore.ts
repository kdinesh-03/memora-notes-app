import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '@/infrastructure/secure-store/zustandStorage';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'system',
            setTheme: (theme: ThemeMode) => set({ theme }),
            loadTheme: async () => {
                if (!useThemeStore.persist.hasHydrated()) {
                    await useThemeStore.persist.rehydrate();
                }
            },
        }),
        {
            name: 'app_theme_preference',
            storage: createJSONStorage(() => secureStorage),
        }
    )
);
