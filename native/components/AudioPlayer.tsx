import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { AudioPlayerProps } from '../types';

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioState,
  onPlay,
  onPause,
  onSeek,
  onSpeedChange,
  isDarkMode,
}) => {
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5];

  const handlePrevious = () => {
    // TODO: Implement previous functionality
    console.log('Previous pressed');
  };

  const handleNext = () => {
    // TODO: Implement next functionality
    console.log('Next pressed');
  };

  const handleRewind = () => {
    // TODO: Implement rewind functionality
    console.log('Rewind pressed');
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
    ]}>
      
      {/* Control Buttons Row */}
      <View style={styles.controlsRow}>
        {/* Rewind */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleRewind}
        >
          <Text style={[
            styles.controlButtonText,
            { color: isDarkMode ? '#ffffff' : '#000000' }
          ]}>
            ↻
          </Text>
        </TouchableOpacity>

        {/* Previous */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePrevious}
        >
          <Text style={[
            styles.controlButtonText,
            { color: isDarkMode ? '#ffffff' : '#000000' }
          ]}>
            ⏮
          </Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          style={[
            styles.playButton,
            { backgroundColor: '#D2691E' }
          ]}
          onPress={audioState.isPlaying ? onPause : onPlay}
        >
          <Text style={styles.playButtonText}>
            {audioState.isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleNext}
        >
          <Text style={[
            styles.controlButtonText,
            { color: isDarkMode ? '#ffffff' : '#000000' }
          ]}>
            ⏭
          </Text>
        </TouchableOpacity>
      </View>

      {/* Speed Controls */}
      <View style={styles.speedRow}>
        {speedOptions.map((speed) => (
          <TouchableOpacity
            key={speed}
            style={[
              styles.speedButton,
              audioState.playbackSpeed === speed && styles.selectedSpeedButton,
              {
                backgroundColor: audioState.playbackSpeed === speed
                  ? '#D2691E'
                  : (isDarkMode ? '#3a3a3a' : '#f0f0f0')
              }
            ]}
            onPress={() => onSpeedChange(speed)}
          >
            <Text style={[
              styles.speedButtonText,
              {
                color: audioState.playbackSpeed === speed
                  ? '#ffffff'
                  : (isDarkMode ? '#cccccc' : '#666666')
              }
            ]}>
              {speed}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        {/* Time and Progress */}
        <View style={styles.timeProgressContainer}>
          <Text style={[
            styles.timeText,
            { color: isDarkMode ? '#cccccc' : '#666666' }
          ]}>
            {formatTime(audioState.currentTime)}
          </Text>
          
          {/* Progress Bar */}
          <View style={[
            styles.progressBar,
            { backgroundColor: isDarkMode ? '#666666' : '#e0e0e0' }
          ]}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${audioState.duration > 0 ? (audioState.currentTime / audioState.duration) * 100 : 0}%`,
                  backgroundColor: '#D2691E'
                }
              ]}
            />
          </View>
          
          <Text style={[
            styles.timeText,
            { color: isDarkMode ? '#cccccc' : '#666666' }
          ]}>
            {formatTime(audioState.currentTime)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 20,
  },
  controlButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 20,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 20,
    color: '#ffffff',
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  selectedSpeedButton: {
    // Additional styling handled inline
  },
  speedButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'center',
  },
  timeProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default AudioPlayer; 