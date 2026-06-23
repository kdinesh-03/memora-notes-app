import { router } from 'expo-router';
import debounce from 'lodash.debounce';
import { Plus, Search, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Button,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { TabView, TabBar, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../../shared/store/useStore';
import { fonts } from '../../../shared/utils/fonts';
import { useNotes } from '../hooks/useNotes';
import { NotesTab } from '../components/list/NotesTab';
import { Note } from '../../domain/entities/Note';
import { getNotesCountsUseCase } from '../../domain/usecases/getNotesCounts.usecase';

const TAB_BAR_HEIGHT = 44;
const WINDOW_WIDTH = Dimensions.get('window').width;

type TabRoute = {
    key: string;
    title: string;
};

const ROUTES: TabRoute[] = [
    { key: 'all', title: 'All' },
    { key: 'pinned', title: 'Pinned' },
    { key: 'notes', title: 'Notes' },
    { key: 'reminders', title: 'Reminders' },
];

export const NotesListScreen = () => {
    const { notes, loading, handleDelete, handleTogglePin } = useNotes();
    const { searchQuery, setSearchQuery, tabCounts, setTabCounts } = useStore();
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const { top, bottom } = useSafeAreaInsets();
    const [tabIndex, setTabIndex] = useState(0);

    const debouncedSearch = useMemo(
        () =>
            debounce((query: string) => {
                setSearchQuery(query);
            }, 500),
        [setSearchQuery]
    );

    const handleSearchChange = (text: string) => {
        setLocalSearch(text);
        debouncedSearch(text);
    };

    const handleClearSearch = () => {
        setLocalSearch('');
        setSearchQuery('');
    };

    const isSearching = searchQuery.trim().length > 0;

    const filteredNotes = useMemo((): Record<string, Note[]> => {
        const source = notes;
        return {
            all: source,
            pinned: source.filter((n) => n.is_pinned === 1),
            notes: source.filter((n) => n.type === 'note'),
            reminders: source.filter((n) => n.type === 'reminder'),
        };
    }, [notes]);

    useEffect(() => {
        const query = searchQuery.trim();
        getNotesCountsUseCase(query)
            .then(setTabCounts)
            .catch((err) => console.log('Failed to sync tab counts:', err));
    }, [notes, searchQuery, setTabCounts]);

    const renderScene = useCallback(
        ({ route }: SceneRendererProps & { route: TabRoute }) => {
            const tabNotes = isSearching
                ? notes.filter((n) => {
                    if (route.key === 'pinned') return n.is_pinned === 1;
                    if (route.key === 'notes') return n.type === 'note';
                    if (route.key === 'reminders') return n.type === 'reminder';
                    return true;
                })
                : filteredNotes[route.key] || [];

            return (
                <NotesTab
                    notes={tabNotes}
                    loading={loading}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                />
            );
        },
        [
            filteredNotes,
            loading,
            handleDelete,
            handleTogglePin,
            isSearching,
            notes,
        ]
    );

    const renderTabLabel = useCallback(
        (key: string, title: string, focused: boolean) => {
            const count = tabCounts[key as keyof typeof tabCounts] ?? 0;
            return (
                <View style={styles.tabLabelContainer}>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[
                            styles.tabLabelText,
                            focused && styles.tabLabelTextActive,
                        ]}
                    >
                        {title}
                    </Text>
                    <View
                        style={[
                            styles.tabCountBadge,
                            focused && styles.tabCountBadgeActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabCountText,
                                focused && styles.tabCountTextActive,
                            ]}
                        >
                            {count}
                        </Text>
                    </View>
                </View>
            );
        },
        [tabCounts]
    );

    const renderTabBar = useCallback(
        (
            props: SceneRendererProps & {
                navigationState: NavigationState<TabRoute>;
            }
        ) => (
            <TabBar
                {...props}
                scrollEnabled={true}
                style={styles.tabBar}
                indicatorStyle={styles.tabIndicator}
                tabStyle={styles.tab}
                options={{
                    all: {
                        label: ({ focused }) => renderTabLabel('all', 'All', focused),
                    },
                    pinned: {
                        label: ({ focused }) => renderTabLabel('pinned', 'Pinned', focused),
                    },
                    notes: {
                        label: ({ focused }) => renderTabLabel('notes', 'Notes', focused),
                    },
                    reminders: {
                        label: ({ focused }) => renderTabLabel('reminders', 'Reminders', focused),
                    },
                }}
                pressColor="transparent"
                pressOpacity={0.7}
            />
        ),
        [renderTabLabel]
    );

    const handlePress = useCallback(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/editor');
    }, []);

    return (
        <View style={[styles.container, { paddingTop: top }]}>
            <View style={{ gap: 16 }}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>
                        Memora
                    </Text>
                    <Pressable hitSlop={10} onPress={() => router.push('/register')}>
                        <Text style={styles.registerText}>SignUp/SignIn</Text>
                    </Pressable>
                </View>
                <View style={styles.searchInputContainer}>
                    <Search size={20} color="#666" />
                    <TextInput
                        placeholder="Search notes..."
                        placeholderTextColor="#666"
                        style={styles.searchInput}
                        value={localSearch}
                        onChangeText={handleSearchChange}
                        returnKeyType="search"
                        autoCorrect
                        spellCheck
                    />
                    {localSearch.length > 0 && (
                        <Pressable onPress={handleClearSearch} hitSlop={10}>
                            <X size={20} color="#666" />
                        </Pressable>
                    )}
                </View>
            </View>

            <TabView
                navigationState={{ index: tabIndex, routes: ROUTES }}
                renderScene={renderScene}
                onIndexChange={setTabIndex}
                renderTabBar={renderTabBar}
                initialLayout={{ width: WINDOW_WIDTH }}
                lazy
            />

            <Pressable
                style={({ pressed }) => [
                    styles.fab,
                    { bottom },
                    pressed && styles.fabPressed,
                ]}
                onPress={handlePress}
            >
                <Plus size={28} color="#FFF" strokeWidth={2.5} />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        gap: 12
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: '#000',
        gap: 16,
    },
    headerTitle: {
        flex: 1,
        fontSize: 30,
        color: '#FFF',
        ...fonts.fontBold,
    },
    registerText: {
        fontSize: 16,
        ...fonts.fontMedium,
        color: '#007AFF'
    },
    searchIconContainer: {
        width: 40,
        height: 40,
        flexDirection: 'row',
        backgroundColor: '#1C1C1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 99
    },
    searchInputContainer: {
        flexDirection: 'row',
        borderRadius: 10,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginHorizontal: 16,
        backgroundColor: '#1C1C1E',
        gap: 8
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#FFF',
        ...fonts.fontMedium,
        letterSpacing: 0.2
    },
    tabBar: {
        backgroundColor: '#000',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#222',
        height: TAB_BAR_HEIGHT,
    },
    tabIndicator: {
        backgroundColor: '#007AFF',
        height: 2.5,
        borderRadius: 2,
    },
    tab: {
        width: WINDOW_WIDTH / 3,
        paddingHorizontal: 4,
        minHeight: TAB_BAR_HEIGHT,
    },
    cancelButtonContainer: {
        position: 'absolute',
        right: 16,
        top: 10,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        paddingHorizontal: 8,
        height: '100%',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#007AFF',
        fontSize: 16,
        ...fonts.fontMedium,
    },
    tabLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        maxWidth: '100%',
        paddingHorizontal: 4,
    },
    tabLabelText: {
        fontSize: 14,
        color: '#8E8E93',
        ...fonts.fontSemiBold,
        flexShrink: 1,
    },
    tabLabelTextActive: {
        color: '#FFF',
    },
    tabCountBadge: {
        backgroundColor: '#2C2C2E',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 1,
        minWidth: 20,
        alignItems: 'center',
    },
    tabCountBadgeActive: {
        backgroundColor: '#007AFF25',
    },
    tabCountText: {
        fontSize: 11,
        color: '#8E8E93',
        ...fonts.fontSemiBold,
    },
    tabCountTextActive: {
        color: '#007AFF',
    },
    fab: {
        position: 'absolute',
        right: 16,
        width: 54,
        height: 54,
        borderRadius: 100,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    fabPressed: {
        transform: [{ scale: 0.92 }],
        opacity: 0.9,
    },
});
