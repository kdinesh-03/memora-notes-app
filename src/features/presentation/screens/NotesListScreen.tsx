import { router } from 'expo-router';
import debounce from 'lodash.debounce';
import { Plus, Search, X, RefreshCw, CloudOff, Check, TextAlignJustify } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TabView, TabBar, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../../shared/store/useStore';
import { useNotes } from '../hooks/useNotes';
import { NotesTab } from '../components/list/NotesTab';
import { Note } from '../../domain/entities/Note';
import { getNotesCountsUseCase } from '../../domain/usecases/getNotesCounts.usecase';
import { useAuth } from '../../../shared/store/useAuth';
import { hasPin, verifyPin } from '../hooks/useLockNote';
import PinModal from '../components/shared/PinModal';
import { Toast } from '@/features/presentation/context/ToastProvider';
import { useColors } from '@/shared/theme/colors';
import { styles, WINDOW_WIDTH } from '../styles/NotesListScreen.styles';

type TabRoute = {
    key: string;
    title: string;
};

const ROUTES: TabRoute[] = [
    { key: 'all', title: 'All' },
    { key: 'pinned', title: 'Pinned' },
    { key: 'notes', title: 'Notes' },
    { key: 'reminders', title: 'Reminders' },
    { key: 'locked', title: 'Locked' },
];

const SyncIndicator = ({ status }: { status: string }) => {
    switch (status) {
        case 'syncing':
            return (
                <View style={styles.syncBadge}>
                    <RefreshCw size={12} color="#FF9F0A" />
                    <Text style={[styles.syncBadgeText, { color: '#FF9F0A' }]}>Syncing</Text>
                </View>
            );
        case 'synced':
            return (
                <View style={styles.syncBadge}>
                    <Check size={12} color="#30D158" />
                    <Text style={[styles.syncBadgeText, { color: '#30D158' }]}>Synced</Text>
                </View>
            );
        case 'failed':
            return (
                <View style={styles.syncBadge}>
                    <CloudOff size={12} color="#FF453A" />
                    <Text style={[styles.syncBadgeText, { color: '#FF453A' }]}>Failed</Text>
                </View>
            );
        default:
            return null;
    }
};

export const NotesListScreen = () => {
    const { notes, loading, handleDelete, handleTogglePin, syncStatus } = useNotes();
    const { searchQuery, setSearchQuery, tabCounts, setTabCounts } = useStore();
    const { isAuthenticated } = useAuth();
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const { top, bottom } = useSafeAreaInsets();
    const [tabIndex, setTabIndex] = useState(0);

    const [pinModalVisible, setPinModalVisible] = useState(false);
    const [pendingNoteId, setPendingNoteId] = useState<string | null>(null);

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

    const handleNotePress = useCallback(
        async (noteId: string) => {
            const note = notes.find((n) => n.id === noteId);
            if (note?.is_locked === 1) {
                const pinExists = await hasPin(noteId);
                if (pinExists) {
                    setPendingNoteId(noteId);
                    setPinModalVisible(true);
                } else {
                    Toast.show({ message: 'No PIN set for this note' });
                }
            } else {
                router.push({ pathname: '/editor', params: { id: noteId } });
            }
        },
        [notes]
    );

    const renderScene = useCallback(
        ({ route }: SceneRendererProps & { route: TabRoute }) => {
            const tabNotes = isSearching
                ? notes.filter((n) => {
                      if (route.key === 'pinned') return n.is_pinned === 1;
                      if (route.key === 'notes') return n.type === 'note';
                      if (route.key === 'reminders') return n.type === 'reminder';
                      if (route.key === 'locked') return n.is_locked === 1;
                      return true;
                  })
                : filteredNotes[route.key] || [];

            return (
                <NotesTab
                    notes={tabNotes}
                    loading={loading}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    onNotePress={handleNotePress}
                    activeTab={route.key}
                />
            );
        },
        [filteredNotes, loading, handleDelete, handleTogglePin, handleNotePress, isSearching, notes]
    );

    const colors = useColors();

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
                            { color: colors.textSecondary },
                            focused && [styles.tabLabelTextActive, { color: colors.text }],
                        ]}
                    >
                        {title}
                    </Text>
                    <View
                        style={[
                            styles.tabCountBadge,
                            { backgroundColor: colors.tabCountBadge },
                            focused && [
                                styles.tabCountBadgeActive,
                                { backgroundColor: colors.tabCountBadgeActive },
                            ],
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabCountText,
                                { color: colors.textSecondary },
                                focused && [styles.tabCountTextActive, { color: colors.accent }],
                            ]}
                        >
                            {count}
                        </Text>
                    </View>
                </View>
            );
        },
        [tabCounts, colors]
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
                style={[
                    styles.tabBar,
                    { backgroundColor: colors.background, borderBottomColor: colors.border },
                ]}
                indicatorStyle={[styles.tabIndicator, { backgroundColor: colors.accent }]}
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
                    locked: {
                        label: ({ focused }) => renderTabLabel('locked', 'Locked', focused),
                    },
                }}
                pressColor="transparent"
                pressOpacity={0.7}
            />
        ),
        [renderTabLabel, colors]
    );

    const handlePress = useCallback(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/editor');
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: top }]}>
            <View style={{ gap: 16 }}>
                <View style={{ paddingHorizontal: 16 }}>
                    <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Memora</Text>
                        </View>
                        <Pressable hitSlop={10} onPress={() => router.push('/menu')}>
                            <TextAlignJustify
                                size={24}
                                color={colors.text}
                                style={{ marginTop: 2 }}
                            />
                        </Pressable>
                    </View>
                    {isAuthenticated && <SyncIndicator status={syncStatus} />}
                </View>
                <View
                    style={[
                        styles.searchInputContainer,
                        { backgroundColor: colors.cardBackground },
                    ]}
                >
                    <Search size={20} color={colors.textTertiary} />
                    <TextInput
                        placeholder="Search notes..."
                        placeholderTextColor={colors.textTertiary}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={localSearch}
                        onChangeText={handleSearchChange}
                        returnKeyType="search"
                        autoCorrect
                        spellCheck
                    />
                    {localSearch.length > 0 && (
                        <Pressable onPress={handleClearSearch} hitSlop={10}>
                            <X size={20} color={colors.textTertiary} />
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
                    { backgroundColor: colors.accent },
                    { bottom: bottom + 16 },
                    pressed && styles.fabPressed,
                ]}
                onPress={handlePress}
            >
                <Plus size={20} color="#FFF" strokeWidth={2.5} />
                <Text style={styles.fabText}>New</Text>
            </Pressable>

            <PinModal
                visible={pinModalVisible}
                mode="verify"
                onSuccess={() => {
                    setPinModalVisible(false);
                    if (pendingNoteId) {
                        router.push({ pathname: '/editor', params: { id: pendingNoteId } });
                        setPendingNoteId(null);
                    }
                }}
                onCancel={() => {
                    setPinModalVisible(false);
                    setPendingNoteId(null);
                }}
                onVerify={pendingNoteId ? (pin) => verifyPin(pendingNoteId, pin) : undefined}
            />
        </View>
    );
};
