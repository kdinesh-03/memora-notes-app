import { useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Note } from '../../../domain/entities/Note';
import { NoteItem } from './NoteItem';
import { SwipeableNote } from './SwipeableNote';
import { fonts } from '../../../../shared/utils/fonts';
import { useNoteStore } from '@/shared/store/useNoteStore';
import { updateNotesOrder } from '../../../data/datasource/notes';
import { triggerSyncIfAvailable } from '../../../../shared/services/syncTrigger';

interface NotesTabProps {
    notes: Note[];
    loading: boolean;
    onDelete: (id: string, type: 'note' | 'reminder') => void;
    onTogglePin: (note: Note) => void;
    onNotePress: (id: string) => void;
    activeTab: string;
}

export const NotesTab = ({
    notes,
    loading,
    onDelete,
    onTogglePin,
    onNotePress,
    activeTab,
}: NotesTabProps) => {
    const { bottom } = useSafeAreaInsets();
    const { reorderNotes } = useNoteStore();

    const handlePress = useCallback(
        async (id: string) => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onNotePress(id);
        },
        [onNotePress]
    );

    const handleDragEnd = useCallback(
        ({ data }: { data: Note[] }) => {
            reorderNotes(data);
            const orderedIds = data.map((n) => n.id);
            updateNotesOrder(orderedIds).catch((err) =>
                console.log('Failed to persist reorder:', err)
            );
            triggerSyncIfAvailable();
        },
        [reorderNotes]
    );

    const renderItem = useCallback(
        ({ item, drag, isActive }: RenderItemParams<Note>) => {
            return (
                <ScaleDecorator activeScale={1.05}>
                    <SwipeableNote note={item} onDelete={onDelete} enabled={!isActive}>
                        <NoteItem
                            note={item}
                            onPress={handlePress}
                            onTogglePin={onTogglePin}
                            onLongPress={drag}
                            isActive={isActive}
                        />
                    </SwipeableNote>
                </ScaleDecorator>
            );
        },
        [onDelete, onTogglePin, handlePress]
    );

    const keyExtractor = useCallback((item: Note) => item.id, []);

    const ListEmptyComponent = useMemo(() => {
        if (loading && notes.length === 0) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size={20} color={'#007AFF'} />
                </View>
            );
        }
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                    No{' '}
                    {activeTab === 'all'
                        ? 'notes/reminders'
                        : activeTab === 'pinned'
                          ? 'pinned notes/reminders'
                          : activeTab === 'reminders'
                            ? 'reminders'
                            : 'notes'}{' '}
                    found
                </Text>
            </View>
        );
    }, [loading, notes.length]);

    return (
        <DraggableFlatList
            data={notes}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onDragEnd={handleDragEnd}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={[styles.listContent, { paddingBottom: bottom }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            activationDistance={15}
            containerStyle={{ flexGrow: 1 }}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    emptyState: {
        flex: 1,
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#8E8E93',
        fontSize: 15,
        ...fonts.fontRegular,
    },
});
