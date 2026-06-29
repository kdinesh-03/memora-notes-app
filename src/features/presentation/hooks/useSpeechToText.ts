import { useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export const useSpeechToText = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');

    useSpeechRecognitionEvent('start', () => {
        setIsRecording(true);
    });

    useSpeechRecognitionEvent('end', () => {
        setIsRecording(false);
    });

    useSpeechRecognitionEvent('result', (event) => {
        const result = event.results?.[0];
        if (!result?.transcript) return;

        const { transcript } = result;

        setTranscript((prev) => (event.isFinal ? '' : prev + transcript));
    });

    useSpeechRecognitionEvent('error', (event) => {
        console.log('Speech error:', event.error, event.message);
        setIsRecording(false);
    });

    const start = async () => {
        const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        if (!permission.granted) {
            console.warn('Permission not granted');
            return;
        }

        setTranscript('');

        ExpoSpeechRecognitionModule.start({
            lang: 'en-IN',
            interimResults: true,
            continuous: true,
        });
    };

    const stop = () => {
        ExpoSpeechRecognitionModule.stop();
    };

    return {
        isRecording,
        transcript,
        start,
        stop,
    };
};
