import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useColors } from '@/shared/theme/colors';
import { useAuth } from '@/shared/store/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from '../../context/ToastProvider';
import * as Haptics from 'expo-haptics';
import { styles } from '../../styles/MenuScreen.styles';
import { Mail } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { forgotPasswordSchema, ForgotPasswordSchema } from '../../validations/auth';

type ForgotPasswordProps = {
    onClose: () => void;
};

export const ForgotPassword = ({ onClose }: ForgotPasswordProps) => {
    const colors = useColors();
    const { resetPassword } = useAuth();
    const { bottom } = useSafeAreaInsets();

    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<'email' | null>(null);

    const {
        handleSubmit: handleFormSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(forgotPasswordSchema),
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSave = async (data: ForgotPasswordSchema) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);
        const result = await resetPassword(data.email);
        setLoading(false);
        if (result.success) {
            Toast.show({ message: 'Reset link has been sent to your email' });
            handleClose();
        } else {
            Toast.show({ message: result.error || 'Failed to send reset password link' });
        }
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
                        backgroundColor: colors.accentLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Mail size={26} color={colors.accent} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Forgot Password</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    Enter your email address and we'll send you a link to reset your password.
                </Text>
            </View>

            <View style={styles.inputGroup}>
                <Controller
                    name="email"
                    control={control}
                    render={({ field: { onChange, value, onBlur } }) => (
                        <View
                            style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.border,
                                },
                                focusedField === 'email' && [
                                    styles.inputContainerFocused,
                                    { borderColor: colors.accent },
                                ],
                                errors.email?.message && [
                                    styles.inputContainerError,
                                    { borderColor: colors.error },
                                ],
                            ]}
                        >
                            <TextInput
                                style={[styles.textInput, { color: colors.text }]}
                                placeholder="Enter your email"
                                placeholderTextColor={colors.textTertiary}
                                value={value}
                                onChangeText={(text) => {
                                    onChange(text.toLowerCase());
                                }}
                                onFocus={() => setFocusedField('email')}
                                onBlur={onBlur}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                spellCheck={false}
                            />
                        </View>
                    )}
                />
                {errors.email?.message && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                        *{errors.email.message}
                    </Text>
                )}
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
                    onPress={handleFormSubmit(handleSave)}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Submit</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
};
