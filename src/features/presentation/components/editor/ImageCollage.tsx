import { View, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ImagePickerAsset } from 'expo-image-picker';
import { X } from 'lucide-react-native';

const ImageCollage = ({
    images,
    onRemoveImage,
}: {
    images: ImagePickerAsset[];
    onRemoveImage: (index: number) => void;
}) => {
    if (!images || images.length === 0) return null;

    const renderRemoveButton = (index: number) => (
        <Pressable style={styles.removeImageBtn} onPress={() => onRemoveImage(index)} hitSlop={8}>
            <X size={14} color="#FFF" />
        </Pressable>
    );

    const len = images.length;

    if (len === 1) {
        return (
            <View style={styles.collageContainer}>
                <View style={styles.singleImageWrapper}>
                    <Image source={{ uri: images[0].uri }} style={styles.singleImage} />
                    {renderRemoveButton(0)}
                </View>
            </View>
        );
    }

    if (len === 2) {
        return (
            <View style={[styles.collageContainer, styles.rowGap]}>
                {images.map((img, i) => (
                    <View key={i} style={styles.halfImageWrapper}>
                        <Image source={{ uri: img.uri }} style={styles.collageImage} />
                        {renderRemoveButton(i)}
                    </View>
                ))}
            </View>
        );
    }

    if (len === 3) {
        return (
            <View style={[styles.collageContainer, styles.rowContainer]}>
                <View style={styles.twoThirdsImageWrapper}>
                    <Image source={{ uri: images[0].uri }} style={styles.collageImage} />
                    {renderRemoveButton(0)}
                </View>
                <View style={styles.oneThirdColumn}>
                    <View style={styles.oneThirdImageWrapper}>
                        <Image source={{ uri: images[1].uri }} style={styles.collageImage} />
                        {renderRemoveButton(1)}
                    </View>
                    <View style={styles.oneThirdImageWrapper}>
                        <Image source={{ uri: images[2].uri }} style={styles.collageImage} />
                        {renderRemoveButton(2)}
                    </View>
                </View>
            </View>
        );
    }

    if (len === 4) {
        return (
            <View style={[styles.collageContainer, styles.gridContainer]}>
                <View style={styles.gridRow}>
                    <View style={styles.halfImageWrapper}>
                        <Image source={{ uri: images[0].uri }} style={styles.collageImage} />
                        {renderRemoveButton(0)}
                    </View>
                    <View style={styles.halfImageWrapper}>
                        <Image source={{ uri: images[1].uri }} style={styles.collageImage} />
                        {renderRemoveButton(1)}
                    </View>
                </View>
                <View style={styles.gridRow}>
                    <View style={styles.halfImageWrapper}>
                        <Image source={{ uri: images[2].uri }} style={styles.collageImage} />
                        {renderRemoveButton(2)}
                    </View>
                    <View style={styles.halfImageWrapper}>
                        <Image source={{ uri: images[3].uri }} style={styles.collageImage} />
                        {renderRemoveButton(3)}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.collageContainer, styles.rowContainer]}>
            <View style={styles.twoThirdsImageWrapper}>
                <Image source={{ uri: images[0].uri }} style={styles.collageImage} />
                {renderRemoveButton(0)}
            </View>
            <View style={styles.oneThirdColumn}>
                <View style={styles.gridRow}>
                    <View style={styles.oneThirdImageWrapper}>
                        <Image source={{ uri: images[1].uri }} style={styles.collageImage} />
                        {renderRemoveButton(1)}
                    </View>
                    <View style={styles.oneThirdImageWrapper}>
                        <Image source={{ uri: images[2].uri }} style={styles.collageImage} />
                        {renderRemoveButton(2)}
                    </View>
                </View>
                <View style={styles.gridRow}>
                    <View style={styles.oneThirdImageWrapper}>
                        <Image source={{ uri: images[3].uri }} style={styles.collageImage} />
                        {renderRemoveButton(3)}
                    </View>
                    <View style={styles.oneThirdImageWrapper}>
                        <Image source={{ uri: images[4].uri }} style={styles.collageImage} />
                        {renderRemoveButton(4)}
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ImageCollage;

const styles = StyleSheet.create({
    collageContainer: {
        width: '100%',
        height: 220,
        marginVertical: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    rowContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    rowGap: {
        flexDirection: 'row',
        gap: 6,
    },
    gridContainer: {
        flexDirection: 'column',
        gap: 6,
    },
    gridRow: {
        flex: 1,
        flexDirection: 'row',
        gap: 6,
    },
    singleImageWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    singleImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    halfImageWrapper: {
        flex: 1,
        height: '100%',
        position: 'relative',
    },
    twoThirdsImageWrapper: {
        flex: 2,
        height: '100%',
        position: 'relative',
    },
    oneThirdColumn: {
        flex: 1,
        gap: 6,
    },
    oneThirdImageWrapper: {
        flex: 1,
        position: 'relative',
    },
    collageImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeImageBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
});
