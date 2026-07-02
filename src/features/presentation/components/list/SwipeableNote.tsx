import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Trash2 } from 'lucide-react-native';
import { fonts } from '../../../../shared/utils/fonts';
import { Note } from '../../../domain/entities/Note';

interface SwipeableNoteProps {
    note: Note;
    onDelete: (id: string, type: 'note' | 'reminder') => void;
    children: React.ReactNode;
}

export const SwipeableNote = ({ note, onDelete, children }: SwipeableNoteProps) => {
    const swipeableRef = useRef<SwipeableMethods | null>(null);

    const renderActions = () => {
        return (
            <Pressable
                style={styles.swipeDeleteButton}
                onPress={() => {
                    swipeableRef.current?.close();
                    onDelete(note.id, note.type);
                }}
            >
                <Trash2 size={20} color="#FFF" />
                <Text style={styles.swipeDeleteText}>Delete</Text>
            </Pressable>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            friction={2}
            leftThreshold={40}
            rightThreshold={40}
            renderRightActions={renderActions}
        >
            {children}
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    swipeDeleteButton: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 12,
        marginBottom: 12,
        marginRight: 16,
        flexDirection: 'column',
        gap: 4,
    },
    swipeDeleteText: {
        color: '#FFF',
        fontSize: 12,
        ...fonts.fontBold,
    },
});
