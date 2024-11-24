import { Camera, useCameraDevices } from 'react-native-vision-camera';
import * as Keychain from 'react-native-keychain';





// Store the face features securely (e.g., keypoints or face ID)
export const storeFaceData = async (detectedFaceData) => {
  try {
    // Extract only relevant face features like face ID or keypoints
    //const faceFeatures = extractFaceFeatures(detectedFaceData);

    // Store the face features securely in Keychain
    await Keychain.setGenericPassword('userFace', JSON.stringify(detectedFaceData));
    console.log('Face data stored securely.');
  } catch (error) {
    console.error('Error storing face data:', error);
  }
};


//check face store in keychain
export const checkStoredFace = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    return !!credentials; // Returns true if face data is stored, false otherwise
  } catch (error) {
    console.error('Error accessing Keychain:', error);
    return false;
  }
};

// Authenticate the face by comparing stored data with detected face features
export const authenticateFace = async (currentFaceData) => {
  try {
    // Get stored face features from Keychain
    const credentials = await Keychain.getGenericPassword();
    if (!credentials) {
      console.warn('No face data stored.');
      return false;
    }

    // Parse the stored face features
    const storedFaceData = JSON.parse(credentials.password);

    // Simple comparison of face features (could be based on keypoints or face ID)
    const isMatch = compareFaceFeatures(storedFaceData, currentFaceData);
    return isMatch;
  } catch (error) {
    console.error('Face authentication failed:', error);
    return false;
  }
};

const compareFaceFeatures = (storedFace, currentFace) => {
  const tolerance = {
    maxLandmarkDistance: 10, // pixels
    maxEyeOpennessDifference: 0.2, // 20% difference
    maxAngleDifference: 10, // degrees
    maxBoundingBoxDifference: 0.2, // 20% difference
    maxSmilingDifference: 0.1 // 0.1 probability difference
  };  
  let totalDistance = 0;


  console.log('check 1');
  // Compare bounding box (x, y, width, height)
  const bboxMatch = (
    Math.abs(storedFace.bounds.x - currentFace.bounds.x) < tolerance.maxBoundingBoxDifference &&
    Math.abs(storedFace.bounds.y - currentFace.bounds.y) < tolerance.maxBoundingBoxDifference &&
    Math.abs(storedFace.bounds.width - currentFace.bounds.width) < tolerance.maxBoundingBoxDifference &&
    Math.abs(storedFace.bounds.height - currentFace.bounds.height) < tolerance.maxBoundingBoxDifference
  );

  console.log('check 2');

// Function to compute Euclidean distance between two points
const calculateDistance = (point1, point2) => {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

  // Compare key landmarks between detected face and stored face
  const detectedLandmarks = currentFace.landmarks || [];
  const storedLandmarks = storedFace.landmarks || [];

  if (detectedLandmarks.length !== storedLandmarks.length) {
    return false; // If number of landmarks do not match, consider it a mismatch
  }

  for (let i = 0; i < detectedLandmarks.length; i++) {
    const detectedPoint = detectedLandmarks[i];
    const storedPoint = storedLandmarks[i];

    // Calculate the Euclidean distance between corresponding landmarks
    totalDistance += calculateDistance(detectedPoint, storedPoint);
  }
  console.log('check 3');

  // Compare probabilities (eye open, smiling, etc.)
  const eyeOpenMatch = (
    Math.abs(storedFace.leftEyeOpenProbability - currentFace.leftEyeOpenProbability) < tolerance.maxEyeOpennessDifference &&
    Math.abs(storedFace.rightEyeOpenProbability - currentFace.rightEyeOpenProbability) < tolerance.maxEyeOpennessDifference
  );
  const smilingMatch = Math.abs(storedFace.smilingProbability - currentFace.smilingProbability) < tolerance.maxSmilingDifference;

  console.log('check 4');

  // Compare angles (pitch, yaw, roll)
  const angleMatch = (
    Math.abs(storedFace.pitchAngle - currentFace.pitchAngle) < tolerance.maxAngleDifference &&
    Math.abs(storedFace.rollAngle - currentFace.rollAngle) < tolerance.maxAngleDifference &&
    Math.abs(storedFace.yawAngle - currentFace.yawAngle) < tolerance.maxAngleDifference
  );

  console.log('check 5');

  // Return true if all checks are within tolerance
  return bboxMatch && totalDistance < tolerance.maxLandmarkDistance && eyeOpenMatch && smilingMatch && angleMatch;
};

