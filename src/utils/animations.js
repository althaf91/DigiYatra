// animations/zoomAnimation.js
import { useEffect } from 'react';
import { useSharedValue, withTiming, withSpring } from 'react-native-reanimated';

export const useFadeIn = (delay = 0) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 500 });
    }, delay);
  }, [delay]);

  return opacity;
};

export const useScaleIn = (delay = 0) => {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    }, delay);
  }, [delay]);

  return scale;
};

export const useSlideIn = (axis = 'y', delay = 0) => {
  const translate = useSharedValue(axis === 'y' ? 100 : 0);

  useEffect(() => {
    setTimeout(() => {
      translate.value = withSpring(0, { damping: 15, stiffness: 100 });
    }, delay);
  }, [delay]);

  return translate;
};

export const useOpacity = (initial = 0, target = 1, duration = 500) => {
  const opacity = useSharedValue(initial);

  useEffect(() => {
    opacity.value = withTiming(target, { duration });
  }, [target, duration]);

  return opacity;
};