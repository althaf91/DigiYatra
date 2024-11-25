import React, {useEffect, useRef, useState} from 'react';
import {View, Text,StyleSheet} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {
  useFaceDetector,
  FaceDetectionOptions,
} from 'react-native-vision-camera-face-detector';
import {Worklets} from 'react-native-worklets-core';
import {
  storeFaceData,
  authenticateFace,
} from '../services/faceRecognitionService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLanguage } from '../services/LanguageProvider';

const FaceVerificationScreen = () => {
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const { params } = useRoute();
  const { language, switchLanguage, i18n } = useLanguage();
  const isEnrollment = params?.isEnrollment;
  const device = useCameraDevice('front');

  // Use the permission hook
  const {hasPermission, requestPermission} = useCameraPermission();

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true); // Control frame processing

  const [error, setError] = useState(null);

  // Initialize face detector
  const faceDetector = useFaceDetector({
    landmarkMode: 'all', // Detect eyes, nose, and mouth
    classificationMode: 'all', // Identify smiling or eyes open
    performanceMode: 'accurate',
    trackingEnabled:true // 'fast' or 'accurate'
  });

  useEffect(() => {
    // Request camera permission if not granted
    if (!hasPermission) {
      requestPermission().catch(err => {
        setError('Error requesting camera permission.');
        console.error(err);
      });
    }
  }, [hasPermission]);

  useEffect(() => {
    // Check if the device has a front camera
    if (device) {
      setIsCameraReady(true);
    }
  }, [device]);

  const handleDetectedFaces = Worklets.createRunOnJS(faces => {
    setIsProcessing(false);
    if(isEnrollment) {
      storeFaceData(faces[0]);
      navigation.replace("Home");
    } else {
      let match = authenticateFace(faces[0]);
      if(match) {
        navigation.replace('Home')
      } else {
        console.log('Face does not match');
      }
    }

  });
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (isProcessing) {
        const faces = faceDetector.detectFaces(frame);
        if (faces.length === 1) {
          handleDetectedFaces(faces);
        }
      }
    },
    [handleDetectedFaces],
  );

  return (
    <View style={styles.container}>
      {!hasPermission ? (
        <Text style={styles.errorText}>
          {i18n.t('camera_permission_required')}
        </Text>
      ) : !isCameraReady ? (
        <Text style={styles.errorText}>
          {i18n.t('no_front_camera_detected')}
        </Text>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={isProcessing}
            frameProcessor={isProcessing ? frameProcessor : undefined}
            frameProcessorFps={5} // Adjust for performance
          />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraContainer: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});


export default FaceVerificationScreen;
