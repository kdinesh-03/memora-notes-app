import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

export const palette = {
    light: {
        background: '#F2F2F7',
        cardBackground: '#FFFFFF',
        text: '#000000',
        textSecondary: '#3C3C43',
        textTertiary: '#8E8E93',
        border: '#E5E5EA',
        borderDark: '#C7C7CC',
        accent: '#007AFF',
        accentLight: '#007AFF10',
        error: '#FF3B30',
        errorLight: '#FF3B3015',
        inputBackground: '#FFFFFF',
        numpadKey: '#E5E5EA',
        numpadKeyPressed: '#D1D1D6',
        tabCountBadge: '#E5E5EA',
        tabCountBadgeActive: '#007AFF15',
        toastBorder: '#E5E5EA',
        saveButtonBg: '#FFFFFF',
        micIconBg: '#E5E5EA',
    },
    dark: {
        background: '#000000',
        cardBackground: '#1C1C1E',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        textTertiary: '#8E8E93',
        border: '#2C2C2E',
        borderDark: '#333333',
        accent: '#007AFF',
        accentLight: '#007AFF20',
        error: '#FF453A',
        errorLight: '#FF453A15',
        inputBackground: '#1C1C1E',
        numpadKey: '#2C2C2E',
        numpadKeyPressed: '#48484A',
        tabCountBadge: '#2C2C2E',
        tabCountBadgeActive: '#007AFF25',
        toastBorder: '#333333',
        saveButtonBg: '#1C1C1E',
        micIconBg: '#1C1C1E',
    },
};

export const useColors = () => {
    const systemScheme = useColorScheme();
    const { theme } = useThemeStore();

    const effectiveScheme = theme === 'system' ? systemScheme : theme;
    return effectiveScheme === 'light' ? palette.light : palette.dark;
};

export const useIsDark = () => {
    const systemScheme = useColorScheme();
    const { theme } = useThemeStore();
    const effectiveScheme = theme === 'system' ? systemScheme : theme;
    return effectiveScheme === 'dark' || effectiveScheme == null;
};
