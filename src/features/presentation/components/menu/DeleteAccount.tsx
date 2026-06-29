import { View, Text, Modal, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useColors } from '@/shared/theme/colors';
import { useAuth } from '@/shared/store/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from '../../context/ToastProvider';
import * as Haptics from 'expo-haptics';
import { styles } from '../../styles/MenuScreen.styles';
import { router } from 'expo-router';
import { Trash2 } from 'lucide-react-native';

type DeleteAccountProps = {
    visible: boolean;
    onClose: () => void;
};

export const DeleteAccount = ({ visible, onClose }: DeleteAccountProps) => {
    const colors = useColors();
    const { deleteAccount, user } = useAuth();
    const { bottom } = useSafeAreaInsets();
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setConfirmText('');
        onClose();
    };

    const handleDelete = async () => {
        if (confirmText.toLowerCase() !== 'delete') {
            Toast.show({ message: 'Type DELETE to confirm' });
            return;
        }
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setLoading(true);
        const result = await deleteAccount();
        setLoading(false);
        if (result.success) {
            Toast.show({ message: 'Account deleted. Sorry to see you go.' });
            handleClose();
            router.back();
        } else {
            Toast.show({ message: result.error || 'Failed to delete account' });
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <View
                    style={[
                        styles.modalSheet,
                        { backgroundColor: colors.cardBackground, paddingBottom: bottom + 16 },
                    ]}
                >
                    <View style={[styles.grabber, { backgroundColor: colors.border }]} />

                    <View style={{ alignItems: 'center', gap: 8 }}>
                        <View
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: colors.errorLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Trash2 size={26} color={colors.error} />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Delete Account
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                            This will permanently delete your account and all cloud data. Your local
                            notes will remain.
                            {'\n\n'}Type{' '}
                            <Text style={{ color: colors.error, fontWeight: '700' }}>DELETE</Text>{' '}
                            to confirm.
                        </Text>
                    </View>

                    <TextInput
                        style={[
                            styles.modalInput,
                            {
                                color: colors.error,
                                borderColor: colors.error + '60',
                                backgroundColor: colors.errorLight,
                                textAlign: 'center',
                            },
                        ]}
                        placeholder="Type DELETE"
                        placeholderTextColor={colors.error + '60'}
                        value={confirmText}
                        onChangeText={setConfirmText}
                        autoCapitalize="characters"
                    />

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
                            style={[styles.modalBtnPrimary, { backgroundColor: colors.error }]}
                            onPress={handleDelete}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Delete</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
