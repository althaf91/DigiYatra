import notifee, { EventType } from '@notifee/react-native';
import { useNavigation } from '@react-navigation/native';
import { PermissionsAndroid, Platform } from 'react-native';

// Create a Notification Channel for Android
async function createNotificationChannel() {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: 4, // High priority
  });
  console.log('Notification channel created with ID:', channelId);
}

// Function to request notification permissions for iOS and Android
const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Push Notification Permission',
        message: 'We need access to send you notifications.',
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission denied');
    }
  } else {
    // Handle iOS permission request (if needed)
    await notifee.requestPermission();
  }
};

// Function to display a local notification
async function displayNotification(title, locationName) {
  await notifee.displayNotification({
    title: title,
    body: `You have entered into ${locationName}`,
    android: {
      channelId: 'default', // Ensure the channel ID matches the one created
      smallIcon: 'ic_launcher', // Make sure you have a small icon defined in your app
      sound: 'default',
      priority: 1, // High priority for immediate notification
      pressAction: {
        id: 'default',
      },
    },
    data: {
        screen: 'Survey',  // Custom data to determine navigation
    },
  });
}

// Handling foreground events (when the app is in the foreground)
async function handleForegroundEvent(navigation) {
  notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('User pressed a notification action:', detail);
      const { notification } = detail;
      handleNotificationNavigation(notification,navigation)
    }
  });
}

// Handling background events (when the app is in the background or terminated)
async function handleBackgroundEvent(navigation) {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('User pressed a notification action in background:', detail);
      const { notification } = detail;
      handleNotificationNavigation(notification,navigation)
    }
  });
}

// Function to trigger a notification when entering a geofenced area
async function triggerGeofenceNotification(locationName) {
  await displayNotification(
    'Digi Yatra Geofence Alert',
    locationName
  );
  // Optionally handle additional logic for geofencing
}

// Function to handle navigation based on notification data
const handleNotificationNavigation = (notification, navigation) => {
    const targetScreen = notification.data?.screen;  // Extract target screen from notification data
    console.log(targetScreen);
    if (targetScreen) {
        console.log('enter notify navigation');
      navigation.navigate(targetScreen);  // Navigate to the target screen
    }
  };

// Initialize notification service
const initNotificationService = async (navigation) => {
  await createNotificationChannel(); // Create the channel for notifications
  await requestPermissions(); // Request notification permissions
  handleForegroundEvent(navigation); // Set up foreground event listener
  handleBackgroundEvent(navigation); // Set up background event listener

  // You can trigger a test notification here to confirm functionality
  // await triggerGeofenceNotification();
};

export { initNotificationService, triggerGeofenceNotification };
