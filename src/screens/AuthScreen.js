// screens/AuthScreen.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
  const navigation = useNavigation();

  const handleFaceScan = () => {
    navigation.navigate('FaceVerification', { isEnrollment: true });
  };

  return (
    <View>
      <Text>Welcome! Please scan your face.</Text>
      <TouchableOpacity onPress={handleFaceScan}>
        <Text>Scan Face</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;
