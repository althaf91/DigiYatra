import React, {useEffect, useRef, useState} from 'react';
import {View, Text, Button, Alert} from 'react-native';
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

const FaceVerificationScreen = () => {
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const { params } = useRoute();
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
    } else {
      setError('No front camera available on this device.');
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
    <View>
      {!hasPermission ? (
        <Text style={{color: 'red'}}>
          Camera permission is required to use face recognition.
        </Text>
      ) : !isCameraReady ? (
        <Text style={{color: 'red'}}>
          No front camera detected on this device.
        </Text>
      ) : (
        <View>
          <Camera
            ref={cameraRef}
            style={{width: '100%', height: 400}}
            device={device}
            isActive={isProcessing}
            frameProcessor={isProcessing ? frameProcessor : undefined}
            frameProcessorFps={5} // Adjust for performance
          />
        </View>
      )}
      {error && <Text style={{color: 'red'}}>{error}</Text>}
    </View>
  );
};

export default FaceVerificationScreen;
