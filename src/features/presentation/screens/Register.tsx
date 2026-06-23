import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from 'react-hook-form'
import { fonts } from '@/shared/utils/fonts';
import { AuthSchema, authSchema } from '../validations/auth';

export default function Register() {
    const { bottom } = useSafeAreaInsets();
    const [isSignUp, setIsSignUp] = useState(false);

    const {
        handleSubmit: handleFormSubmit,
        control,
        formState: { errors },
        clearErrors,
    } = useForm({
        resolver: yupResolver(authSchema),
    })

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
            console.log(data)
        } catch (error) {
            console.log("Error submitting data : ", error);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowPassword(prev => !prev);
    };

    const toggleMode = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsSignUp(prev => !prev);
        clearErrors();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.welcomeContainer}>
                    <Text style={styles.appName}>Memora</Text>
                    <Text style={styles.title}>
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isSignUp
                            ? 'Join Memora to back up and sync your notes and reminders.'
                            : 'Sign in to access your notes and reminders.'}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <Controller
                            name='email'
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <View
                                    style={[
                                        styles.inputContainer,
                                        focusedField === 'email' && styles.inputContainerFocused,
                                        errors.email?.message && styles.inputContainerError,
                                    ]}
                                >
                                    <Mail
                                        size={20}
                                        color={
                                            errors.email?.message
                                                ? '#FF453A'
                                                : focusedField === 'email'
                                                    ? '#007AFF'
                                                    : '#666'
                                        }
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#666"
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
                            <Text style={styles.errorText}>*{errors.email.message}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <Controller
                            name='password'
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <View
                                    style={[
                                        styles.inputContainer,
                                        focusedField === 'password' && styles.inputContainerFocused,
                                        errors?.password?.message && styles.inputContainerError,
                                    ]}
                                >
                                    <Lock
                                        size={20}
                                        color={
                                            errors.password?.message
                                                ? '#FF453A'
                                                : focusedField === 'password'
                                                    ? '#007AFF'
                                                    : '#666'
                                        }
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder={isSignUp ? 'Choose a password' : 'Enter your password'}
                                        placeholderTextColor="#666"
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
                                            <EyeOff size={20} color="#8E8E93" />
                                        ) : (
                                            <Eye size={20} color="#8E8E93" />
                                        )}
                                    </Pressable>
                                </View>
                            )}
                        />
                        {errors.password?.message && (
                            <Text style={styles.errorText}>*{errors.password.message}</Text>
                        )}
                    </View>
                </View>

                <Pressable
                    onPress={handleFormSubmit(handleSubmit)}
                    disabled={loading}
                    style={({ pressed }) => [
                        styles.submitButton,
                        pressed && !loading && styles.submitButtonPressed,
                        loading && styles.submitButtonDisabled
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
                    <Text style={styles.footerText}>
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    </Text>
                    <Pressable hitSlop={10} onPress={toggleMode}>
                        <Text style={styles.footerLink}>
                            {isSignUp ? 'Sign in' : 'Sign up'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C1E',
    },
    header: {
        height: 3,
        width: 40,
        borderRadius: 4,
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginVertical: 12
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 30,
    },
    welcomeContainer: {
        marginBottom: 32,
    },
    appName: {
        fontSize: 14,
        color: '#007AFF',
        ...fonts.fontSemiBold,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        color: '#FFF',
        ...fonts.fontBold,
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
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
        color: '#8E8E93',
        ...fonts.fontMedium,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1E',
        borderWidth: 1.5,
        borderColor: '#2C2C2E',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputContainerFocused: {
        borderColor: '#007AFF',
        backgroundColor: '#1C1C1E',
    },
    inputContainerError: {
        borderColor: '#FF453A',
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        ...fonts.fontRegular,
        height: '100%',
    },
    passwordToggle: {
        padding: 4,
    },
    errorText: {
        color: '#FF453A',
        fontSize: 14,
        ...fonts.fontRegular,
    },
    submitButton: {
        height: 56,
        borderRadius: 12,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 12,
        shadowColor: '#007AFF',
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
        backgroundColor: '#1C1C1E',
        shadowOpacity: 0,
        elevation: 0,
        borderWidth: 1,
        borderColor: '#2C2C2E',
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
        paddingBottom: 10
    },
    footerText: {
        color: '#8E8E93',
        fontSize: 16,
        ...fonts.fontRegular,
    },
    footerLink: {
        color: '#007AFF',
        fontSize: 16,
        ...fonts.fontSemiBold,
    },
});
