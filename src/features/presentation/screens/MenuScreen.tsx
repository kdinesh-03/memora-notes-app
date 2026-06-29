import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
    ChevronLeft,
    Cloud,
    KeyRound,
    LogOut,
    Mail,
    Moon,
    Sun,
    SunMoon,
    Trash2,
    User,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useColors } from '@/shared/theme/colors';
import { useAuth } from '@/shared/store/useAuth';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { Toast } from '@/features/presentation/context/ToastProvider';
import { styles } from '../styles/MenuScreen.styles';
import * as Constants from 'expo-constants';
import { ChangePassword, DeleteAccount, SettingsRow } from '../components';

type ThemeMode = 'system' | 'light' | 'dark';

const SectionLabel = ({ label }: { label: string }) => {
    const colors = useColors();
    return <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{label}</Text>;
};

const RowSeparator = () => {
    const colors = useColors();
    return <View style={[styles.rowSeparator, { backgroundColor: colors.border }]} />;
};

export const MenuScreen = () => {
    const colors = useColors();
    const { top, bottom } = useSafeAreaInsets();
    const { user, signOut, resetPassword } = useAuth();
    const { theme, setTheme } = useThemeStore();

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const handleSignOut = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await signOut();
        Toast.show({ message: 'Signed out successfully' });
        router.back();
    };

    const handleResetPassword = async () => {
        if (!user?.email) return;
        Alert.alert('Reset Password', `Send a password reset link to ${user.email}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Send',
                onPress: async () => {
                    setResetLoading(true);
                    const result = await resetPassword(user.email!);
                    setResetLoading(false);
                    Toast.show({
                        message: result.success
                            ? 'Reset link sent! Check your email.'
                            : result.error || 'Failed to send reset link',
                    });
                },
            },
        ]);
    };

    const THEME_OPTIONS: { key: ThemeMode; label: string; icon: React.ReactNode }[] = [
        {
            key: 'light',
            label: 'Light',
            icon: <Sun size={14} color={theme === 'light' ? colors.accent : colors.textTertiary} />,
        },
        {
            key: 'system',
            label: 'Auto',
            icon: (
                <SunMoon
                    size={14}
                    color={theme === 'system' ? colors.accent : colors.textTertiary}
                />
            ),
        },
        {
            key: 'dark',
            label: 'Dark',
            icon: <Moon size={14} color={theme === 'dark' ? colors.accent : colors.textTertiary} />,
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: top, paddingBottom: bottom },
                ]}
            >
                <View style={styles.header}>
                    <Pressable onPress={router.back} style={styles.backButton}>
                        <ChevronLeft color={colors.text} size={25} />
                        <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
                    </Pressable>
                </View>

                <View style={styles.avatarSection}>
                    <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                        <Text style={styles.avatarInitial}>
                            {user?.email?.charAt(0).toUpperCase() ?? 'M'}
                        </Text>
                    </View>
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                        {user?.email ?? 'Memora'}
                    </Text>
                </View>

                <SectionLabel label="Appearance" />
                <View style={[styles.themeSegment, { backgroundColor: colors.border }]}>
                    {THEME_OPTIONS.map(({ key, label, icon }) => (
                        <Pressable
                            key={key}
                            onPress={() => setTheme(key)}
                            style={[
                                styles.themeSegmentBtn,
                                theme === key && [
                                    styles.themeSegmentBtnActive,
                                    { backgroundColor: colors.cardBackground },
                                ],
                            ]}
                        >
                            <Text
                                style={[
                                    styles.themeSegmentText,
                                    { color: theme === key ? colors.accent : colors.textTertiary },
                                    theme === key && styles.themeSegmentTextActive,
                                ]}
                            >
                                {label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {user?.email ? (
                    <>
                        <SectionLabel label="Security" />
                        <View
                            style={[
                                styles.card,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <SettingsRow
                                icon={<KeyRound size={18} color="#FFF" />}
                                iconBg="#FF9F0A"
                                label="Change Password"
                                onPress={() => setShowChangePassword(true)}
                            />
                            <RowSeparator />
                            <SettingsRow
                                icon={<Mail size={18} color="#FFF" />}
                                iconBg="#34C759"
                                label="Reset Password"
                                value={resetLoading ? 'Sending…' : undefined}
                                onPress={handleResetPassword}
                            />
                        </View>

                        <SectionLabel label="Account" />
                        <View
                            style={[
                                styles.card,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <SettingsRow
                                icon={<User size={18} color="#FFF" />}
                                iconBg="#007AFF"
                                label="Email"
                                value={user?.email ?? ''}
                            />
                        </View>

                        <SectionLabel label="Danger Zone" />
                        <View
                            style={[
                                styles.card,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <SettingsRow
                                icon={<LogOut size={18} color="#FFF" />}
                                iconBg="#636366"
                                label="Sign Out"
                                labelColor={colors.text}
                                onPress={handleSignOut}
                            />
                            <RowSeparator />
                            <SettingsRow
                                icon={<Trash2 size={18} color="#FFF" />}
                                iconBg={colors.error}
                                label="Delete Account"
                                labelColor={colors.error}
                                onPress={() => setShowDeleteAccount(true)}
                            />
                        </View>
                    </>
                ) : (
                    <View
                        style={[
                            styles.loginPromoCard,
                            { backgroundColor: colors.cardBackground, borderColor: colors.border },
                        ]}
                    >
                        <View
                            style={[
                                styles.loginPromoIconContainer,
                                { backgroundColor: colors.accent + '15' },
                            ]}
                        >
                            <Cloud size={30} color={colors.accent} />
                        </View>
                        <Text style={[styles.loginPromoTitle, { color: colors.text }]}>
                            Sync to Cloud
                        </Text>
                        <Text
                            style={[styles.loginPromoDescription, { color: colors.textSecondary }]}
                        >
                            Sign in to sync your notes to the cloud and access them across all your
                            devices.
                        </Text>
                        <Pressable
                            onPress={() => router.push('/register')}
                            style={({ pressed }) => [
                                styles.loginPromoButton,
                                { backgroundColor: colors.accent },
                                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                            ]}
                        >
                            <Text style={styles.loginPromoButtonText}>Sign In / Register</Text>
                        </Pressable>
                    </View>
                )}

                <View style={{ flex: 1 }} />

                <Text style={[styles.versionText, { color: colors.textTertiary }]}>
                    Memora · v{Constants.default.expoConfig?.version}
                </Text>
            </ScrollView>

            <ChangePassword
                visible={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
            <DeleteAccount
                visible={showDeleteAccount}
                onClose={() => setShowDeleteAccount(false)}
            />
        </View>
    );
};

export default MenuScreen;
