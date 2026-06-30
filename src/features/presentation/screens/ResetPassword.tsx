import { View, Text, TextInput, Pressable, ActivityIndicator, BackHandler } from 'react-native';
import { useEffect, useState } from 'react';
import { useColors } from '@/shared/theme/colors';
import { useAuth } from '@/shared/store/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Eye, EyeOff, KeyRound } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { PasswordSchema, passwordSchema } from '../validations/auth';
import { Toast } from '../context/ToastProvider';
import { styles } from '../styles/MenuScreen.styles';
import { router } from 'expo-router';

export const ResetPassword = () => {
    const colors = useColors();
    const { changePassword, signOut } = useAuth();
    const { bottom, top } = useSafeAreaInsets();

    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<'new-password' | 'confirm-password' | null>(
        null
    );

    const {
        handleSubmit: handleFormSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(passwordSchema),
    });

    const handleSave = async (data: PasswordSchema) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsSubmitting(true);
        const result = await changePassword(data.newPassword);
        setIsSubmitting(false);
        if (result.success) {
            Toast.show({ message: 'Password changed successfully' });
            router.replace('/');
        } else {
            Toast.show({ message: result.error || 'Failed to change password' });
        }
    };

    const handleBack = async () => {
        setLoading(true);
        await signOut();
        router.replace('/');
        setLoading(false);
    };

    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            handleBack();
            return true;
        });
        return () => sub.remove();
    }, []);

    return (
        <View
            style={[
                styles.modalSheet,
                {
                    flex: 1,
                    backgroundColor: colors.background,
                    paddingTop: top,
                    paddingBottom: bottom + 5,
                },
            ]}
        >
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <ChevronLeft color={colors.text} size={25} />
                    <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
                </Pressable>
            </View>

            <View style={{ alignItems: 'center', gap: 8 }}>
                <View
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: colors.accentLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <KeyRound size={26} color={colors.accent} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Reset Password</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    Enter and confirm your new password below.
                </Text>
            </View>

            <View style={styles.inputGroup}>
                <Controller
                    name="newPassword"
                    control={control}
                    render={({ field: { onChange, value, onBlur } }) => (
                        <View
                            style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.border,
                                },
                                focusedField === 'new-password' && [
                                    styles.inputContainerFocused,
                                    { borderColor: colors.accent },
                                ],
                                errors?.newPassword?.message && [
                                    styles.inputContainerError,
                                    { borderColor: colors.error },
                                ],
                            ]}
                        >
                            <TextInput
                                style={[styles.textInput, { color: colors.text }]}
                                placeholder="New Password"
                                placeholderTextColor={colors.textTertiary}
                                value={value}
                                onChangeText={onChange}
                                onFocus={() => setFocusedField('new-password')}
                                onBlur={onBlur}
                                secureTextEntry={!showNew}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <Pressable
                                onPress={() => setShowNew(!showNew)}
                                style={styles.passwordToggle}
                                hitSlop={10}
                            >
                                {showNew ? (
                                    <EyeOff size={20} color={colors.textTertiary} />
                                ) : (
                                    <Eye size={20} color={colors.textTertiary} />
                                )}
                            </Pressable>
                        </View>
                    )}
                />
                {errors.newPassword?.message && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                        *{errors.newPassword.message}
                    </Text>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field: { onChange, value, onBlur } }) => (
                        <View
                            style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.border,
                                },
                                focusedField === 'confirm-password' && [
                                    styles.inputContainerFocused,
                                    { borderColor: colors.accent },
                                ],
                                errors?.confirmPassword?.message && [
                                    styles.inputContainerError,
                                    { borderColor: colors.error },
                                ],
                            ]}
                        >
                            <TextInput
                                style={[styles.textInput, { color: colors.text }]}
                                placeholder="Confirm New Password"
                                placeholderTextColor={colors.textTertiary}
                                value={value}
                                onChangeText={onChange}
                                onFocus={() => setFocusedField('confirm-password')}
                                onBlur={onBlur}
                                secureTextEntry={!showConfirm}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <Pressable
                                onPress={() => setShowConfirm(!showConfirm)}
                                style={styles.passwordToggle}
                                hitSlop={10}
                            >
                                {showConfirm ? (
                                    <EyeOff size={20} color={colors.textTertiary} />
                                ) : (
                                    <Eye size={20} color={colors.textTertiary} />
                                )}
                            </Pressable>
                        </View>
                    )}
                />
                {errors.confirmPassword?.message && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                        *{errors.confirmPassword.message}
                    </Text>
                )}
            </View>

            <View style={{ flex: 1 }} />

            <View style={styles.modalActions}>
                <Pressable
                    style={[styles.modalBtnPrimary, { backgroundColor: colors.accent }]}
                    onPress={handleFormSubmit(handleSave)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Save</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
};
