# ZiPop - Multilingual Reading App

## Overview
ZiPop is a React Native multilingual reading app designed for Chinese language learning. It displays Chinese text with automatic pinyin romanization and English translations, featuring dynamic content loading from a backend API. The app is built with TypeScript and supports iOS, Android, and Web platforms.

## Technical Stack
- **Framework**: React Native 0.80.1 with React 19.1.0
- **Language**: TypeScript 5.0.4
- **Platforms**: iOS, Android, Web (via React Native Web + Webpack)
- **Build Tools**: Metro (mobile), Webpack (web)  
- **Testing**: Jest with React Test Renderer
- **Architecture**: Clean architecture with domain layer separation and service layer
- **Pinyin Library**: `pinyin@4.0.0` by @hotoo for accurate Chinese-to-pinyin conversion
- **Data System**: API-based content loading with intelligent caching
- **Backend**: Node.js + Fastify + PostgreSQL (see `../backend/README.md`)

## Major Features

### 🔤 Automatic Pinyin Generation
- **Real Pinyin Library**: Uses the industry-standard `pinyin` library by @hotoo
- **Comprehensive Coverage**: Handles thousands of Chinese characters automatically
- **Multiple Formats**: Tone marks (nǐ hǎo), without tones (ni hao), numeric tones (ni3 hao3)
- **Word Segmentation**: Intelligent spacing between words in sentences
- **Error Handling**: Graceful fallback for non-Chinese text

### 📚 Dynamic Content System
- **Backend API**: Professional lessons loaded from PostgreSQL database
- **Real-time Loading**: Content fetched on app startup and cached for performance
- **Multiple Categories**: Greetings, food/dining, shopping, time expressions, social
- **Difficulty Levels**: Beginner, intermediate, and advanced content
- **Rich Metadata**: Estimated time, tags, vocabulary lists, descriptions
- **Audio Streaming**: Audio files served from backend for pronunciation practice

### 🎯 Interactive Reading Interface
- **Word-Based Learning**: Focus on individual vocabulary with clear pinyin-to-hanzi mapping
- **Interactive Grid**: Tappable word cards with visual selection feedback
- **Instant Translation**: Shows translation details when words are tapped
- **Document Management**: Save and organize custom Chinese texts
- **Dark/Light Mode**: Automatic theme switching based on system preferences

## Architecture

### Clean Separation of Concerns
The app follows a clean architecture pattern with clear separation between UI, business logic, and data:

**🏗️ Domain Layer** (`domain/AppState.ts`)
- Centralized state management using observer pattern
- Business logic for word selection and audio control
- No UI dependencies - fully testable

**📊 Service Layer** (`services/`)
- `apiService.ts` - HTTP client for backend API calls
- `contentService.ts` - Content loading with intelligent caching
- Backend integration with error handling and retry logic
- TypeScript interfaces shared between frontend and backend

**🎯 Components** (`components/`)
- `WordGrid.tsx` - Displays Chinese words with Pinyin in a responsive grid
- `TranslationView.tsx` - Shows selected word translations in footer
- `ChooseTextView.tsx` - Document and lesson selection with built-in content
- `AddTextView.tsx` - Text input and processing interface

**🔗 Hooks** (`hooks/useAppState.ts`)
- Custom hook connecting React components to domain layer
- Automatic re-renders on state changes
- Clean subscription management

**🛠️ Utilities** (`utils/`)
- `pinyinUtils.ts` - Pinyin conversion functions using real library
- `textProcessing.ts` - Chinese text parsing and word segmentation
- `storage.ts` - Document persistence and retrieval
- `audioUtils.ts` - Audio streaming from backend with platform compatibility

**📱 App.tsx**
- Pure layout structure and navigation logic
- View state management (reader, add text, choose text)
- Integration of all components

## Core Data Structures

### Word Structure
```typescript
interface Word {
  id: string;
  pinyin: string;    // Auto-generated from pinyin library
  hanzi: string;     // Chinese characters
  english: string;   // Translation
}
```

