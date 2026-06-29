import { View, Text, Modal, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useColors } from '@/shared/theme/colors';
import { useAuth } from '@/shared/store/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from '../../context/ToastProvider';
import * as Haptics from 'expo-haptics';
import { styles } from '../../styles/MenuScreen.styles';
import { Eye, EyeOff } from 'lucide-react-native';

type ChangePasswordProps = {
    visible: boolean;
    onClose: () => void;
};

export const ChangePassword = ({ visible, onClose }: ChangePasswordProps) => {
    const colors = useColors();
    const { changePassword } = useAuth();
    const { bottom } = useSafeAreaInsets();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setNewPassword('');
        setConfirmPassword('');
        setShowNew(false);
        setShowConfirm(false);
        setLoading(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSave = async () => {
        if (newPassword.length < 6) {
            Toast.show({ message: 'Password must be at least 6 characters' });
            return;
        }
        if (newPassword !== confirmPassword) {
            Toast.show({ message: 'Passwords do not match' });
            return;
        }
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);
        const result = await changePassword(newPassword);
        setLoading(false);
        if (result.success) {
            Toast.show({ message: 'Password changed successfully' });
            handleClose();
        } else {
            Toast.show({ message: result.error || 'Failed to change password' });
        }
    };

    return (
        <Modal
            visible={visible}
            statusBarTranslucent
            navigationBarTranslucent
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View
                    style={[
                        styles.modalSheet,
                        { backgroundColor: colors.cardBackground, paddingBottom: bottom + 16 },
                    ]}
                >
                    <View style={[styles.grabber, { backgroundColor: colors.border }]} />
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Change Password</Text>
                    <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                        Enter and confirm your new password below.
                    </Text>

                    <View style={{ position: 'relative' }}>
                        <TextInput
                            style={[
                                styles.modalInput,
                                {
                                    color: colors.text,
                                    borderColor: colors.border,
                                    backgroundColor: colors.inputBackground,
                                    paddingRight: 48,
                                },
                            ]}
                            placeholder="New password"
                            placeholderTextColor={colors.textTertiary}
                            secureTextEntry={!showNew}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            autoCapitalize="none"
                        />
                        <Pressable
                            onPress={() => setShowNew((p) => !p)}
                            style={{ position: 'absolute', right: 14, top: 14 }}
                        >
                            {showNew ? (
                                <EyeOff size={20} color={colors.textTertiary} />
                            ) : (
                                <Eye size={20} color={colors.textTertiary} />
                            )}
                        </Pressable>
                    </View>

                    <View style={{ position: 'relative' }}>
                        <TextInput
                            style={[
                                styles.modalInput,
                                {
                                    color: colors.text,
                                    borderColor: colors.border,
                                    backgroundColor: colors.inputBackground,
                                    paddingRight: 48,
                                },
                            ]}
                            placeholder="Confirm new password"
                            placeholderTextColor={colors.textTertiary}
                            secureTextEntry={!showConfirm}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            autoCapitalize="none"
                        />
                        <Pressable
                            onPress={() => setShowConfirm((p) => !p)}
                            style={{ position: 'absolute', right: 14, top: 14 }}
                        >
                            {showConfirm ? (
                                <EyeOff size={20} color={colors.textTertiary} />
                            ) : (
                                <Eye size={20} color={colors.textTertiary} />
                            )}
                        </Pressable>
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
                            onPress={handleClose}
                        >
                            <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.modalBtnPrimary, { backgroundColor: colors.accent }]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Save</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
