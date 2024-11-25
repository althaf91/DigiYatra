import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service'; // Using geolocation-service for more precision
import Geofencing from '@rn-bridge/react-native-geofencing'; // Using the new geofencing library
import {triggerGeofenceNotification} from './notificationService';

let enteredGeofences = new Set(); // Set to keep track of entered geofences

// Predefined geofences (latitude, longitude, and radius)
const geofences = [
  {
    id: 'surveyZone1',
    latitude: 37.7749, // Example location (San Francisco)
    longitude: -122.4194,
    radius: 200, // 200 meters
    value: 'San Francisco Survey',
  },
  {
    id: 'surveyZone2',
    latitude: 34.0522, // Example location (Los Angeles)
    longitude: -118.2437,
    radius: 300, // 300 meters
    value: 'Los Angeles Survey',
  },
  {
    id: 'Home',
    latitude: 12.9956382, // Example location (Home)
    longitude: 77.7044387,
    radius: 1000, // 300 meters
    value: 'Home',
  },
];

// Function to request location permission on Android
const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      // Request foreground location permission first
      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Foreground Location Permission',
          message: 'We need access to your location for geofencing.',
        },
      );

      if (fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Foreground location permission granted');

        // Request background location permission (for Android 10 and above)
        if (Platform.Version >= 29) {
          // Android 10 (API 29) and above
          const backgroundLocationGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: 'Background Location Permission',
              message:
                'We need background location access for geofencing to work when the app is not in use.',
            },
          );

          if (
            backgroundLocationGranted === PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log('Background location permission granted');
          } else {
            console.log('Background location permission denied');
          }
        }
      } else {
        console.log('Foreground location permission denied');
      }
    }
  } catch (err) {
    console.warn(err);
  }
};

// Function to start geofencing monitoring
const startGeofencing = () => {
  // Add geofences using @rn-bridge/react-native-geofencing

  geofences.forEach(item => {
    Geofencing.addGeofence(item)
      .then(() => {
        console.log('Geofences successfully added');
      })
      .catch(error => {
        console.log('Geofencing setup failed', error);
      });
  });

  // Monitor geofence events (when a geofence is entered)
  Geofencing.onEnter(geofence => {
    if (!enteredGeofences.has(geofence)) {
      console.log(`Entered geofence: ${geofence}`);
      enteredGeofences.add(geofence);  // Mark this geofence as entered
      triggerGeofenceNotification(geofence);
    }
  });

  // Monitor geofence exit events (onExit)
  Geofencing.onExit((geofence) => {
    if (enteredGeofences.has(geofence)) {
      console.log(`Exited geofence: ${geofence}`);
      enteredGeofences.delete(geofence);  // Mark this geofence as exited
    }
  });

};

// Start location tracking
const startLocationTracking = () => {
  Geolocation.getCurrentPosition(
    position => {
      console.log('Current position:', position.coords);
      // Here, you could trigger an action when the user enters a geofenced area
    },
    error => console.error('Location error:', error),
    {enableHighAccuracy: true, distanceFilter: 10, interval: 10000}, // Customize based on needs
  );
};

// Initialize geofencing and location services
const initGeofencing = async () => {
  await requestLocationPermission();
  startGeofencing();
  startLocationTracking();
};

export {initGeofencing};
