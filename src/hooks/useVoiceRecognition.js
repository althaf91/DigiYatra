// useVoiceRecognition.js
import { useState, useEffect } from 'react';
import { DeviceEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import Voice from '../../specs/NativeVoice'


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
    DeviceEventEmitter.addListener('onSpeechResults', (event) => {
      console.log('Speech Recognition Results:', event);
      // Handle the results here, such as displaying them in the UI
    });
    
    // Listen for speech recognition errors
    DeviceEventEmitter.addListener('onSpeechError', (errorEvent) => {
      console.error('Speech Recognition Error:', errorEvent);
      // Handle the error here, such as showing an error message
    });

    return () => {
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
