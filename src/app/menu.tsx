import { Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { MenuScreen } from '@/features/presentation/screens';
import { useColors } from '@/shared/theme/colors';

export default function Editor() {
    const colors = useColors();

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'height' : 'padding'}
        >
            <MenuScreen />
        </KeyboardAvoidingView>
    );
}
