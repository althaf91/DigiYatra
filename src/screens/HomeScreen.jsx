import React, {useEffect, useState} from 'react';
import {Alert, View, Text, Button, StyleSheet} from 'react-native';
import {initGeofencing} from '../services/geolocationService';
import {initNotificationService} from '../services/notificationService';
import {useNavigation} from '@react-navigation/native';
import {useLanguage} from '../services/LanguageProvider';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {useFadeIn, useScaleIn, useSlideIn, useZoomAnimation} from '../utils/animations'; // Import the custom hook

const HomeScreen = () => {
  const navigation = useNavigation();
  const {language, switchLanguage, i18n} = useLanguage();
  const fadeIn = useFadeIn(300);
  const scaleIn = useScaleIn(500);
  const slideIn = useSlideIn('y', 700);

  const navigateToConsent = () => {
    navigation.navigate('UserConsent');
  };

  const handleSwitchLanguage = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    switchLanguage(newLanguage);
  };

  useEffect(() => {
    const initSetup = async () => {
      // You can await here
      await initGeofencing();
      await initNotificationService(navigation);
      // ...
    };
    initSetup();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.welcomeText, { opacity: fadeIn }]}>
        {i18n.t('welcome_message')}
      </Animated.Text>
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleIn }] }]}>
        <Button
          title={i18n.t('switch_to')}
          onPress={handleSwitchLanguage}
          color="#6200EE"
        />
      </Animated.View>
      <View style={styles.buttonContainer}>
        <Button
          title={i18n.t('go_to_consent_screen')}
          onPress={navigateToConsent}
          color="#6200EE"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F0F0',
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333333',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
  },
});

export default HomeScreen;
