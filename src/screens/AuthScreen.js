// screens/AuthScreen.js
import React from 'react';
import { View, Text, TouchableOpacity,StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../services/LanguageProvider';

const AuthScreen = () => {
  const navigation = useNavigation();
  const { language, switchLanguage, i18n } = useLanguage();
  
  const handleFaceScan = () => {
    navigation.replace('FaceVerification', { isEnrollment: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.promptText}>
        {i18n.t('face_scan_prompt')}
      </Text>
      <TouchableOpacity style={styles.scanButton} onPress={handleFaceScan}>
        <Text style={styles.buttonText}>
          {i18n.t('scan_face_button')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  promptText: {
    fontSize: 20,
    marginBottom: 30,
    color: '#333333',
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});


export default AuthScreen;
