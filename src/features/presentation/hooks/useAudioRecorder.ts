import {
    useAudioRecorder,
    useAudioRecorderState,
    RecordingPresets,
    AudioModule,
    setAudioModeAsync,
} from 'expo-audio';
import { useEffect } from 'react';

export const useAudioRecorderHook = () => {
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const state = useAudioRecorderState(recorder);

    useEffect(() => {
        (async () => {
            const permission = await AudioModule.requestRecordingPermissionsAsync();

            if (!permission.granted) {
                console.log('Mic permission denied');
                return;
            }

            await setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
            });
        })();
    }, []);

    const start = async () => {
        await recorder.prepareToRecordAsync();
        recorder.record();
    };

    const stop = async () => {
        await recorder.stop();
        return recorder.uri;
    };

    return {
        isRecording: state.isRecording,
        duration: state.durationMillis,
        start,
        stop,
        audioUri: recorder.uri,
    };
};
