import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { AuthSchema, registerSchema, signinSchema } from '../validations/auth';
import { useAuth } from '../../../shared/store/useAuth';
import { Toast } from '@/features/presentation/context/ToastProvider';
import { router } from 'expo-router';
import { useColors } from '@/shared/theme/colors';
import { styles } from '../styles/Register.styles';
import { ForgotPassword, useBottomSheet } from '../components';

export default function Register() {
    const colors = useColors();
    const { bottom, top } = useSafeAreaInsets();
    const { signUp, signIn } = useAuth();

    const { showBottomSheet, hideBottomSheet } = useBottomSheet();

    const [isSignUp, setIsSignUp] = useState(false);

    const {
        handleSubmit: handleFormSubmit,
        control,
        formState: { errors },
        clearErrors,
    } = useForm({
        resolver: yupResolver(isSignUp ? registerSchema : signinSchema),
    });

    const [showPassword, setShowPassword] = useState(false);

    const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFocus = (field: 'email' | 'password') => {
        setFocusedField(field);
    };

    const handleBlur = () => {
        setFocusedField(null);
    };

    const handleSubmit = async (data: AuthSchema) => {
        setLoading(true);
        try {
            if (isSignUp) {
                const result = await signUp(data.email, data.password);
                if (result.success) {
                    Toast.show({ message: 'Account created successfully! You can now sign in.' });
                    router.back();
                } else {
                    Toast.show({ message: result.error || 'Sign up failed' });
                }
            } else {
                const result = await signIn(data.email, data.password);
                if (result.success) {
                    Toast.show({ message: 'Signed in successfully!' });
                    router.back();
                } else {
                    Toast.show({ message: result.error || 'Sign in failed' });
                }
            }
        } catch (error: any) {
            console.log('Error submitting data : ', error);
            Toast.show({ message: error?.message || 'Authentication failed' });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowPassword((prev) => !prev);
    };

    const toggleMode = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsSignUp((prev) => !prev);
        clearErrors();
    };

    const forgotPassword = () => {
        showBottomSheet(
            () => <ForgotPassword onClose={hideBottomSheet} />,
            colors.background,
            'hide'
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: top, paddingBottom: bottom },
                ]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Pressable onPress={router.back} style={styles.backButton}>
                        <ChevronLeft color={colors.text} size={25} />
                        <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
                    </Pressable>
                </View>

                <View style={styles.welcomeContainer}>
                    <Text style={[styles.appName, { color: colors.accent }]}>Memora</Text>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {isSignUp
                            ? 'Join Memora to back up and sync your notes and reminders.'
                            : 'Sign in to access your notes and reminders.'}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Email Address
                        </Text>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field: { onChange, value } }) => (
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
                                    <Mail
                                        size={20}
                                        color={
                                            errors.email?.message
                                                ? colors.error
                                                : focusedField === 'email'
                                                  ? colors.accent
                                                  : colors.textTertiary
                                        }
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[styles.textInput, { color: colors.text }]}
                                        placeholder="Enter your email"
                                        placeholderTextColor={colors.textTertiary}
                                        value={value}
                                        onChangeText={(text) => {
                                            onChange(text.toLowerCase());
                                        }}
                                        onFocus={() => handleFocus('email')}
                                        onBlur={handleBlur}
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

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Password
                        </Text>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <View
                                    style={[
                                        styles.inputContainer,
                                        {
                                            backgroundColor: colors.cardBackground,
                                            borderColor: colors.border,
                                        },
                                        focusedField === 'password' && [
                                            styles.inputContainerFocused,
                                            { borderColor: colors.accent },
                                        ],
                                        errors?.password?.message && [
                                            styles.inputContainerError,
                                            { borderColor: colors.error },
                                        ],
                                    ]}
                                >
                                    <Lock
                                        size={20}
                                        color={
                                            errors.password?.message
                                                ? colors.error
                                                : focusedField === 'password'
                                                  ? colors.accent
                                                  : colors.textTertiary
                                        }
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[styles.textInput, { color: colors.text }]}
                                        placeholder={
                                            isSignUp ? 'Choose a password' : 'Enter your password'
                                        }
                                        placeholderTextColor={colors.textTertiary}
                                        value={value}
                                        onChangeText={onChange}
                                        onFocus={() => handleFocus('password')}
                                        onBlur={handleBlur}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <Pressable
                                        onPress={togglePasswordVisibility}
                                        style={styles.passwordToggle}
                                        hitSlop={10}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} color={colors.textTertiary} />
                                        ) : (
                                            <Eye size={20} color={colors.textTertiary} />
                                        )}
                                    </Pressable>
                                </View>
                            )}
                        />
                        {errors.password?.message && (
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                *{errors.password.message}
                            </Text>
                        )}
                    </View>

                    {!isSignUp && (
                        <View style={styles.forgotPasswordContainer}>
                            <Pressable hitSlop={10} onPress={forgotPassword}>
                                <Text style={[styles.forgotPasswordText, { color: colors.accent }]}>
                                    Forgot Password?
                                </Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                <Pressable
                    onPress={handleFormSubmit(handleSubmit)}
                    disabled={loading}
                    style={({ pressed }) => [
                        styles.submitButton,
                        { backgroundColor: colors.accent, shadowColor: colors.accent },
                        pressed && !loading && styles.submitButtonPressed,
                        loading && styles.submitButtonDisabled,
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {isSignUp ? 'Create Account' : 'Sign In'}
                        </Text>
                    )}
                </Pressable>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    </Text>
                    <Pressable hitSlop={10} onPress={toggleMode}>
                        <Text style={[styles.footerLink, { color: colors.accent }]}>
                            {isSignUp ? 'Sign in' : 'Sign up'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}
