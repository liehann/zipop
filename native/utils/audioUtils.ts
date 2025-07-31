/**
 * Audio utilities for loading and managing audio files across platforms
 * Always fetches audio from backend static file server
 */

import { Platform } from 'react-native';
import { AudioConfig } from '../data/types';
import { getAudioUrl } from '../config/environment';

/**
 * Get the static audio URL from filename
 * @param filename - The audio filename (e.g., "beginner-greetings.mp3")
 * @returns Static audio URL
 */
export const getAudioPath = (filename: string): string => {
  const url = getAudioUrl(filename);
  console.log('🎵 Generated audio URL:', { filename, url });
  return url;
};

/**
 * Get the audio source object for React Native from static file
 * @param filename - The audio filename
 * @returns Audio source object
 */
export const getAudioSource = (filename: string) => {
  return { uri: getAudioPath(filename) };
};

/**
 * Load audio configuration from content data
 * @param audioConfig - Audio configuration from content
 * @returns Promise resolving to audio source information
 */
export const loadAudioFromConfig = async (audioConfig: AudioConfig) => {
  console.log('🎵 Loading audio from config:', audioConfig);
  
  if (!audioConfig.enabled || !audioConfig.file) {
    console.log('🎵 Audio disabled or no file specified');
    return null;
  }

  // Always use static file URL from backend
  const audioSource = getAudioSource(audioConfig.file);
  console.log('🎵 Created audio source:', audioSource);
  
  return {
    source: audioSource,
    duration: audioConfig.totalDuration,
    hasTimings: audioConfig.hasTimings,
    filename: audioConfig.file,
  };
};

/**
 * Validate that an audio file exists and is accessible on backend
 * @param filename - The audio filename to validate
 * @returns Promise resolving to boolean indicating if audio is accessible
 */
export const validateAudioFile = async (filename: string): Promise<boolean> => {
  try {
    const audioUrl = getAudioUrl(filename);
    console.log('🎵 Validating audio file:', { filename, audioUrl });
    
    const response = await fetch(audioUrl, { method: 'HEAD' });
    console.log('🎵 Audio validation response:', {
      filename,
      url: audioUrl,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    return response.ok;
  } catch (error) {
    console.warn(`🎵 Audio validation failed for ${filename}:`, error);
    return false;
  }
}; 