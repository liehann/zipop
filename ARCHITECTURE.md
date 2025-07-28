# ZiPop Architecture - Current State

## Project Overview
ZiPop is a React Native multilingual reading app for Chinese language learning with a clean architecture pattern. The app features automatic pinyin generation using a real library, built-in curated lessons loaded at build time, and user-generated content management.

## Architecture Overview (January 2025)

### Multi-Layer Clean Architecture
- **Domain Layer**: `native/domain/AppState.ts` - Business logic and state management
- **Data Layer**: `native/data/` - Build-time lesson loading and pinyin processing
- **Components**: `native/components/` - Independent, reusable UI components  
- **Hooks**: `native/hooks/useAppState.ts` - React-domain layer connector
- **Utilities**: `native/utils/` - Pinyin conversion and text processing
- **App Layout**: `native/App.tsx` - View management and navigation

### Core Data Structures

#### Word Structure (Runtime)
```typescript
interface Word {
  id: string;
  pinyin: string;    // Auto-generated from pinyin library
  hanzi: string;     // Chinese characters
  english: string;   // Translation
}
```

#### Lesson Structure (Build-time)
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
  vocabulary: VocabularyItem[];
  metadata: LessonMetadata;
}
```

## Data System Architecture

### Build-Time Lesson Loading
```
data/
├── index.json              # Lesson registry and metadata
├── dataLoader.ts           # Import and processing logic
├── types.ts                # TypeScript interfaces
└── lessons/
    ├── beginner-greetings.json
    ├── restaurant-ordering.json
    ├── shopping-basics.json
    └── time-and-dates.json
```

**Key Features:**
- **Static Imports**: All lessons imported at build time using `resolveJsonModule`
- **Type Safety**: Full TypeScript validation of lesson data
- **Automatic Processing**: Chinese text converted to structured Word objects
- **Bundle Optimization**: Only referenced lessons included in final build

### Processing Pipeline
1. **JSON Import** - Lessons loaded at build time
2. **Text Processing** - Chinese content parsed using `textProcessing.ts`
3. **Pinyin Generation** - Real pinyin library converts characters
4. **Word Creation** - Structured Word objects with IDs, hanzi, pinyin, english
5. **Runtime Access** - Components access processed data via `dataLoader.ts`

## Pinyin Integration Architecture

### Real Library Integration
- **Library**: `pinyin@4.0.0` by @hotoo (industry standard)
- **Utilities**: `utils/pinyinUtils.ts` provides clean API
- **Multiple Formats**: Tone marks, numeric tones, no tones
- **Error Handling**: Graceful fallback for non-Chinese text

### Pinyin Functions
```typescript
// Core conversion functions
toPinyin(text): string                    // With tone marks
sentenceToPinyin(text): string           // Sentence with spacing
toPinyinWithoutTones(text): string       // For search/input
toPinyinWithNumericTones(text): string   // ni3 hao3 format
isChineseText(text): boolean             // Text detection
batchToPinyin(texts[]): string[]         // Batch processing
```

### Integration Points
- **Text Processing**: Automatic pinyin during Chinese text parsing
- **User Input**: Real-time pinyin generation for custom text
- **Search**: Tone-less pinyin for better search matching
- **Display**: Multiple pinyin formats for different UI needs

## Component Architecture

### App-Level Structure
```typescript
// App.tsx - View state management
type ViewState = 'reader' | 'addText' | 'chooseText';

// Three main views:
// 1. Reader - WordGrid + TranslationView
// 2. AddText - Text input and processing
// 3. ChooseText - Built-in lessons + saved documents
```

### Component Responsibilities

#### WordGrid.tsx
- Displays processed Chinese words in responsive grid
- Handles word selection and visual feedback
- Integrates with domain layer for state updates

#### TranslationView.tsx
- Shows detailed translation for selected words
- Footer position with word pronunciation and meaning
- Dark/light mode support

#### ChooseTextView.tsx
- **Dual Sources**: Built-in lessons + saved documents
- **Rich Metadata**: Level badges, categories, estimated time
- **Visual Distinction**: Built-in lessons have special styling
- **Document Management**: Save/delete user content

#### AddTextView.tsx
- Text input interface for custom Chinese content
- Real-time pinyin processing preview
- Integration with text processing pipeline

### Layout Pattern
Uses natural flexbox layout with three sections:
1. **Fixed Header** - Navigation and status
2. **Scrollable Content** - Main content area (flex: 1)
3. **Fixed Footer** - Translation details (Reader view only)

### Critical Web Requirements
**⚠️ ESSENTIAL**: `native/index.html` must have proper flexbox constraints:

```html
<html style="height: 100%;">
<body style="height: 100%; margin: 0;">
  <div id="app-root" style="height: 100%; display: flex; flex-direction: column;"></div>
