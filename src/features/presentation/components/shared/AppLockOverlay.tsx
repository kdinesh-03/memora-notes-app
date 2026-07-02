import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/shared/theme/colors';
import { useAppLock } from '@/shared/store/useAppLock';
import { fonts } from '@/shared/utils/fonts';

export const AppLockOverlay = () => {
    const colors = useColors();
    const { authenticate } = useAppLock();

    const handleUnlockPress = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
        await authenticate();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
                    <Lock size={40} color={colors.accent} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>Memora is Locked</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Please authenticate to access your notes.
                </Text>
                <Pressable
                    onPress={handleUnlockPress}
                    style={({ pressed }) => [
                        styles.button,
                        { backgroundColor: colors.accent },
                        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                    ]}
                >
                    <Text style={styles.buttonText}>Unlock App</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 20,
        width: '100%',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        textAlign: 'center',
        ...fonts.fontSemiBold
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
        ...fonts.fontRegular
    },
    button: {
        width: '100%',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        ...fonts.fontBold
    },
});

export default AppLockOverlay;
