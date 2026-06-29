import { Register } from '@/features/presentation/screens';
import { Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useColors } from '@/shared/theme/colors';

export default function RegisterPage() {
    const colors = useColors();

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'height' : 'padding'}
        >
            <Register />
        </KeyboardAvoidingView>
    );
}
