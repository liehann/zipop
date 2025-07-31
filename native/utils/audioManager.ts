/**
 * Cross-platform audio manager for ZiPop app
 */

import { Platform } from 'react-native';

// Types
export interface AudioManagerConfig {
  onTimeUpdate?: (currentTime: number) => void;
  onPlaybackEnd?: () => void;
  onError?: (error: string) => void;
}

export interface SentenceTiming {
  start: number;
  end: number;
  duration: number;
}

class AudioManager {
  private audioInstance: any = null;
  private config: AudioManagerConfig = {};
  private currentTime: number = 0;
  private duration: number = 0;
  private isPlaying: boolean = false;
  private filename: string | null = null;

  // Web Audio API instance
  private webAudio: any = null;
  
  // React Native Sound instance
  private rnSound: any = null;

  constructor(config: AudioManagerConfig = {}) {
    this.config = config;
  }

  /**
   * Load an audio file
   */
  async loadAudio(audioUrl: string): Promise<boolean> {
    try {
      console.log('🎵 AudioManager.loadAudio called with:', audioUrl);
      this.filename = audioUrl; // Store the URL, not just filename
      
      if (Platform.OS === 'web') {
        return this.loadWebAudio(audioUrl);
      } else {
        return this.loadMobileAudio(audioUrl);
      }
    } catch (error) {
      console.error('🎵 Failed to load audio:', error);
      this.config.onError?.(`Failed to load audio: ${error}`);
      return false;
    }
  }

  /**
   * Load audio for web platform
   */
  private async loadWebAudio(audioUrl: string): Promise<boolean> {
    console.log('🎵 AudioManager loading web audio:', audioUrl);
    
    return new Promise((resolve) => {
      // Type assertion for web platform DOM Audio API
      const AudioConstructor = (globalThis as any).Audio;
      if (!AudioConstructor) {
        console.error('Audio API not available');
        resolve(false);
        return;
      }

      // Use the full URL directly (no longer prepend '/')
      this.webAudio = new AudioConstructor(audioUrl) as any;
      
      this.webAudio!.addEventListener('loadedmetadata', () => {
        this.duration = this.webAudio!.duration;
        resolve(true);
      });

      this.webAudio!.addEventListener('timeupdate', () => {
        this.currentTime = this.webAudio!.currentTime;
        this.config.onTimeUpdate?.(this.currentTime);
      });

      this.webAudio!.addEventListener('ended', () => {
        this.isPlaying = false;
        this.config.onPlaybackEnd?.();
      });

      this.webAudio!.addEventListener('error', (e: any) => {
        console.error('🎵 Web audio error:', {
          event: e,
          error: this.webAudio?.error,
          networkState: this.webAudio?.networkState,
          readyState: this.webAudio?.readyState,
          src: this.webAudio?.src
        });
        this.config.onError?.('Web audio playback error');
        resolve(false);
      });

      // Start loading
      this.webAudio!.load();
    });
  }

  /**
   * Load audio for mobile platforms
   */
  private async loadMobileAudio(audioUrl: string): Promise<boolean> {
    console.log('🎵 AudioManager loading mobile audio:', audioUrl);
    
    return new Promise(async (resolve) => {
      try {
        // Only load react-native-sound when actually on mobile platforms
        if (Platform.OS === 'web') {
          resolve(false);
          return;
        }

        // Use dynamic import to avoid webpack processing this during web builds
        let Sound: any;
        try {
          Sound = await import('react-native-sound').then(module => module.default);
        } catch (importError) {
          console.error('Failed to import react-native-sound:', importError);
          this.config.onError?.('react-native-sound not available');
          resolve(false);
          return;
        }
        
        // Enable playback in silence mode for iOS
        Sound.setCategory('Playback');

        // For remote URLs, pass the URL string directly to react-native-sound
        // For local files, you would use: new Sound('filename.mp3', Sound.MAIN_BUNDLE, callback)
        // For remote URLs, use: new Sound(url, null, callback)
        
        this.rnSound = new Sound(audioUrl, null, (error: any) => {
          if (error) {
            console.error('Failed to load sound:', error);
            this.config.onError?.(`Failed to load sound: ${error.message}`);
            resolve(false);
            return;
          }

          this.duration = this.rnSound.getDuration();
          resolve(true);
        });
      } catch (error) {
        console.error('Mobile audio error:', error);
        this.config.onError?.(`Mobile audio error: ${error}`);
        resolve(false);
      }
    });
  }

