// screens/AuthScreen.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import i18n from '../services/i18n';

const AuthScreen = () => {
  const navigation = useNavigation();

  const handleFaceScan = () => {
    navigation.replace('FaceVerification', { isEnrollment: true });
  };

  return (
    <View>
      <Text>{i18n.t('face_scan_prompt')}</Text>
      <TouchableOpacity onPress={handleFaceScan}>
        <Text>{i18n.t('scan_face_button')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;
