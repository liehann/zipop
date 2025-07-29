# Audio Setup Documentation

## Overview
The ZiPop app now supports audio playback with the `beginner-greetings.mp3` file bundled as a resource for all platforms (iOS, Android, Web).

## File Structure
```
native/
├── assets/audio/                    # Audio files for mobile platforms
│   └── beginner-greetings.mp3      # Bundled audio file
├── public/                         # Static files for web platform  
│   └── beginner-greetings.mp3      # Audio file for web
├── utils/audioUtils.ts             # Audio utilities for all platforms
├── data/types.ts                   # Updated with audio support types
└── data/lessons/beginner-greetings.json  # Already references the audio
```

## Configuration Updates

### 1. Metro Configuration (`metro.config.js`)
- Added `mp3`, `wav`, `aac`, `m4a` to `assetExts` for mobile bundling
- Added `watchFolders` to monitor the `assets` directory

### 2. Webpack Configuration (`webpack.config.js`)
- Added audio file handling rule for web builds
- Audio files are processed as assets with proper naming

### 3. TypeScript Types (`data/types.ts`)
- Added `AudioConfig` interface
- Added `WordTiming` and `SentenceTiming` interfaces
- Added `TimedSentence` interface extending `SentencePair`
- Updated `LessonData` to include optional `audio` field
- Updated `LessonMetadata` with audio processing fields

## Audio Utilities (`utils/audioUtils.ts`)

### Functions Available:
1. **`getAudioPath(filename)`** - Returns platform-specific audio file path
2. **`getAudioSource(filename)`** - Returns React Native audio source object
3. **`loadAudioFromConfig(audioConfig)`** - Loads audio from lesson configuration
4. **`validateAudioFile(filename)`** - Validates audio file accessibility

### Platform Handling:
- **Web**: Audio files served from `/public` directory via webpack
- **Mobile**: Audio files bundled from `assets/audio` directory via Metro

## Lesson Data Integration

The `beginner-greetings.json` already includes audio configuration:
```json
{
  "audio": {
    "enabled": true,
    "file": "beginner-greetings.mp3",
    "hasTimings": true,
    "totalDuration": 30
  }
}
```

## Usage Example

```typescript
import { loadAudioFromConfig, getAudioSource } from '../utils/audioUtils';
import { getLessonById } from '../data/dataLoader';

// Load lesson and audio
const lesson = getLessonById('beginner-greetings');
if (lesson?.audio) {
  const audioInfo = await loadAudioFromConfig(lesson.audio);
  if (audioInfo) {
    // Use audioInfo.source with your audio player
    console.log('Audio loaded:', audioInfo);
  }
}

// Or get audio source directly
const audioSource = getAudioSource('beginner-greetings.mp3');
```

## Build Verification

### Web Build
Run `npm run build:web` - audio files are processed by webpack and available in the build.

### Mobile Build  
Run `npm run android` or `npm run ios` - audio files are bundled by Metro from the assets directory.

## Current Status
✅ Audio file bundled for all platforms  
✅ Configuration updated for Metro and Webpack  
✅ TypeScript types added for audio support  
✅ Utility functions created for audio handling  
✅ Lesson data already references the audio file  
✅ Build system supports audio files  

## Next Steps (for developers)
To actually play audio, you'll need to:
1. Install a React Native audio library (e.g., `react-native-sound` or `expo-av`)
2. Use the `audioUtils` functions to get the correct audio source
3. Integrate with the existing `AudioState` management in `AppState.ts` 