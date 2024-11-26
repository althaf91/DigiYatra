// useVoiceRecognition.js
import { useState, useEffect } from 'react';
import { DeviceEventEmitter, NativeEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import Voice from '../../specs/NativeVoice'


const nativeVoiceEmitter = new NativeEventEmitter(Voice);


const useVoiceRecognition = () => {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

   // Function to request microphone permissions
   const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'We need access to your microphone for voice recognition',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Microphone permission granted');
        } else {
          console.log('Microphone permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const startListening = async () => {
    try {
      await requestMicrophonePermission();  // Request permission before starting
      setError(null);
      setRecognizedText('');
      await Voice.startSpeech('en-US',{}); // Change to 'hi-IN' for Hindi or dynamically switch
      setIsListening(true);
    } catch (e) {
      setError(e.message);
      console.error(e);
    }
  };

  const stopListening = async () => {
    try {
      Voice.stopSpeech();
      setIsListening(false);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    const onSpeechResults = nativeVoiceEmitter.addListener('onSpeechResults', (event) => {
      setRecognizedText(event.recognizedText);
    });
    const onPartialResults = nativeVoiceEmitter.addListener('onSpeechPartialResults', (event) => {
      setRecognizedText(event.partialText);
    });

    const onSpeechError = nativeVoiceEmitter.addListener('onSpeechError', (event) => {
      console.error('Speech Recognition Error:', event.error);
    });

    return () => {
      onSpeechResults.remove();
      onPartialResults.remove();
      onSpeechError.remove();
      Voice.destroySpeech().then(Voice.removeListeners);
    };
  }, []);

  return {
    recognizedText,
    isListening,
    error,
    startListening,
    stopListening,
  };
};

export default useVoiceRecognition;
