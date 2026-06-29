import { Dimensions, StyleSheet } from 'react-native';
import { fonts } from '../../../shared/utils/fonts';
import { colors } from 'react-native-keyboard-controller/lib/typescript/components/KeyboardToolbar/colors';

export const TAB_BAR_HEIGHT = 44;
export const WINDOW_WIDTH = Dimensions.get('window').width;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 12,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 30,
        ...fonts.fontBold,
    },
    registerText: {
        fontSize: 15,
        ...fonts.fontMedium,
        textDecorationLine: 'underline',
    },
    syncBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    syncBadgeText: {
        fontSize: 11,
        ...fonts.fontMedium,
    },
    searchInputContainer: {
        flexDirection: 'row',
        borderRadius: 10,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginHorizontal: 16,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        ...fonts.fontMedium,
        letterSpacing: 0.2,
    },
    tabBar: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: TAB_BAR_HEIGHT,
    },
    tabIndicator: {
        height: 2.5,
        borderRadius: 2,
    },
    tab: {
        width: WINDOW_WIDTH / 3,
        paddingHorizontal: 4,
        minHeight: TAB_BAR_HEIGHT,
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
        ...fonts.fontSemiBold,
        flexShrink: 1,
    },
    tabLabelTextActive: {},
    tabCountBadge: {
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 1,
        minWidth: 20,
        alignItems: 'center',
    },
    tabCountBadgeActive: {},
    tabCountText: {
        fontSize: 11,
        ...fonts.fontSemiBold,
    },
    tabCountTextActive: {},
    fab: {
        position: 'absolute',
        right: 16,
        height: 48,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        gap: 6,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    fabPressed: {
        transform: [{ scale: 0.95 }],
        opacity: 0.92,
    },
    fabText: {
        color: '#FFF',
        fontSize: 15,
        ...fonts.fontSemiBold,
    },
});