  /**
   * Play audio from a specific time
   */
  play(startTime: number = 0): void {
    try {
      if (Platform.OS === 'web' && this.webAudio) {
        this.webAudio.currentTime = startTime;
        this.webAudio.play();
        this.isPlaying = true;
      } else if (Platform.OS !== 'web' && this.rnSound) {
        this.rnSound.setCurrentTime(startTime);
        this.rnSound.play((success: boolean) => {
          if (!success) {
            console.error('Mobile audio playback failed');
            this.config.onError?.('Mobile audio playback failed');
          }
          this.isPlaying = false;
          this.config.onPlaybackEnd?.();
        });
        this.isPlaying = true;
        
        // Start time update interval for mobile
        this.startTimeUpdateInterval();
      }
    } catch (error) {
      console.error('Audio play error:', error);
      this.config.onError?.(`Audio play error: ${error}`);
    }
  }

  /**
   * Seek to a specific time position
   */
  seekTo(time: number): void {
    try {
      // Clamp time to valid range
      const seekTime = Math.max(0, Math.min(time, this.duration));
      
      if (Platform.OS === 'web' && this.webAudio) {
        this.webAudio.currentTime = seekTime;
        this.currentTime = seekTime;
        this.config.onTimeUpdate?.(this.currentTime);
      } else if (Platform.OS !== 'web' && this.rnSound) {
        this.rnSound.setCurrentTime(seekTime);
        this.currentTime = seekTime;
        this.config.onTimeUpdate?.(this.currentTime);
      }
    } catch (error) {
      console.error('Audio seek error:', error);
      this.config.onError?.(`Audio seek error: ${error}`);
    }
  }

  /**
   * Play a specific sentence based on timing
   */
  playSentence(timing: SentenceTiming): void {
    this.play(timing.start);
    
    // Stop at the end time
    setTimeout(() => {
      this.pause();
    }, timing.duration * 1000);
  }

  /**
   * Pause audio playback
   */
  pause(): void {
    try {
      if (Platform.OS === 'web' && this.webAudio) {
        this.webAudio.pause();
      } else if (Platform.OS !== 'web' && this.rnSound) {
        this.rnSound.pause();
        this.stopTimeUpdateInterval();
      }
      this.isPlaying = false;
    } catch (error) {
      console.error('Audio pause error:', error);
    }
  }

  /**
   * Stop audio playback
   */
  stop(): void {
    try {
      if (Platform.OS === 'web' && this.webAudio) {
        this.webAudio.pause();
        this.webAudio.currentTime = 0;
      } else if (Platform.OS !== 'web' && this.rnSound) {
        this.rnSound.stop();
        this.stopTimeUpdateInterval();
      }
      this.isPlaying = false;
      this.currentTime = 0;
    } catch (error) {
      console.error('Audio stop error:', error);
    }
  }

  /**
   * Get current playback state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      filename: this.filename,
    };
  }

  /**
   * Time update interval for mobile platforms
   */
  private intervalId: NodeJS.Timeout | null = null;

  private startTimeUpdateInterval(): void {
    this.stopTimeUpdateInterval();
    this.intervalId = setInterval(() => {
      if (this.rnSound && this.isPlaying && Platform.OS !== 'web') {
        this.rnSound.getCurrentTime((seconds: number) => {
          this.currentTime = seconds;
          this.config.onTimeUpdate?.(this.currentTime);
        });
      }
    }, 250); // Reduced frequency from 100ms to 250ms to prevent excessive updates
  }

  private stopTimeUpdateInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Release audio resources
   */
  release(): void {
    this.stop();
    this.stopTimeUpdateInterval();
    
    if (Platform.OS === 'web' && this.webAudio) {
      this.webAudio.removeEventListener('loadedmetadata', () => {});
      this.webAudio.removeEventListener('timeupdate', () => {});
      this.webAudio.removeEventListener('ended', () => {});
      this.webAudio.removeEventListener('error', () => {});
      this.webAudio = null;
    } else if (Platform.OS !== 'web' && this.rnSound) {
      this.rnSound.release();
      this.rnSound = null;
    }
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
export default AudioManager; 