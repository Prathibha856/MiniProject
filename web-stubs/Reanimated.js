// Web stub for react-native-reanimated
// This provides basic compatibility for web builds

import { Animated } from 'react-native';

// Export common reanimated functions as regular Animated equivalents
export const useSharedValue = (initialValue) => {
  return { value: initialValue };
};

export const useAnimatedStyle = (callback) => {
  return callback();
};

export const withTiming = (toValue, config) => {
  return toValue;
};

export const withSpring = (toValue, config) => {
  return toValue;
};

export const withDelay = (delay, animation) => {
  return animation;
};

export const withSequence = (...animations) => {
  return animations[animations.length - 1];
};

export const withRepeat = (animation, numberOfReps, reverse) => {
  return animation;
};

export const runOnJS = (fn) => {
  return fn;
};

export const interpolate = (value, inputRange, outputRange, extrapolate) => {
  return value;
};

export const Extrapolate = {
  CLAMP: 'clamp',
  EXTEND: 'extend',
  IDENTITY: 'identity',
};

// Export default as an object with all exports
export default {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  runOnJS,
  interpolate,
  Extrapolate,
};
