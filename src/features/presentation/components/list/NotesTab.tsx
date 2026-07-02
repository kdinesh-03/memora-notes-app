import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Note } from '../../../domain/entities/Note';
import { NoteItem } from './NoteItem';
import { SwipeableNote } from './SwipeableNote';
import { fonts } from '../../../../shared/utils/fonts';

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

    const handlePress = useCallback(
        async (id: string) => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onNotePress(id);
        },
        [onNotePress]
    );

    const renderItem = useCallback(
        ({ item }: { item: Note }) => {
            return (
                <SwipeableNote note={item} onDelete={onDelete}>
                    <NoteItem note={item} onPress={handlePress} onTogglePin={onTogglePin} />
                </SwipeableNote>
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
    }, [loading, notes.length, activeTab]);

    return (
        <FlatList
            data={notes}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={[styles.listContent, { paddingBottom: bottom }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        flexGrow: 1,
        // paddingHorizontal: 16,
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
