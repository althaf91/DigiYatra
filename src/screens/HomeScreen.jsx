import React, { useEffect, useState } from 'react';
import { Alert, View, Text,Button } from 'react-native';
import { initGeofencing } from '../services/geolocationService';
import { initNotificationService, } from '../services/notificationService';
import { useNavigation } from '@react-navigation/native';
import i18n from '../services/i18n';
import { setLocale } from '../services/localStorageService';
const HomeScreen = () => {
const navigation = useNavigation();
const [language, setLanguage] = useState(i18n.locale);

const switchLanguage = () => {
  const newLanguage = language === 'en' ? 'hi' : 'en';
  i18n.locale = newLanguage;
  setLocale(newLanguage);
  setLanguage(newLanguage);
};


  useEffect(() => {
    const initSetup = async() => {
        // You can await here
        const subscribeGeoFence = await initGeofencing();
        const subscribeNotification = await initNotificationService(navigation);
        // ...
      }
      initSetup();
  }, []);


  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        {i18n.t('welcome_message')}
      </Text>
      <Button
        title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
        onPress={switchLanguage}
      />
    </View>
  );
};

export default HomeScreen;