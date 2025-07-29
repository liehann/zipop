/**
 * Audio utilities for loading and managing audio files across platforms
 */

import { Platform } from 'react-native';
import { AudioConfig } from '../data/types';

/**
 * Get the platform-specific audio file path
 * @param filename - The audio filename (e.g., 'beginner-greetings.mp3')
 * @returns Platform-specific path to the audio file
 */
export const getAudioPath = (filename: string): string => {
  if (Platform.OS === 'web') {
    // For web, audio files are served from public directory
    return `/${filename}`;
  } else {
    // For mobile (iOS/Android), audio files are in the assets/audio directory
    return `assets/audio/${filename}`;
  }
};

/**
 * Get the audio source object for React Native
 * @param filename - The audio filename
 * @returns Audio source object
 */
export const getAudioSource = (filename: string) => {
  if (Platform.OS === 'web') {
    return { uri: getAudioPath(filename) };
  } else {
    // For mobile platforms, we can require the file directly
    // This assumes the file is in the assets/audio directory
    const audioFiles: { [key: string]: any } = {
      'beginner-greetings.mp3': require('../assets/audio/beginner-greetings.mp3'),
    };
    
    return audioFiles[filename] || { uri: getAudioPath(filename) };
  }
};

/**
 * Load audio configuration from lesson data
 * @param audioConfig - Audio configuration from lesson
 * @returns Promise resolving to audio source information
 */
export const loadAudioFromConfig = async (audioConfig: AudioConfig) => {
  if (!audioConfig.enabled || !audioConfig.file) {
    return null;
  }

  const audioSource = getAudioSource(audioConfig.file);
  
  return {
    source: audioSource,
    duration: audioConfig.totalDuration,
    hasTimings: audioConfig.hasTimings,
  };
};

/**
 * Validate that an audio file exists and is accessible
 * @param filename - The audio filename to validate
 * @returns Promise resolving to boolean indicating if file is accessible
 */
export const validateAudioFile = async (filename: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // For web, we can try to fetch the file
      const response = await fetch(getAudioPath(filename), { method: 'HEAD' });
      return response.ok;
    } else {
      // For mobile, we assume the bundled file exists if it's in our audioFiles map
      const audioFiles = ['beginner-greetings.mp3'];
      return audioFiles.includes(filename);
    }
  } catch (error) {
    console.warn(`Audio file validation failed for ${filename}:`, error);
    return false;
  }
}; 