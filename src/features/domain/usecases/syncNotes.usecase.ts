import { startSync, SyncResult } from '../../../infrastructure/sync/syncEngine';

export const syncNotesUseCase = async (userId: string): Promise<SyncResult> => {
    return startSync(userId);
};
