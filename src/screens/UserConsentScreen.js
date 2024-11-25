// ConsentScreen.js
import React, { useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import useVoiceRecognition from '../hooks/useVoiceRecognition';
import { useLanguage } from '../services/LanguageProvider';

const UserConsentScreen = () => {
  const { recognizedText, isListening, startListening, stopListening } = useVoiceRecognition();
  const { language, switchLanguage, i18n } = useLanguage();


  useEffect(() => {
    if (recognizedText) {
      handleVoiceCommand(recognizedText);
    }
  }, [recognizedText]);

  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('yes')) {
      Alert.alert('Consent Granted', 'You have granted consent.');
      // Handle consent granted logic here
    } else if (lowerCommand.includes('no')) {
      Alert.alert('Consent Denied', 'You have denied consent.');
      // Handle consent denied logic here 
    } else {
      Alert.alert('Command not recognized', 'Please say "Yes" or "No".');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{i18n.t('consent')}</Text>
      <Button
        title={isListening ? i18n.t('listening') : i18n.t('start_voice_command')}
        onPress={startListening}
        color="#6200EE"
      />
      {isListening && <Text style={styles.listeningText}>{i18n.t('listening')}</Text>}
      <Text style={styles.recognizedText}>{recognizedText}</Text>
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
