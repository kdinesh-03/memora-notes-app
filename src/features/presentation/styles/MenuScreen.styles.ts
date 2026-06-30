import { StyleSheet } from 'react-native';
import { fonts } from '../../../shared/utils/fonts';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    grabber: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginVertical: 12,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingBottom: 20,
        paddingTop: 5,
    },
    backButton: { flexDirection: 'row', alignItems: 'center', left: -8 },
    backText: { fontSize: 16, ...fonts.fontMedium },
    // Avatar
    avatarSection: {
        alignItems: 'center',
        paddingBottom: 28,
        gap: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 32,
        color: '#FFF',
        ...fonts.fontBold,
    },
    userEmail: {
        fontSize: 14,
        ...fonts.fontMedium,
    },
    // Sections
    sectionLabel: {
        fontSize: 12,
        ...fonts.fontSemiBold,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 24,
        marginLeft: 4,
    },
    card: {
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 14,
    },
    rowSeparator: {
        height: StyleSheet.hairlineWidth,
    },
    rowIcon: {
        width: 36,
        height: 36,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        flex: 1,
        fontSize: 16,
        ...fonts.fontMedium,
    },
    rowValue: {
        fontSize: 14,
        ...fonts.fontRegular,
    },
    rowContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    // Segmented control
    segement: {
        flexDirection: 'row',
        borderRadius: 10,
        padding: 3,
    },
    segementBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    segementText: {
        fontSize: 13,
        ...fonts.fontMedium,
    },
    segementTextActive: {
        ...fonts.fontSemiBold,
    },
    modalSheet: {
        padding: 16,
        gap: 16,
    },
    modalTitle: {
        fontSize: 20,
        ...fonts.fontBold,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 15,
        ...fonts.fontRegular,
        textAlign: 'center',
        lineHeight: 25,
        letterSpacing: 0.2,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        ...fonts.fontMedium,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputContainerFocused: {},
    inputContainerError: {},
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        ...fonts.fontRegular,
        height: '100%',
    },
    passwordToggle: {
        padding: 4,
    },
    errorText: {
        fontSize: 14,
        ...fonts.fontRegular,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    modalBtnSecondary: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnPrimary: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnText: {
        fontSize: 16,
        ...fonts.fontSemiBold,
    },
    loginPromoCard: {
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        marginTop: 24,
        gap: 12,
    },
    loginPromoIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    loginPromoTitle: {
        fontSize: 18,
        ...fonts.fontBold,
        textAlign: 'center',
    },
    loginPromoDescription: {
        fontSize: 14,
        ...fonts.fontRegular,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 8,
    },
    loginPromoButton: {
        width: '100%',
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    loginPromoButtonText: {
        color: '#FFF',
        fontSize: 15,
        ...fonts.fontSemiBold,
    },
    versionText: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 32,
        ...fonts.fontRegular,
    },
});
