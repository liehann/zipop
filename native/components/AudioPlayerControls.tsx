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
  isCompact?: boolean;
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
  isCompact = false,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isSliding, setIsSliding] = useState(false);
  const [slidingTime, setSlidingTime] = useState(0);
  const [knobPosition, setKnobPosition] = useState(0);
  
  const sliderWidth = isCompact ? 180 : 220; // Even smaller for header
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
    accent: '#007AFF', // Match sentence highlight blue
    sliderTrack: isDarkMode ? '#3a3a3c' : '#c7c7cc',
    sliderProgress: '#007AFF', // Match sentence highlight blue
    buttonBg: isDarkMode ? '#2c2c2e' : '#ffffff',
    border: isDarkMode ? '#38383a' : '#c6c6c8',
  };

  const containerStyle = isCompact ? [
    styles.container,
    styles.compactContainer,
    { backgroundColor: 'transparent' }
  ] : [
    styles.container, 
    { backgroundColor: colors.background, borderTopColor: colors.border }
  ];

  const sliderContainerStyle = isCompact ? [
    styles.sliderContainer,
    styles.compactSliderContainer
  ] : styles.sliderContainer;

  const controlsStyle = isCompact ? [
    styles.controlsContainer,
    styles.compactControlsContainer
  ] : styles.controlsContainer;

  return (
    <View style={containerStyle}>
      {/* Slider Container */}
      <View style={sliderContainerStyle}>
        <View 
          ref={sliderRef}
          style={[
            styles.sliderTrack, 
            { 
              backgroundColor: colors.sliderTrack,
              width: sliderWidth,
            }
          ]}
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
        <View style={controlsStyle}>
          {/* Previous Button */}
          <TouchableOpacity
            style={[
              styles.controlButton, 
              isCompact && styles.compactControlButton,
              { backgroundColor: colors.buttonBg, borderColor: colors.border }
            ]}
            onPress={onPrevious}
            activeOpacity={0.6}
          >
            <View style={styles.prevIcon}>
              <View style={[styles.prevLine, { backgroundColor: colors.text }]} />
              <View style={[styles.prevTriangle, { borderRightColor: colors.text }]} />
            </View>
          </TouchableOpacity>

          {/* Repeat Button */}
          <TouchableOpacity
            style={[
              styles.controlButton, 
              isCompact && styles.compactControlButton,
              { backgroundColor: colors.buttonBg, borderColor: colors.border }
            ]}
            onPress={onRepeat}
            activeOpacity={0.6}
          >
            <View style={[styles.repeatIcon, { borderColor: colors.text }]} />
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <TouchableOpacity
            style={[
              styles.controlButton, 
              isCompact && styles.compactControlButton,
              { backgroundColor: colors.buttonBg, borderColor: colors.border }
            ]}
            onPress={onPlayPause}
            activeOpacity={0.6}
          >
            {isPlaying ? (
              <View style={styles.pauseIconContainer}>
                <View style={[styles.pauseBar, { backgroundColor: colors.text }]} />
                <View style={[styles.pauseBar, { backgroundColor: colors.text }]} />
              </View>
            ) : (
              <View style={[styles.playIcon, { borderLeftColor: colors.text }]} />
            )}
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.controlButton, 
              isCompact && styles.compactControlButton,
              { backgroundColor: colors.buttonBg, borderColor: colors.border }
            ]}
            onPress={onNext}
            activeOpacity={0.6}
          >
            <View style={styles.nextIcon}>
              <View style={[styles.nextTriangle, { borderLeftColor: colors.text }]} />
              <View style={[styles.nextLine, { backgroundColor: colors.text }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Time Display */}
        <View style={[styles.timeContainer, isCompact && styles.compactTimeContainer]}>
          <Text style={[
            styles.timeText, 
            isCompact && styles.compactTimeText,
            { color: colors.textSecondary }
          ]}>
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
  compactContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 0,
  },
  sliderContainer: {
    height: 24,
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  compactSliderContainer: {
    height: 20,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sliderTrack: {
    height: 3,
    borderRadius: 1.5,
    position: 'relative',
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
  compactControlsContainer: {
    marginRight: 8,
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
  compactControlButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginHorizontal: 3,
  },
  controlButtonText: {
    fontSize: 14,
  },

  timeContainer: {
    paddingLeft: 8,
  },
  compactTimeContainer: {
    paddingLeft: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  compactTimeText: {
    fontSize: 11,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevLine: {
    width: 2,
    height: 12,
    backgroundColor: '#666',
    marginRight: 2,
  },
  prevTriangle: {
    width: 0,
    height: 0,
    borderRightWidth: 6,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderRightColor: '#666',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  nextIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftColor: '#666',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  nextLine: {
    width: 2,
    height: 12,
    backgroundColor: '#666',
    marginLeft: 2,
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