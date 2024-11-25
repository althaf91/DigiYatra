// ConsentScreen.js
import React, { useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
//import useVoiceRecognition from '../hooks/useVoiceRecognition';
//import { useLanguage } from '../services/LanguageProvider';

const UserConsentScreen = () => {
  //const { recognizedText, isListening, startListening, stopListening } = useVoiceRecognition();
  //const { language, switchLanguage, i18n } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.recognizedText}>Heard:</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
    textAlign: 'center',
  },
  listeningText: {
    fontSize: 16,
    color: '#FF5722',
    marginTop: 10,
  },
  recognizedText: {
    fontSize: 16,
    marginTop: 20,
    color: '#666666',
    textAlign: 'center',
  },
});

export default UserConsentScreen;
