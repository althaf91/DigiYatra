/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FaceVerificationScreen from '../screens/FaceVerificationScreen';
import {checkStoredFace} from '../services/faceRecognitionService';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import SurveyScreen from '../screens/SurveyScreen';
import { useLanguage } from '../services/LanguageProvider';
import UserConsentScreen from '../screens/UserConsentScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const { loading } = useLanguage();

  useEffect(() => {
    const initializeApp = async () => {
      //initNotificationService();
      const isStored = await checkStoredFace(); // Await the check
      setInitialRoute(isStored ? 'FaceVerification' : 'Auth'); // Set the correct route
    };
    initializeApp();
  }, []);

  // Show loading spinner until initialRoute is set
  if (!initialRoute && loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen
            name="FaceVerification"
            component={FaceVerificationScreen}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Survey" component={SurveyScreen} />
          <Stack.Screen name="UserConsent" component={UserConsentScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Optional background color
  },
});

export default AppNavigator;
