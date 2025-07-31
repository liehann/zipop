/**
 * Audio utilities for loading and managing audio files across platforms
 * Updated to use backend API for audio streaming
 */

import { Platform } from 'react-native';
import { AudioConfig } from '../data/types';
import contentService from '../services/contentService';

/**
 * Get the backend audio URL for content
 * @param contentId - The content ID
 * @returns Backend audio streaming URL
 */
export const getAudioPath = (contentId: string): string => {
  return contentService.getAudioUrl(contentId);
};

/**
 * Get the audio source object for React Native from backend
 * @param contentId - The content ID
 * @returns Audio source object
 */
export const getAudioSource = (contentId: string) => {
  return { uri: getAudioPath(contentId) };
};

/**
 * Load audio configuration from content data
 * @param audioConfig - Audio configuration from content
 * @param contentId - The content ID for backend audio streaming
 * @returns Promise resolving to audio source information
 */
export const loadAudioFromConfig = async (audioConfig: AudioConfig, contentId: string) => {
  if (!audioConfig.enabled || !audioConfig.file) {
    return null;
  }

  const audioSource = getAudioSource(contentId);
  
  return {
    source: audioSource,
    duration: audioConfig.totalDuration,
    hasTimings: audioConfig.hasTimings,
  };
};

/**
 * Validate that an audio file exists and is accessible on backend
 * @param contentId - The content ID to validate
 * @returns Promise resolving to boolean indicating if audio is accessible
 */
export const validateAudioFile = async (contentId: string): Promise<boolean> => {
  try {
    const audioInfo = await contentService.getAudioInfo(contentId);
    return audioInfo !== null;
  } catch (error) {
    console.warn(`Audio validation failed for content ${contentId}:`, error);
    return false;
  }
}; 