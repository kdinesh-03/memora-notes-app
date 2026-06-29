import { useState } from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ImagePickerAsset } from 'expo-image-picker';
import { X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const STACK_SIZE = width * 0.55;

const positions = [
    { top: -20, left: 80 },
    { top: 30, left: 10 },
    { top: 40, right: 10 },
    { bottom: -20, left: 20 },
    { bottom: -20, right: 20 },
];

const rotations = ['-10deg', '8deg', '-6deg', '10deg', '-8deg'];

const ImageCollage = ({
    images,
    onRemoveImage,
}: {
    images: ImagePickerAsset[];
    onRemoveImage: (index: number) => void;
}) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <View style={[styles.container, { marginBottom: images.length >= 4 ? 40 : -40 }]}>
            {images.slice(0, 5).map((img, index) => {
                const isActive = activeIndex === index;

                return (
                    <Pressable
                        key={index}
                        onPress={() => setActiveIndex(index)}
                        style={[
                            styles.card,
                            positions[index],
                            {
                                zIndex: isActive ? 100 : index,
                                transform: [{ rotate: isActive ? '0deg' : rotations[index] }],
                            },
                        ]}
                    >
                        <Image source={{ uri: img.uri }} style={styles.image} />

                        <Pressable
                            style={styles.removeBtn}
                            onPress={() => onRemoveImage(index)}
                            hitSlop={10}
                        >
                            <X size={14} color="#fff" />
                        </Pressable>
                    </Pressable>
                );
            })}
        </View>
    );
};

export default ImageCollage;

const styles = StyleSheet.create({
    container: {
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    card: {
        position: 'absolute',
        width: STACK_SIZE,
        aspectRatio: 1,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },

    image: {
        width: '100%',
        height: '100%',
    },

    removeBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 12,
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
