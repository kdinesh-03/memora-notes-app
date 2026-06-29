import { StyleSheet } from 'react-native';
import { fonts } from '../../../shared/utils/fonts';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
    },
    welcomeContainer: {
        marginBottom: 32,
    },
    appName: {
        fontSize: 14,
        ...fonts.fontSemiBold,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        ...fonts.fontBold,
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        ...fonts.fontRegular,
        lineHeight: 22,
    },
    formContainer: {
        flex: 1,
        gap: 20,
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
    submitButton: {
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    submitButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        ...fonts.fontBold,
        letterSpacing: 0.3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 15,
        ...fonts.fontRegular,
    },
    footerLink: {
        fontSize: 15,
        ...fonts.fontSemiBold,
    },
});
