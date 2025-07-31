import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  PanResponder,
} from 'react-native';

interface AudioPlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onRepeat: () => void;
  formatTime: (time: number) => string;
}

const AudioPlayerControls: React.FC<AudioPlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onPrevious,
  onNext,
  onRepeat,
  formatTime,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isSliding, setIsSliding] = useState(false);
  const [slidingTime, setSlidingTime] = useState(0);
  const [knobPosition, setKnobPosition] = useState(0);
  
  const sliderWidth = 220; // Smaller width for compact design
  const sliderRef = useRef<View>(null);
  
  // Update knob position when currentTime changes (but not while sliding)
  React.useEffect(() => {
    if (!isSliding && duration > 0) {
      const position = (currentTime / duration) * sliderWidth;
      setKnobPosition(Math.max(0, Math.min(position, sliderWidth)));
    }
  }, [currentTime, duration, isSliding, sliderWidth]);

  // Pan responder for slider
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      setIsSliding(true);
      // Calculate position from touch
      const touchX = event.nativeEvent.locationX;
      const newPosition = Math.max(0, Math.min(touchX, sliderWidth));
      setKnobPosition(newPosition);
      
      if (duration > 0) {
        const newTime = (newPosition / sliderWidth) * duration;
        setSlidingTime(newTime);
      }
    },
    onPanResponderMove: (event) => {
      const touchX = event.nativeEvent.locationX;
      const newPosition = Math.max(0, Math.min(touchX, sliderWidth));
      setKnobPosition(newPosition);
      
      if (duration > 0) {
        const newTime = (newPosition / sliderWidth) * duration;
        setSlidingTime(newTime);
      }
    },
    onPanResponderRelease: () => {
      if (duration > 0) {
        const newTime = (knobPosition / sliderWidth) * duration;
        onSeek(newTime);
      }
      setIsSliding(false);
      setSlidingTime(0);
    },
  });

  const displayTime = isSliding ? slidingTime : currentTime;

  const colors = {
    background: isDarkMode ? '#1c1c1e' : '#f2f2f7',
    text: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#8e8e93' : '#6d6d70',
    accent: '#007AFF',
    sliderTrack: isDarkMode ? '#3a3a3c' : '#c7c7cc',
    sliderProgress: '#007AFF',
    buttonBg: isDarkMode ? '#2c2c2e' : '#ffffff',
    border: isDarkMode ? '#38383a' : '#c6c6c8',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {/* Slider Container */}
      <View style={styles.sliderContainer}>
        <View 
          ref={sliderRef}
          style={[styles.sliderTrack, { backgroundColor: colors.sliderTrack }]}
          {...panResponder.panHandlers}
        >
          {/* Progress bar */}
          <View
            style={[
              styles.sliderProgress,
              { 
                backgroundColor: colors.sliderProgress,
                width: knobPosition,
              },
            ]}
          />
          
          {/* Draggable knob */}
          <View
            style={[
              styles.sliderKnob,
              { 
                backgroundColor: colors.sliderProgress,
                transform: [{ translateX: knobPosition - 6 }], // Center the smaller knob
              },
            ]}
          />
        </View>
      </View>

      {/* Controls and Time Row */}
      <View style={styles.bottomRow}>
        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          {/* Previous Button */}
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.buttonBg, borderColor: colors.border }]}
            onPress={onPrevious}
            activeOpacity={0.6}
          >
            <View style={[styles.prevIcon, { borderRightColor: colors.text }]} />
          </TouchableOpacity>

          {/* Repeat Button */}
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.buttonBg, borderColor: colors.border }]}
            onPress={onRepeat}
            activeOpacity={0.6}
          >
            <View style={[styles.repeatIcon, { borderColor: colors.text }]} />
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: colors.accent }]}
            onPress={onPlayPause}
            activeOpacity={0.6}
          >
            {isPlaying ? (
              <View style={styles.pauseIconContainer}>
                <View style={[styles.pauseBar, { backgroundColor: '#ffffff' }]} />
                <View style={[styles.pauseBar, { backgroundColor: '#ffffff' }]} />
              </View>
            ) : (
              <View style={[styles.playIcon, { borderLeftColor: '#ffffff' }]} />
            )}
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.buttonBg, borderColor: colors.border }]}
            onPress={onNext}
            activeOpacity={0.6}
          >
            <View style={[styles.nextIcon, { borderLeftColor: colors.text }]} />
          </TouchableOpacity>
        </View>

        {/* Time Display */}
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(displayTime)} / {formatTime(duration)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
  },
  sliderContainer: {
    height: 24,
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 3,
    borderRadius: 1.5,
    position: 'relative',
    width: 220,
  },
  sliderProgress: {
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderKnob: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: -4.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 0.5,
  },
  controlButtonText: {
    fontSize: 14,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timeContainer: {
    paddingLeft: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  buttonIcon: {
    position: 'absolute',
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: '#ffffff',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  pauseIcon: {
    width: 12,
    height: 12,
    flexDirection: 'row',
  },
  prevIcon: {
    width: 0,
    height: 0,
    borderRightWidth: 8,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderRightColor: '#666',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  nextIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: '#666',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  repeatIcon: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 7,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '315deg' }],
  },
  pauseIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBar: {
    width: 3,
    height: 12,
    marginHorizontal: 1.5,
    borderRadius: 1.5,
  },
});

export default AudioPlayerControls;