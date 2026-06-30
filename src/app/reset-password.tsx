import { Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useColors } from '@/shared/theme/colors';
import { ResetPassword } from '@/features/presentation/screens/ResetPassword';

export default function ResetPasswordPage() {
    const colors = useColors();

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'height' : 'padding'}
        >
            <ResetPassword />
        </KeyboardAvoidingView>
    );
}
