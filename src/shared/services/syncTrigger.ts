import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../store/useAuth';
import { useNoteStore } from '../store/useNoteStore';

export const triggerSyncIfAvailable = async (): Promise<void> => {
    const { isAuthenticated, user } = useAuth.getState();
    if (!isAuthenticated || !user?.id) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return;

    const { syncStatus, triggerSync } = useNoteStore.getState();
    if (syncStatus === 'syncing') return;

    try {
        await triggerSync(user.id);
    } catch (error) {
        console.log('Auto sync failed:', error);
    }
};
