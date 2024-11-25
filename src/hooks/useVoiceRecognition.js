// useVoiceRecognition.js
import { useState, useEffect } from 'react';
import Voice from '@react-native-voice/voice';
import { PermissionsAndroid, Platform } from 'react-native';


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
      await Voice.start('en-US'); // Change to 'hi-IN' for Hindi or dynamically switch
      setIsListening(true);
    } catch (e) {
      setError(e.message);
      console.error(e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    Voice.onSpeechResults = (e) => setRecognizedText(e.value ? e.value[0] : '');
    Voice.onSpeechError = (e) => {
      setError(e.error.message);
      setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
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
