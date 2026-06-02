import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import debounce from 'lodash.debounce';
import { Bell, Search, Trash2, X } from 'lucide-react-native';
import { memo, useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../../shared/store/useStore';
import { fonts } from '../../../shared/utils/fonts';
import { Note } from '../../domain/entities/Note';
import { useNotes } from '../hooks/useNotes';

type ListItem =
    | { type: 'header', title: string }
    | { type: 'note', data: Note };

const NoteItem = memo(
    ({
        note,
        onPress,
        onDelete,
        onToggleReminder,
        darkStyles,
    }: {
        note: Note;
        onPress: (id: string) => void;
        onDelete: (id: string, type: 'note' | 'reminder') => void;
        onToggleReminder: (note: Note) => void;
        darkStyles: any;
    }) => (
        <Pressable
            style={[styles.noteCard, darkStyles.card]}
            onPress={() => onPress(note.id)}
        >
            <View style={styles.titleContainer}>
                <Text style={[styles.noteTitle, darkStyles.text]} numberOfLines={1}>
                    {note.title || 'Untitled'}
                </Text>
                {note.type === 'reminder' && (
                    <Switch
                        value={note.notify || false}
                        onValueChange={() => onToggleReminder(note)}
                        trackColor={{ false: '#333', true: '#007AFF' }}
                        thumbColor={note.notify ? '#FFF' : '#AAA'}
                    />
                )}
            </View>
            <Text style={[styles.noteSnippet, darkStyles.snippet]} numberOfLines={2}>
                {note.content || 'No content'}
            </Text>
            <View style={styles.footer}>
                <View style={styles.footerLeft}>
                    {note.type === 'reminder' ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Bell size={14} color="#FFD60A" fill="#FFD60A" />
                            {note.reminder_at && (
                                <Text style={[styles.noteDate, { marginLeft: 6, color: '#FFD60A' }]}>
                                    {new Date(note.reminder_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </Text>
                            )}
                        </View>
                    ) : (
                        <Text style={styles.noteDate}>
                            {new Date(note.updated_at).toLocaleDateString()}
                        </Text>
                    )}
                </View>
                <Pressable
                    onPress={() => onDelete(note.id, note.type)}
                    hitSlop={10}
                >
                    <Trash2 size={16} color="#FF3B30" />
                </Pressable>
            </View>
        </Pressable>
    )
);

export const NotesListScreen = () => {
    const { notes, refreshing, onRefresh, onLoadMore, loading, handleDelete, handleToggleReminder } = useNotes();
    const { searchQuery, setSearchQuery } = useStore();
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const { bottom, top } = useSafeAreaInsets();

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            setSearchQuery(query);
        }, 500),
        []
    );

    const handleSearchChange = (text: string) => {
        setLocalSearch(text);
        debouncedSearch(text);
    };

    const handleClearSearch = () => {
        setLocalSearch('');
        setSearchQuery('');
    };

    const reminders = notes.filter(n => n.type === 'reminder');
    const regularNotes = notes.filter(n => n.type === 'note');

    const listData: ListItem[] = [];
    if (reminders.length > 0) {
        listData.push({ type: 'header', title: 'Reminders' });
        listData.push(...reminders.map(n => ({ type: 'note' as const, data: n })));
    }
    if (regularNotes.length > 0) {
        listData.push({ type: 'header', title: 'Recent Notes' });
        listData.push(...regularNotes.map(n => ({ type: 'note' as const, data: n })));
    }

    return (
        <View style={[styles.container, darkStyles.container, { paddingTop: top }]}>
            <FlashList
                data={listData}
                keyExtractor={(item) => item.type === 'header' ? `header-${item.title}` : `note-${item.data.id}`}
                renderItem={({ item }) => {
                    if (item.type === 'header') {
                        return (
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, darkStyles.sectionTitle]}>{item.title}</Text>
                            </View>
                        );
                    }
                    return (
                        <NoteItem
                            note={item.data}
                            darkStyles={darkStyles}
                            onPress={(id) => router.push({ pathname: '/editor', params: { id } })}
                            onDelete={handleDelete}
                            onToggleReminder={handleToggleReminder}
                        />
                    );
                }}
                onRefresh={onRefresh}
                refreshing={refreshing}
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.5}
                keyboardShouldPersistTaps="handled"
                getItemType={(item) => item.type}
                ListHeaderComponent={(
                    <>
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, darkStyles.text]}>My Notes</Text>
                            <Pressable style={styles.fab} onPress={() => router.push('/editor')}>
                                <Text style={styles.addText}>Add</Text>
                            </Pressable>
                        </View>
                        <View style={[styles.searchBar, darkStyles.searchBar]}>
                            <Search size={20} color={'#aaa'} />
                            <TextInput
                                placeholder="Search notes..."
                                placeholderTextColor={'#aaa'}
                                style={[styles.searchInput, darkStyles.text]}
                                value={localSearch}
                                onChangeText={handleSearchChange}
                                returnKeyType="search"
                            />
                            {localSearch.length > 0 && (
                                <Pressable onPress={handleClearSearch} style={styles.clearButton}>
                                    <X size={18} color={'#aaa'} />
                                </Pressable>
                            )}
                        </View>
                    </>
                )}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Text style={[darkStyles.text, fonts.fontRegular]}>No notes found. Create one!</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    loading && notes.length > 0 ? (
                        <ActivityIndicator size={20} style={{ margin: 20 }} />
                    ) : null
                }
                contentContainerStyle={[styles.listContent, { paddingBottom: bottom }]}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerTitle: { fontSize: 28, ...fonts.fontBold },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16, ...fonts.fontRegular },
    clearButton: { padding: 4 },
    listContent: { flexGrow: 1 },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    noteCard: {
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 12,
        gap: 2
    },
    noteTitle: { flex: 1, fontSize: 18, ...fonts.fontSemiBold, marginBottom: 4 },
    noteSnippet: { fontSize: 14, ...fonts.fontRegular, marginBottom: 8 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerLeft: { flexDirection: 'row', alignItems: 'center' },
    noteDate: { fontSize: 12, color: '#999', letterSpacing: 0.2, ...fonts.fontMedium, textTransform: 'uppercase' },
    fab: {
        backgroundColor: '#1c1c1e',
        paddingLeft: 16,
        paddingRight: 18,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        backgroundColor: '#000',
        paddingVertical: 16
    },
    sectionTitle: {
        fontSize: 18,
        ...fonts.fontBold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    addText: {
        color: '#007AFF',
        fontSize: 16,
        ...fonts.fontSemiBold,
    },
});

const darkStyles = StyleSheet.create({
    container: { backgroundColor: '#000' },
    text: { color: '#FFF' },
    searchBar: { backgroundColor: '#1C1C1E' },
    card: { backgroundColor: '#1C1C1E' },
    snippet: { color: '#AAA' },
    sectionTitle: { color: '#007AFF' },
});