### Lesson Structure
```typescript
interface LessonData {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  estimatedTime: number;
  content: {
    chinese: string;
    sentences: Array<{
      chinese: string;
      english: string;
    }>;
  };
  vocabulary: Array<{
    chinese: string;
    english: string;
  }>;
  metadata: {
    dateCreated: string;
    dateModified: string;
    author: string;
    version: string;
  };
}
```

## Dynamic Content System

### Current Content (loaded from backend)
1. **Beginner Greetings** - Essential Chinese greetings and polite expressions
2. **Shopping Basics** - Essential phrases for shopping and bargaining
3. **Restaurant Ordering** - Learn to order food and drinks in Chinese restaurants
4. **Time and Dates** - Time expressions, dates, and scheduling phrases
5. **Coffee and Cake** - Social interactions and friendship vocabulary

### Content Categories
- **Greetings & Politeness** - Basic greetings and polite expressions
- **Food & Dining** - Restaurant and dining vocabulary  
- **Shopping & Commerce** - Commerce and shopping interactions
- **Time & Dates** - Time expressions and scheduling
- **Social & Friendship** - Social interactions and daily activities

### Adding New Content
1. Use backend API to create new content via POST endpoints
2. Or add directly to PostgreSQL database
3. Content appears immediately in app (no rebuild required)
4. Audio files can be uploaded and streamed from backend

## File Structure
```
native/
├── App.tsx                      # Main application component
├── services/                    # API service layer
│   ├── apiService.ts           # HTTP client for backend API
│   └── contentService.ts       # Content loading with caching
├── data/                        # Legacy data system (types only)
│   ├── README.md               # Data system documentation  
│   └── types.ts                # Data structure interfaces
├── domain/
│   └── AppState.ts             # Business logic & state management
├── hooks/
│   └── useAppState.ts          # React-domain layer connector
├── components/
│   ├── WordGrid.tsx            # Chinese word display grid
│   ├── TranslationView.tsx     # Translation footer component
│   ├── ChooseTextView.tsx      # Document/lesson selection
│   └── AddTextView.tsx         # Text input interface
├── utils/
│   ├── pinyinUtils.ts          # Pinyin conversion utilities
│   ├── textProcessing.ts       # Chinese text processing
│   ├── storage.ts              # Document persistence
│   └── audioUtils.ts           # Audio streaming from backend
├── types.ts                    # Core TypeScript interfaces
├── sampleData.ts               # Legacy sample data
├── index.html                  # Web HTML with flexbox constraints
├── index.js                    # Native app entry point
├── index.web.js                # Web app entry point
├── webpack.config.js           # Web build configuration
├── PINYIN_INTEGRATION.md       # Pinyin library documentation
└── package.json                # Dependencies including pinyin@4.0.0
```

## Pinyin Integration Features

### Available Functions
```typescript
// Basic conversion with tone marks
toPinyin('你好');                    // → "nǐ hǎo"

// Sentence conversion with proper spacing  
sentenceToPinyin('你好吗');          // → "nǐ hǎo ma"

// Without tone marks (for search/input)
toPinyinWithoutTones('你好');        // → "ni hao"

// Numeric tones
toPinyinWithNumericTones('你好');    // → "ni3 hao3"

// Chinese text detection
isChineseText('你好world');          // → true

// Batch conversion
batchToPinyin(['你', '好', '世', '界']); // → ["nǐ", "hǎo", "shì", "jiè"]
```

### Benefits Over Mock Data
- **Comprehensive Coverage**: Handles thousands of Chinese characters automatically
- **Proper Tone Marks**: Accurate tone marks (nǐ, hǎo, etc.)
- **Word Segmentation**: Intelligent spacing between words in sentences
- **Multiple Formats**: Support for tone marks, numeric tones, or no tones
- **Error Handling**: Graceful fallback for non-Chinese text
- **Performance**: Optimized for production use

