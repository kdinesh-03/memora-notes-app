import { Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { NoteEditorScreen } from '../features/presentation/screens/NoteEditorScreen';

export default function Editor() {
    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#000' }}
            behavior={Platform.OS === 'ios' ? 'height' : 'padding'}
        >
            <NoteEditorScreen />
        </KeyboardAvoidingView>
    );
}
