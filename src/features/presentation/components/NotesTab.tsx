import { useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Note } from '../../domain/entities/Note';
import { NoteItem } from './NoteItem';
import { SwipeableNote } from './SwipeableNote';
import { fonts } from '../../../shared/utils/fonts';
import { useStore } from '../../../shared/store/useStore';

interface NotesTabProps {
    notes: Note[];
    loading: boolean;
    onDelete: (id: string, type: 'note' | 'reminder') => void;
    onTogglePin: (note: Note) => void;
}

export const NotesTab = ({
    notes,
    loading,
    onDelete,
    onTogglePin,
}: NotesTabProps) => {
    const { bottom } = useSafeAreaInsets();
    const { reorderNotes } = useStore();

    const handlePress = useCallback((id: string) => {
        router.push({ pathname: '/editor', params: { id } });
    }, []);

    const handleDragEnd = useCallback(
        ({ data }: { data: Note[] }) => {
            reorderNotes(data);
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
                <ActivityIndicator size={20} />
            );
        }
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                    No notes found
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
            contentContainerStyle={[
                styles.listContent,
                { paddingBottom: bottom },
            ]}
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
