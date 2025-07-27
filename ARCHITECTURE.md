# ZiPop Architecture - Current State

## Project Overview
ZiPop is a React Native multilingual reading app for Chinese language learning with a clean architecture pattern. The app displays Chinese words with Pinyin above each character and shows English translations when tapped.

## Current Architecture (December 2024)

### Clean Separation Pattern
- **Domain Layer**: `native/domain/AppState.ts` - Business logic and state management
- **Components**: `native/components/` - Independent, reusable UI components  
- **Hooks**: `native/hooks/useAppState.ts` - React-domain layer connector
- **App Layout**: `native/App.tsx` - Pure layout structure (< 100 lines)

### Core Data Structure
Simple word-based learning focused on individual vocabulary:

```typescript
interface Word {
  id: string;
  pinyin: string;    // Romanization (e.g., "nǐ hǎo")
  hanzi: string;     // Chinese characters (e.g., "你好")
  english: string;   // Translation (e.g., "hello")
}
```

### Layout Pattern
Uses natural flexbox layout with three sections:
1. **Fixed Header** - Title and audio status
2. **Scrollable Content** - WordGrid with Chinese vocabulary (flex: 1)
3. **Fixed Footer** - TranslationView showing selected word details

### Critical Web Requirements
**⚠️ IMPORTANT**: `native/index.html` must have proper flexbox constraints:

```html
<html style="height: 100%;">
<body style="height: 100%; margin: 0;">
  <div id="app-root" style="height: 100%; display: flex; flex-direction: column;"></div>
</body>
</html>
```

Without these styles, the sticky footer layout will not work in web browsers.

### Key Components
- **`WordGrid.tsx`** - Displays Chinese words in responsive grid with tap interactions
- **`TranslationView.tsx`** - Shows translation details in footer when words are selected
- **`AppState.ts`** - Observer pattern state management with listener subscriptions
- **`useAppState.ts`** - Custom hook providing clean React integration

### State Management
- Observer pattern with listener subscriptions
- Immutable state updates
- Centralized business logic in domain layer
- Type-safe with full TypeScript coverage

### Current Features
- 20 sample Chinese words with pinyin and English translations
- Interactive word grid with visual selection feedback
- Instant translation updates in footer
- Dark/light mode support
- Cross-platform (iOS, Android, Web) compatibility

### Development Workflow
```bash
cd native
npm run web     # Web development (localhost:3001)
npm run ios     # iOS simulator
npm run android # Android emulator
npm run test    # Jest testing
```

### File Structure
```
native/
├── App.tsx                    # Layout only (< 100 lines)
├── domain/AppState.ts         # Business logic & state
├── hooks/useAppState.ts       # React connector
├── components/
│   ├── WordGrid.tsx          # Chinese word display
│   └── TranslationView.tsx   # Translation footer
├── types.ts                  # TypeScript interfaces
├── sampleData.ts             # Vocabulary data
└── index.html                # Web HTML (flexbox required!)
```

## Architecture Benefits
- **Independent Development**: Each layer works separately
- **Clean Testing**: Domain logic isolated and testable  
- **Maintainable**: Clear separation of concerns
- **Extensible**: Easy to add features without affecting other layers
- **Type Safe**: Full TypeScript coverage across all layers 