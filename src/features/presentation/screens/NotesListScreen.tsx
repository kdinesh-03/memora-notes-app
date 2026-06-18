import { router } from 'expo-router';
import debounce from 'lodash.debounce';
import { Search, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../../shared/store/useStore';
import { fonts } from '../../../shared/utils/fonts';
import { useNotes } from '../hooks/useNotes';
import { NoteItem } from '../components/NoteItem';
import { SwipeableNote } from '../components/SwipeableNote';

export const NotesListScreen = () => {
    const { 
        notes, 
        refreshing, 
        onRefresh, 
        loading, 
        handleDelete, 
        handleTogglePin 
    } = useNotes();
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

    // Partition the notes for unified sections
    const pinnedNotes = notes.filter(n => n.is_pinned === 1);
    const unpinnedNotes = notes.filter(n => n.is_pinned !== 1);

    const upcomingReminders = unpinnedNotes.filter(n => n.type === 'reminder' && n.reminder_at && n.reminder_at > Date.now());
    const recentNotes = unpinnedNotes.filter(n => !(n.type === 'reminder' && n.reminder_at && n.reminder_at > Date.now()));

    const handlePress = (id: string) => {
        router.push({ pathname: '/editor', params: { id } });
    };

    const isSearching = searchQuery.trim().length > 0;

    return (
        <View style={[styles.container, darkStyles.container, { paddingTop: top }]}>
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

            <ScrollView
                contentContainerStyle={[styles.listContent, { paddingBottom: bottom }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
                }
            >
                {loading && notes.length === 0 ? (
                    <ActivityIndicator size={20} style={{ margin: 20 }} />
                ) : isSearching ? (
                    notes.length > 0 ? (
                        notes.map(note => (
                            <SwipeableNote key={note.id} note={note} onDelete={handleDelete}>
                                <NoteItem
                                    note={note}
                                    onPress={handlePress}
                                    onTogglePin={handleTogglePin}
                                    darkStyles={darkStyles}
                                />
                            </SwipeableNote>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={[darkStyles.text, fonts.fontRegular]}>No search results found.</Text>
                        </View>
                    )
                ) : (
                    <>
                        {/* Pinned Section */}
                        {pinnedNotes.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, darkStyles.sectionTitle]}>Pinned</Text>
                                </View>
                                {pinnedNotes.map(note => (
                                    <SwipeableNote key={note.id} note={note} onDelete={handleDelete}>
                                        <NoteItem
                                            note={note}
                                            onPress={handlePress}
                                            onTogglePin={handleTogglePin}
                                            darkStyles={darkStyles}
                                        />
                                    </SwipeableNote>
                                ))}
                            </View>
                        )}

                        {/* Upcoming Reminders Section */}
                        {upcomingReminders.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, darkStyles.sectionTitle]}>Upcoming Reminders</Text>
                                </View>
                                {upcomingReminders.map(note => (
                                    <SwipeableNote key={note.id} note={note} onDelete={handleDelete}>
                                        <NoteItem
                                            note={note}
                                            onPress={handlePress}
                                            onTogglePin={handleTogglePin}
                                            darkStyles={darkStyles}
                                        />
                                    </SwipeableNote>
                                ))}
                            </View>
                        )}

                        {/* Recent Notes Section */}
                        {recentNotes.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, darkStyles.sectionTitle]}>Recent Notes</Text>
                                </View>
                                {recentNotes.map(note => (
                                    <SwipeableNote key={note.id} note={note} onDelete={handleDelete}>
                                        <NoteItem
                                            note={note}
                                            onPress={handlePress}
                                            onTogglePin={handleTogglePin}
                                            darkStyles={darkStyles}
                                        />
                                    </SwipeableNote>
                                ))}
                            </View>
                        )}

                        {notes.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={[darkStyles.text, fonts.fontRegular]}>No notes found. Create one!</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
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
        marginBottom: 16,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16, ...fonts.fontRegular },
    clearButton: { padding: 4 },
    listContent: { flexGrow: 1 },
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
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionContainer: {
        marginBottom: 12
    },
    sectionHeader: {
        backgroundColor: '#000',
        paddingVertical: 12
    },
    sectionTitle: {
        fontSize: 14,
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
    sectionTitle: { color: '#007AFF' },
});
