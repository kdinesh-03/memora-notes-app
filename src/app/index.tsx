import { Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { NotesListScreen } from '../features/presentation/screens/NotesListScreen';

export default function Index() {
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'height' : 'padding'}
        >
            <NotesListScreen />
        </KeyboardAvoidingView>
    );
}