## Development Workflow

### Prerequisites

#### Backend Dependencies
**Backend must be running** for the app to load content:
```bash
cd ../backend
npm run dev    # Starts backend API on localhost:3002
```

#### Android Development Setup
**Java Requirements:**
- **Java 17** (required for React Native Android builds)
- **NOT** Java 21, 22, 23, or 24 (these cause compatibility issues)

**Environment Variables Setup:**
React Native requires specific environment variables to be set:

**On macOS:**
```bash
# Find your Java 17 installation
/usr/libexec/java_home -V

# Set environment variables (replace paths with your actual paths)
export JAVA_HOME="/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"

# Make permanent by adding to ~/.zshrc or ~/.bashrc
echo 'export JAVA_HOME="/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"' >> ~/.zshrc
```

**On Linux:**
```bash
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"
```

**On Windows:**
```cmd
set JAVA_HOME=C:\Program Files\OpenJDK\openjdk-17
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%PATH%
```

**Android SDK Requirements:**
- **Android SDK API Level 35** (android-35)
- **Android Studio** with SDK Manager
- **Android Emulator** or physical device

**Verification:**
```bash
# Check React Native environment
npx react-native doctor

# Should show:
# ✓ JDK - Version found: 17.x.x (supported: >= 17 <= 20)
# ✓ Android SDK - Version found: 35.0.0
```

### Mobile Development
```bash
# iOS
npm run ios

# Android (requires environment setup above)
npm run android

# Metro bundler
npm run start
```

### Web Development
```bash
# Development server (localhost:3001)
npm run web

# Production build
npm run build:web
```

### Testing
```bash
npm run test

# Test pinyin conversion
node -e "
const { toPinyin, sentenceToPinyin } = require('./utils/pinyinUtils');
console.log('你好 →', toPinyin('你好'));
console.log('你好吗 →', sentenceToPinyin('你好吗'));
"

# Test backend connectivity
curl http://localhost:3002/health
curl http://localhost:3002/api/v1/content
```

## Layout Structure

### Critical: Flexbox Requirements
**⚠️ Important for Web Platform**: The `index.html` file must have proper flexbox constraints for the layout to work correctly:

```html
<html style="height: 100%;">
<head>...</head>
<body style="height: 100%; margin: 0;">
  <div id="app-root" style="height: 100%; display: flex; flex-direction: column;"></div>
</body>
</html>
```

### App Views
The app has three main views:

1. **Reader View** - Main reading interface with word grid
2. **Choose Text View** - Selection between built-in lessons and saved documents
3. **Add Text View** - Input and processing of custom Chinese text

### Component Layout (Reader View)
```
┌─────────────────────┐
│      Header         │ (Fixed height)
│  中文阅读器 + Audio  │
├─────────────────────┤
│                     │
│   ScrollView        │ (flex: 1)
│   WordGrid          │
│   (Scrollable)      │
│                     │
├─────────────────────┤
│ TranslationView     │ (Fixed height)
│   Footer            │
└─────────────────────┘
```

## User Experience Features

### Dynamic Content Interface
- **API-Powered Loading**: Content loaded from backend with loading states
- **Visual Distinction**: Content items have colored level badges and rich metadata
- **Category Organization**: Content grouped by topic (greetings, food, shopping, time, social)
- **Level Indicators**: Clear beginner/intermediate/advanced labeling
- **Estimated Time**: Shows approximate study duration
- **Professional Content**: Curated content with proper translations
- **Real-time Updates**: New content appears without app updates

### Text Processing
- **Automatic Pinyin**: Chinese input automatically gets pinyin using real library
- **Smart Segmentation**: Intelligent word boundaries for better reading
- **Error Recovery**: Handles mixed Chinese/English text gracefully
- **Instant Preview**: Real-time preview of processed text

