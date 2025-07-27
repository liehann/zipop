# ZiPop - Multilingual Reading App

## Overview
ZiPop is a React Native multilingual reading app designed for Chinese language learning. It displays Chinese words with Pinyin romanization above each character, and shows English translations when words are tapped. The app is built with TypeScript and supports iOS, Android, and Web platforms using a clean architecture pattern.

## Technical Stack
- **Framework**: React Native 0.80.1 with React 19.1.0
- **Language**: TypeScript 5.0.4  
- **Platforms**: iOS, Android, Web (via React Native Web + Webpack)
- **Architecture**: Clean architecture with domain layer separation
- **Build Tools**: Metro (mobile), Webpack (web)
- **Testing**: Jest with React Test Renderer

## Architecture

### Clean Separation of Concerns
The app follows a clean architecture pattern:

**🏗️ Domain Layer** (`native/domain/AppState.ts`)
- Centralized state management using observer pattern
- Business logic for word selection and audio control
- No UI dependencies - fully testable

**🎯 Components** (`native/components/`)
- `WordGrid.tsx` - Displays Chinese words with Pinyin in responsive grid
- `TranslationView.tsx` - Shows selected word translations in footer
- Independent, reusable components with clear interfaces

**🔗 Hooks** (`native/hooks/useAppState.ts`)
- Custom hook connecting React components to domain layer
- Automatic re-renders on state changes
- Clean subscription management

**📱 App.tsx** (< 100 lines)
- Pure layout structure (header, scrollable content, footer)
- No business logic - only UI composition

## Key Features
1. **Word-Based Learning**: Focus on individual vocabulary with clear pinyin-to-hanzi mapping
2. **Interactive Grid**: Tappable word cards with visual selection feedback  
3. **Instant Translation**: Bottom footer shows translation details when words are tapped
4. **Audio Status Display**: Header shows playback time and controls
5. **Dark/Light Mode**: Automatic theme switching based on system preferences
6. **Cross-Platform**: Single codebase for iOS, Android, and Web

## Critical Setup Requirements

### Web Platform: Flexbox Layout
**⚠️ Important**: The `native/index.html` file must have proper flexbox constraints for the sticky footer layout to work:

```html
<html style="height: 100%;">
<head>...</head>
<body style="height: 100%; margin: 0;">
  <div id="app-root" style="height: 100%; display: flex; flex-direction: column;"></div>
</body>
</html>
```

Without these constraints, the layout will not work correctly in web browsers.

## Component Layout Structure
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

## Development Workflow

### Mobile Development
```bash
cd native
npm run ios      # iOS simulator
npm run android  # Android emulator  
npm run start    # Metro bundler
```

### Web Development  
```bash
cd native
npm run web        # Development server (localhost:3001)
npm run build:web  # Production build
```

### Testing
```bash
cd native
npm run test
```

## Sample Data
Currently includes 20 basic Chinese words covering:
- Greetings (你好, 谢谢, 再见)
- Basic pronouns (我, 你, 他, 她)
- Question words (什么, 哪儿, 谁, 为什么)
- Common adjectives (好, 大, 小)

## File Structure
```
zipop/
├── README.md
└── native/
    ├── App.tsx                    # Main layout (< 100 lines)
    ├── domain/
    │   └── AppState.ts           # Business logic & state
    ├── hooks/
    │   └── useAppState.ts        # React-domain connector
    ├── components/
    │   ├── WordGrid.tsx          # Chinese word display grid
    │   └── TranslationView.tsx   # Translation footer
    ├── types.ts                  # TypeScript interfaces
    ├── sampleData.ts             # Sample vocabulary
    ├── index.html                # Web HTML (needs flexbox!)
    ├── index.js                  # Native entry point
    ├── index.web.js              # Web entry point
    └── webpack.config.js         # Web build config
```

## Core Data Structure
```typescript
interface Word {
  id: string;
  pinyin: string;    // Romanization (e.g., "nǐ hǎo")
  hanzi: string;     // Chinese characters (e.g., "你好") 
  english: string;   // Translation (e.g., "hello")
}
```

## Architecture Benefits
- **Independent Development**: Each layer can be worked on separately
- **Testability**: Domain logic isolated and unit testable
- **Maintainability**: Clear separation of concerns
- **Reusability**: Components have clean interfaces
- **Scalability**: Easy to extend with new features

For detailed development information, see `native/README.md`.
