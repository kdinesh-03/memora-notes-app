import { StyleSheet } from 'react-native';
import { fonts } from '../../../shared/utils/fonts';

export const styles = StyleSheet.create({
    container: { flexGrow: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingBottom: 20,
        paddingTop: 5,
        paddingHorizontal: 16,
    },
    backButton: { flexDirection: 'row', alignItems: 'center', left: -8 },
    backText: { fontSize: 16, ...fonts.fontMedium },
    saveButton: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
    },
    saveText: {
        fontSize: 16,
        ...fonts.fontSemiBold,
        letterSpacing: 0.2,
    },
    reminderSettings: {
        marginTop: 20,
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    reminderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputContainer: {
        position: 'relative',
        marginTop: 24,
        display: 'flex',
        justifyContent: 'center',
    },
    recordingBtn: {
        width: 40,
        height: 40,
        borderRadius: 50,
        position: 'absolute',
        right: 0,
        top: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ring: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 100,
        borderWidth: 2,
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    reminderLabel: {
        fontSize: 16,
        ...fonts.fontMedium,
    },
    titleInput: {
        fontSize: 32,
        ...fonts.fontBold,
        maxHeight: 120,
    },
    contentInput: {
        flex: 1,
        fontSize: 18,
        lineHeight: 24,
        ...fonts.fontRegular,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    datePickerText: {
        fontSize: 14,
        ...fonts.fontMedium,
    },
    doneButton: {
        alignSelf: 'flex-end',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    doneButtonText: {
        fontSize: 16,
        ...fonts.fontSemiBold,
    },
    repeatRow: {
        gap: 12,
        marginTop: 4,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    dayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    dayButtonActive: {},
    dayText: {
        fontSize: 14,
        ...fonts.fontMedium,
    },
    dayTextActive: {
        ...fonts.fontSemiBold,
    },
});
