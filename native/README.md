# ZiPop - Multilingual Reading App

## Overview
ZiPop is a React Native multilingual reading app designed for Chinese language learning. It displays Chinese text with automatic pinyin romanization and English translations, featuring both built-in curated lessons and user-created content. The app is built with TypeScript and supports iOS, Android, and Web platforms.

## Technical Stack
- **Framework**: React Native 0.80.1 with React 19.1.0
- **Language**: TypeScript 5.0.4
- **Platforms**: iOS, Android, Web (via React Native Web + Webpack)
- **Build Tools**: Metro (mobile), Webpack (web)  
- **Testing**: Jest with React Test Renderer
- **Architecture**: Clean architecture with domain layer separation
- **Pinyin Library**: `pinyin@4.0.0` by @hotoo for accurate Chinese-to-pinyin conversion
- **Data System**: Build-time JSON imports for lesson content

## Major Features

### 🔤 Automatic Pinyin Generation
- **Real Pinyin Library**: Uses the industry-standard `pinyin` library by @hotoo
- **Comprehensive Coverage**: Handles thousands of Chinese characters automatically
- **Multiple Formats**: Tone marks (nǐ hǎo), without tones (ni hao), numeric tones (ni3 hao3)
- **Word Segmentation**: Intelligent spacing between words in sentences
- **Error Handling**: Graceful fallback for non-Chinese text

### 📚 Built-in Lesson System
- **Curated Content**: Professional lessons loaded at build time
- **Structured Data**: JSON-based lesson format with metadata
- **Multiple Categories**: Greetings, food/dining, shopping, time expressions
- **Difficulty Levels**: Beginner, intermediate, and advanced content
- **Rich Metadata**: Estimated time, tags, vocabulary lists, descriptions

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

**📊 Data Layer** (`data/`)
- Build-time lesson loading system
- TypeScript interfaces for all data structures
- Automatic pinyin processing pipeline
- Lesson categorization and metadata

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

## Built-in Content System

### Current Lessons
1. **Beginner Greetings** - Essential Chinese greetings and polite expressions
2. **Shopping Basics** - Essential phrases for shopping and bargaining
3. **Restaurant Ordering** - Learn to order food and drinks in Chinese restaurants
4. **Time and Dates** - Time expressions, dates, and scheduling phrases

### Content Categories
- **Greetings** - Basic greetings and politeness
- **Food** - Restaurant and dining vocabulary  
- **Shopping** - Commerce and shopping interactions
- **Time** - Time expressions and scheduling

### Adding New Lessons
1. Create JSON file in `data/lessons/`
2. Update `data/index.json` with lesson metadata
3. Add import to `data/dataLoader.ts`
4. Lesson appears automatically in app

## File Structure
```
native/
├── App.tsx                      # Main application component
├── data/                        # Lesson content system
│   ├── README.md               # Data system documentation
│   ├── index.json              # Lesson index and metadata
│   ├── types.ts                # Data structure interfaces
│   ├── dataLoader.ts           # Build-time lesson loading
│   └── lessons/                # Individual lesson files
│       ├── beginner-greetings.json
│       ├── restaurant-ordering.json
│       ├── shopping-basics.json
│       └── time-and-dates.json
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
│   └── storage.ts              # Document persistence
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

### Mobile Development
```bash
# iOS
npm run ios

# Android  
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

### Built-in Lessons Interface
- **Visual Distinction**: Built-in lessons have colored level badges and rich metadata
- **Category Organization**: Lessons grouped by topic (greetings, food, shopping, time)
- **Level Indicators**: Clear beginner/intermediate/advanced labeling
- **Estimated Time**: Shows approximate study duration
- **Professional Content**: Curated lessons with proper translations

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

## Build System Integration

### JSON Import Support
- **TypeScript Configuration**: `resolveJsonModule: true` enables JSON imports
- **Build-Time Loading**: All lesson data imported at compile time
- **Type Safety**: JSON content validated against TypeScript interfaces
- **Bundle Optimization**: Only referenced lessons included in final bundle

### Cross-Platform Building
- **Metro Bundler**: Native iOS/Android builds with full JSON support
- **Webpack**: Web builds with proper JSON loading and type checking
- **Hot Reload**: Development changes reflected immediately
- **Production Ready**: Optimized builds for all platforms

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

### Extending the Data System
To add new lesson types:
1. Extend the `LessonData` interface in `data/types.ts`
2. Update the data loader processing pipeline
3. Modify the UI components to handle new data types
4. Add new categories to the index file

### Web Platform Setup
Ensure proper flexbox styling and JSON module support:
- `index.html` needs complete height and flex styling
- `tsconfig.json` must have `resolveJsonModule: true`
- `webpack.config.js` configured for JSON imports

The data system and pinyin integration make ZiPop a comprehensive platform for Chinese language learning with both professional content and user customization capabilities.
