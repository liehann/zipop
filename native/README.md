# ZiPop - Multilingual Reading App

## Overview
ZiPop is a React Native multilingual reading app designed for Chinese language learning. It displays Chinese words with Pinyin romanization above each character, and shows English translations when words are tapped. The app is built with TypeScript and supports iOS, Android, and Web platforms.

## Technical Stack
- **Framework**: React Native 0.80.1 with React 19.1.0
- **Language**: TypeScript 5.0.4
- **Platforms**: iOS, Android, Web (via React Native Web + Webpack)
- **Build Tools**: Metro (mobile), Webpack (web)  
- **Testing**: Jest with React Test Renderer
- **Architecture**: Clean architecture with domain layer separation

## Architecture

### Clean Separation of Concerns
The app follows a clean architecture pattern with clear separation between UI, business logic, and data:

**🏗️ Domain Layer** (`domain/AppState.ts`)
- Centralized state management using observer pattern
- Business logic for word selection and audio control
- No UI dependencies - fully testable

**🎯 Components** (`components/`)
- `WordGrid.tsx` - Displays Chinese words with Pinyin in a responsive grid
- `TranslationView.tsx` - Shows selected word translations in footer
- Independent, reusable components with clear interfaces

**🔗 Hooks** (`hooks/useAppState.ts`)
- Custom hook connecting React components to domain layer
- Automatic re-renders on state changes
- Clean subscription management

**📱 App.tsx** (< 100 lines)
- Pure layout structure (header, scrollable content, footer)
- No business logic - only UI composition

## Core Data Structure
The app uses a simple, flat word-based structure:

```typescript
interface Word {
  id: string;
  pinyin: string;    // Romanization (e.g., "nǐ hǎo")
  hanzi: string;     // Chinese characters (e.g., "你好")
  english: string;   // Translation (e.g., "hello")
}
```

## Key Features
1. **Word-Based Learning**: Focus on individual vocabulary with clear pinyin-to-hanzi mapping
2. **Interactive Grid**: Tappable word cards with visual selection feedback
3. **Instant Translation**: Bottom footer shows translation details when words are tapped
4. **Audio Status Display**: Header shows playback time and controls
5. **Dark/Light Mode**: Automatic theme switching based on system preferences
6. **Responsive Design**: Adapts to different screen sizes and orientations
7. **Cross-Platform**: Single codebase for iOS, Android, and Web

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

### Component Layout
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

## File Structure
```
native/
├── App.tsx                    # Main layout component (< 100 lines)
├── domain/
│   └── AppState.ts           # Business logic & state management
├── hooks/
│   └── useAppState.ts        # React-domain layer connector
├── components/
│   ├── WordGrid.tsx          # Chinese word display grid
│   └── TranslationView.tsx   # Translation footer component
├── types.ts                  # TypeScript interfaces
├── sampleData.ts             # Sample vocabulary data
├── index.html                # Web HTML with flexbox constraints
├── index.js                  # Native app entry point
├── index.web.js              # Web app entry point
└── webpack.config.js         # Web build configuration
```

## Sample Content
Currently includes 20 basic Chinese words covering:
- Greetings (你好, 谢谢, 再见)
- Basic pronouns (我, 你, 他, 她)
- Question words (什么, 哪儿, 谁, 为什么)
- Common adjectives (好, 大, 小)

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
```

## User Experience Features
- **Grid Layout**: Chinese characters with pinyin above in responsive cards
- **Visual Feedback**: Selected words highlighted with orange border
- **Touch Optimized**: Proper touch targets for mobile devices
- **Smooth Interactions**: Instant translation updates on word tap
- **Consistent Theming**: Dark/light mode support across all components
- **Safe Area Handling**: Proper layout on devices with notches
- **Web Compatibility**: Full functionality in web browsers

## State Management
- **Observer Pattern**: Domain layer notifies components of state changes
- **Immutable Updates**: State changes create new objects for predictable updates
- **Centralized Logic**: All business logic contained in domain layer
- **Type Safety**: Full TypeScript coverage with proper interfaces

## Styling Architecture
- **Component-Scoped**: Each component manages its own styles
- **Responsive Design**: Flexbox layouts adapt to screen sizes
- **Theme Support**: Dynamic colors based on system preferences
- **Typography**: Optimized fonts for Chinese character rendering
- **Cross-Platform**: Consistent appearance on iOS, Android, and Web

## Future Expansion Ready
- **Audio Integration**: Architecture supports TTS and audio playback features
- **Data Sources**: Easy to swap sample data for API or file-based content
- **Component Extension**: Modular components can be enhanced independently
- **Testing**: Domain layer separation enables comprehensive unit testing
- **Scalability**: Clean architecture supports adding more complex features

## Development Notes

### Adding New Words
Add to `sampleData.ts`:
```typescript
{
  id: 'unique-id',
  pinyin: 'pronunciation',
  hanzi: '汉字',
  english: 'translation'
}
```

### Extending Components
Each component is self-contained and can be modified independently:
- `WordGrid` for display customization
- `TranslationView` for footer enhancements  
- Domain layer for business logic changes

### Web Platform Setup
Ensure `index.html` has proper flexbox styling for layout to work correctly. The container must have `height: 100%` and `display: flex; flex-direction: column` for the sticky footer pattern to function.
