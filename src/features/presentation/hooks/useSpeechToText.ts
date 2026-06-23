import { useState } from 'react';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

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
        if (!event.results?.length) return;

        const text = event.results[0]?.transcript ?? '';

        if (event.isFinal) {
            setTranscript('');
        } else {
            setTranscript(text);
        }
    });

    useSpeechRecognitionEvent('error', (event) => {
        console.log('Speech error:', event.error, event.message);
        setIsRecording(false);
    });

    const start = async () => {
        const permission =
            await ExpoSpeechRecognitionModule.requestPermissionsAsync();

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