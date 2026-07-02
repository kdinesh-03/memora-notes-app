import { Dimensions, StyleSheet } from 'react-native';
import { fonts } from '../../../shared/utils/fonts';

export const WINDOW_WIDTH = Dimensions.get('window').width;
export const WINDOW_HEIGHT = Dimensions.get('window').height;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 16,
        zIndex: 10,
    },
    skipButton: {
        paddingVertical: 8,
        borderRadius: 20,
    },
    skipText: {
        fontSize: 16,
        ...fonts.fontSemiBold,
    },
    scrollContent: {
        flexGrow: 1,
    },
    slide: {
        width: WINDOW_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    illustrationContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    textContainer: {
        alignItems: 'center',
        gap: 12,
    },
    memoraLabel: {
        fontSize: 13,
        ...fonts.fontBold,
        textAlign: 'center',
        letterSpacing: 4,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        ...fonts.fontBold,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        ...fonts.fontRegular,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    footer: {
        paddingHorizontal: 24,
        gap: 24,
        width: '100%',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        height: 10,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    buttonContainer: {
        width: '100%',
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.92,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        ...fonts.fontBold,
        letterSpacing: 0.5,
    },
});
