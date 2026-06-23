import { Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Register from '@/features/presentation/screens/Register';

export default function RegisterPage() {
    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#000' }}
            behavior={Platform.OS === 'ios' ? 'height' : 'padding'}
        >
            <Register />
        </KeyboardAvoidingView>
    );
}
