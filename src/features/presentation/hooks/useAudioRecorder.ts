import {
    useAudioRecorder as useRecorder,
    useAudioRecorderState,
    RecordingPresets,
    AudioModule,
    setAudioModeAsync,
} from 'expo-audio';

export const useAudioRecorder = () => {
    const recorder = useRecorder(RecordingPresets.HIGH_QUALITY);
    const state = useAudioRecorderState(recorder);

    const handlePermission = async () => {
        const permission = await AudioModule.requestRecordingPermissionsAsync();

        if (!permission.granted) {
            console.log('Mic permission denied');
            return;
        }

        await setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
        });
    }

    const start = async () => {
        await recorder.prepareToRecordAsync();
        recorder.record();
    };

    const stop = async () => {
        await recorder.stop();
        return recorder.uri;
    };

    const cancel = async () => {
        if (state.isRecording) {
            await recorder.stop();
        }
    };

    return {
        isRecording: state.isRecording,
        duration: state.durationMillis,
        start,
        stop,
        cancel,
        audioUri: recorder.uri,
        handlePermission
    };
};