</body>
</html>
```

Without these styles, the sticky footer layout will not work in web browsers.

## State Management Architecture

### Domain Layer (AppState.ts)
- **Observer Pattern**: Listener-based state updates
- **Immutable State**: New objects for each state change
- **Business Logic**: Word selection, audio state, navigation
- **No UI Dependencies**: Fully testable in isolation

### React Integration (useAppState.ts)
- **Custom Hook**: Clean connection between React and domain
- **Automatic Subscriptions**: Components re-render on state changes
- **Cleanup Management**: Proper listener disposal

### Document Persistence
- **AsyncStorage**: Local storage for user-created documents
- **Type Safety**: SavedDocument interface for all stored content
- **Error Handling**: Graceful failure recovery

## Build System Integration

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "resolveJsonModule": true,  // Enable JSON imports
    "strict": true,             // Full type checking
    "module": "esnext"          // Modern module system
  }
}
```

### Platform Support
- **Metro Bundler**: Native builds with JSON import support
- **Webpack**: Web builds with proper JSON loading
- **Hot Reload**: Development changes reflected immediately
- **Production Optimization**: Tree shaking and bundle splitting

### JSON Import Pattern
```typescript
// Static imports at build time
import dataIndex from './index.json';
import lessonData from './lessons/beginner-greetings.json';

// Registry pattern for runtime access
const lessonRegistry: Record<string, LessonData> = {
  'beginner-greetings': lessonData as LessonData,
  // ...other lessons
};
```

## File Structure
```
native/
├── App.tsx                      # View management and navigation
├── data/                        # Build-time content system
│   ├── index.json              # Lesson registry
│   ├── dataLoader.ts           # Import and processing
│   ├── types.ts                # Data structure interfaces
│   └── lessons/                # Individual lesson files
├── domain/AppState.ts           # Business logic & observer pattern
├── hooks/useAppState.ts         # React integration layer
├── components/                  # UI components
│   ├── WordGrid.tsx            # Chinese word display
│   ├── TranslationView.tsx     # Translation footer
│   ├── ChooseTextView.tsx      # Document/lesson selection
│   └── AddTextView.tsx         # Text input interface
├── utils/                       # Processing utilities
│   ├── pinyinUtils.ts          # Pinyin library integration
│   ├── textProcessing.ts       # Chinese text parsing
│   └── storage.ts              # Document persistence
├── types.ts                     # Core interfaces
├── index.html                   # Web entry (flexbox critical!)
└── package.json                 # pinyin@4.0.0 dependency
```

## Development Workflow

### Adding New Lessons
1. **Create JSON** - Follow LessonData interface in `data/lessons/`
2. **Update Index** - Add metadata to `data/index.json`
3. **Import** - Add to registry in `data/dataLoader.ts`
4. **Build** - Lesson appears automatically in app

### Testing Strategy
- **Domain Layer**: Unit tests for business logic (no UI dependencies)
- **Pinyin Functions**: Test Chinese conversion accuracy
- **Component Tests**: React Test Renderer for UI components
- **Integration**: End-to-end lesson loading and processing

### Platform Development
```bash
# Native development
npm run ios
npm run android
npm run start

# Web development  
npm run web          # Development server
npm run build:web    # Production build

# Testing
npm run test
```

## Architecture Benefits

### Scalability
- **Clean Separation**: Each layer can evolve independently
- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Modular Design**: Components and utilities easily extended
- **Build-Time Optimization**: Only used content included in bundles

### Maintainability
- **Predictable State**: Observer pattern with immutable updates
- **Testing**: Domain logic isolated and fully testable
- **Documentation**: Self-documenting code with TypeScript interfaces
- **Consistent Patterns**: Standard approaches across all components

### Performance
- **Build-Time Loading**: No runtime JSON parsing
- **Bundle Optimization**: Tree shaking removes unused lessons
- **Efficient Pinyin**: Library optimized for production use
- **Memory Management**: Proper React lifecycle and cleanup

### Future-Ready
- **Extensible Data**: Easy to add new lesson types and metadata
- **Plugin Architecture**: Pinyin utilities support multiple output formats
- **Cross-Platform**: Single codebase with platform-specific optimizations
- **Internationalization**: Architecture supports additional languages

The architecture provides a solid foundation for a comprehensive Chinese learning platform while maintaining clean separation of concerns and excellent developer experience. 