### Reading Experience
- **Word-Level Interaction**: Tap individual words for detailed translations
- **Visual Feedback**: Selected words highlighted with clear borders
- **Responsive Grid**: Layout adapts to different screen sizes
- **Smooth Interactions**: Instant translation updates on word tap
- **Cross-Platform**: Consistent experience on mobile and web

## State Management
- **Observer Pattern**: Domain layer notifies components of state changes
- **Immutable Updates**: State changes create new objects for predictable updates
- **Centralized Logic**: All business logic contained in domain layer
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Document Persistence**: AsyncStorage for saving user-created content

## Backend Integration

### API Service Layer
- **HTTP Client**: Centralized API calls with error handling
- **Content Caching**: Intelligent caching for better performance
- **Type Safety**: Shared TypeScript interfaces between frontend and backend
- **Environment Detection**: Automatic dev/production API URL selection

### Cross-Platform Building
- **Metro Bundler**: Native iOS/Android builds with API integration
- **Webpack**: Web builds with proper CORS handling and API calls
- **Hot Reload**: Development changes reflected immediately
- **Production Ready**: Optimized builds for all platforms with proper API endpoints

## Future Expansion Ready

### Planned Enhancements
- **Audio Integration**: TTS pronunciation using pinyin output
- **Progressive Learning**: Spaced repetition and progress tracking
- **Advanced Content**: HSK-level lessons and specialized vocabulary
- **Interactive Exercises**: Practice modes beyond reading
- **User Contributions**: Community-generated lesson content

### Technical Roadmap
- **Audio Files**: Support for pronunciation audio in lesson data
- **Images**: Visual content integration for enhanced learning
- **Analytics**: Learning progress and performance tracking
- **Offline Support**: Cached content for offline reading
- **Cloud Sync**: Cross-device document synchronization

## Troubleshooting

### Common Android Issues

**"JDK - Version found: 24.0.1, Version supported: >= 17 <= 20"**
```bash
# Install Java 17 (macOS with Homebrew)
brew install openjdk@17

# Set JAVA_HOME to Java 17
export JAVA_HOME="/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home"
```

**"Android SDK - Versions found: N/A"**
```bash
# Verify Android SDK installation
ls -la ~/Library/Android/sdk/platforms  # Should show android-35

# Set ANDROID_HOME correctly
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

**"Metro bundler not running"**
```bash
# Start Metro bundler separately
npm run start

# Then in another terminal
npm run android
```

**Build fails with "Backend not running"**
```bash
# The app requires the backend API to load content
cd ../backend && npm run dev
# Then start the app
cd ../native && npm run android
```

## Development Notes

### Adding Custom Pinyin Functions
The pinyin library supports multiple output formats:
```typescript
import { PINYIN_STYLES } from './utils/pinyinUtils';

// Use different styles as needed
const pinyinWithTones = pinyin(text, { style: PINYIN_STYLES.TONE });
const pinyinNumeric = pinyin(text, { style: PINYIN_STYLES.TONE2 });
const pinyinNormal = pinyin(text, { style: PINYIN_STYLES.NORMAL });
```

### Extending the Content System
To add new content types:
1. Extend the backend API endpoints (see `../backend/README.md`)
2. Update the `LessonData` interface in `data/types.ts`
3. Modify the contentService for new data processing
4. Update UI components to handle new data types
5. Add new categories via backend API

### Web Platform Setup
Ensure proper flexbox styling and JSON module support:
- `index.html` needs complete height and flex styling
- `tsconfig.json` must have `resolveJsonModule: true`
- `webpack.config.js` configured for JSON imports

The backend integration, pinyin system, and dynamic content loading make ZiPop a comprehensive platform for Chinese language learning with scalable content management, real-time updates, and both professional content and user customization capabilities.

## Backend Dependencies
This React Native app requires the ZiPop backend to be running:
- **Backend API**: http://localhost:3002 (development)
- **Database**: PostgreSQL with lesson content
- **Audio Streaming**: MP3 files served from backend
- **Setup**: See `../backend/README.md` for backend setup instructions
