import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Cloud, KeyRound, Lock, LogOut, Trash2, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { useColors } from '@/shared/theme/colors';
import { useAuth } from '@/shared/store/useAuth';
import { Toast } from '@/features/presentation/context/ToastProvider';
import { styles } from '../styles/MenuScreen.styles';
import * as Constants from 'expo-constants';
import {
    ChangePassword,
    DeleteAccount,
    SegmentControl,
    SettingsRow,
    SignOut,
    useBottomSheet,
} from '../components';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useAppLock } from '@/shared/store/useAppLock';
import { APPLOCK_OPTIONS, THEME_OPTIONS } from '@/shared/utils/segments';

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
    const { user } = useAuth();

    const { setTheme, theme } = useThemeStore();
    const { showBottomSheet, hideBottomSheet } = useBottomSheet();

    const { isAppLockEnabled, setAppLockEnabled, checkBiometricSupport, authenticate } =
        useAppLock();

    const handleAppLockChange = async (value: 'on' | 'off') => {
        if (value === 'on') {
            const isSupported = await checkBiometricSupport();
            if (!isSupported) {
                Toast.show({
                    message: 'Security lock (passcode or biometrics) is not set up on device.',
                });
                return;
            }

            const success = await authenticate();
            if (success) {
                setAppLockEnabled(true);
                Toast.show({ message: 'App Lock enabled' });
            } else {
                Toast.show({ message: 'Authentication failed' });
            }
        } else {
            const success = await authenticate();
            if (success) {
                setAppLockEnabled(false);
                Toast.show({ message: 'App Lock disabled' });
            } else {
                Toast.show({ message: 'Authentication failed' });
            }
        }
    };

    const appLock = isAppLockEnabled ? 'on' : 'off';

    const signOut = () => {
        showBottomSheet(() => <SignOut onClose={hideBottomSheet} />, colors.background, 'hide');
    };

    const changePassword = () => {
        showBottomSheet(
            () => <ChangePassword onClose={hideBottomSheet} />,
            colors.background,
            'hide'
        );
    };

    const deleteAccount = () => {
        showBottomSheet(
            () => <DeleteAccount onClose={hideBottomSheet} />,
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
                <SegmentControl options={THEME_OPTIONS} handleSelection={setTheme} value={theme} />

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
                        icon={<Lock size={18} color="#FFF" />}
                        iconBg="#FF9F0A"
                        label="App Lock"
                        rightElement={
                            <View style={{ flex: 1 }}>
                                <SegmentControl
                                    options={APPLOCK_OPTIONS}
                                    handleSelection={handleAppLockChange}
                                    value={appLock}
                                />
                            </View>
                        }
                    />
                </View>

                {user?.email ? (
                    <>
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
                            <RowSeparator />
                            <SettingsRow
                                icon={<KeyRound size={18} color="#FFF" />}
                                iconBg="#34C759"
                                label="Change Password"
                                onPress={changePassword}
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
                                onPress={signOut}
                            />
                            <RowSeparator />
                            <SettingsRow
                                icon={<Trash2 size={18} color="#FFF" />}
                                iconBg={colors.error}
                                label="Delete Account"
                                labelColor={colors.error}
                                onPress={deleteAccount}
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

                <Text style={[styles.versionText, { color: colors.textTertiary }]}>
                    Memora • v{Constants.default.expoConfig?.version}
                </Text>
            </ScrollView>
        </View>
    );
};

export default MenuScreen;
