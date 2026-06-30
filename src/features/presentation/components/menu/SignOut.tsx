import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useColors } from '@/shared/theme/colors';
import { useAuth } from '@/shared/store/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from '../../context/ToastProvider';
import * as Haptics from 'expo-haptics';
import { styles } from '../../styles/MenuScreen.styles';
import { LogOut } from 'lucide-react-native';

type SignOutProps = {
    onClose: () => void;
};

export const SignOut = ({ onClose }: SignOutProps) => {
    const colors = useColors();
    const { signOut, isLoading } = useAuth();
    const { bottom } = useSafeAreaInsets();

    const handleSignOut = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await signOut();
        Toast.show({ message: 'Signed out successfully' });
        onClose();
    };

    return (
        <View
            style={[
                styles.modalSheet,
                { backgroundColor: colors.cardBackground, paddingBottom: bottom + 5 },
            ]}
        >
            <View style={{ alignItems: 'center', gap: 8 }}>
                <View
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <LogOut size={18} color="#FFF" />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Sign Out</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    Are you sure you want to sign out? You can sign back in anytime to access your
                    cloud data.
                </Text>
            </View>

            <View style={styles.modalActions}>
                <Pressable
                    style={[
                        styles.modalBtnSecondary,
                        {
                            borderColor: colors.border,
                            backgroundColor: colors.cardBackground,
                        },
                    ]}
                    onPress={onClose}
                >
                    <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>
                        Cancel
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.modalBtnPrimary, { backgroundColor: colors.error }]}
                    onPress={handleSignOut}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Sign Out</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
};
