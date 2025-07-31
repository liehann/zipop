# ZiPop - Multilingual Reading App

## Overview
ZiPop is a React Native multilingual reading app designed for Chinese language learning. It displays Chinese text with automatic pinyin romanization and English translations, featuring dynamic content loading from a backend API. The app is built with TypeScript and supports iOS, Android, and Web platforms using a modern full-stack architecture.

## Technical Stack

### Frontend (React Native)
- **Framework**: React Native 0.80.1 with React 19.1.0
- **Language**: TypeScript 5.0.4  
- **Platforms**: iOS, Android, Web (via React Native Web + Webpack)
- **Architecture**: Clean architecture with domain layer separation
- **Build Tools**: Metro (mobile), Webpack (web)
- **Testing**: Jest with React Test Renderer

### Backend (Node.js API)
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Fastify (high-performance web framework)
- **Database**: PostgreSQL with Prisma ORM
- **API**: RESTful endpoints for content management
- **Audio**: Streaming audio files via HTTP
- **Development**: Hot reload with tsx

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
1. **Dynamic Content Loading**: Content fetched from backend API at runtime
2. **Word-Based Learning**: Focus on individual vocabulary with clear pinyin-to-hanzi mapping
3. **Interactive Grid**: Tappable word cards with visual selection feedback  
4. **Instant Translation**: Bottom footer shows translation details when words are tapped
5. **Audio Streaming**: Audio files streamed from backend server
6. **Content Management**: Backend API for managing lessons, categories, and levels
7. **Dark/Light Mode**: Automatic theme switching based on system preferences
8. **Cross-Platform**: Single codebase for iOS, Android, and Web

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

### Backend Development
```bash
cd backend
npm install              # Install dependencies
cp env.template .env     # Set up environment variables
npm run db:generate      # Generate Prisma client
npm run db:push          # Create database tables
npm run db:seed          # Populate with lesson data
npm run dev              # Start development server (localhost:3002)
```

### Frontend Development

#### Mobile Development
```bash
cd native
npm run ios      # iOS simulator
npm run android  # Android emulator  
npm run start    # Metro bundler
```

#### Web Development  
```bash
cd native
npm run web        # Development server (localhost:3001)
npm run build:web  # Production build
```

#### Testing
```bash
cd native
npm run test       # Run tests
```

### Full Stack Development
1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd native && npm run web`
3. **Access App**: http://localhost:3001 (connects to backend at :3002)

## Content System
Content is now dynamically loaded from the backend database:

### Available Lessons
- **Beginner Greetings**: Essential Chinese greetings and polite expressions
- **Shopping Basics**: Essential phrases for shopping and bargaining  
- **Restaurant Ordering**: Learn to order food and drinks in Chinese restaurants
- **Time and Dates**: Time expressions, dates, and scheduling phrases
- **Coffee and Cake**: Social interactions and friendship vocabulary

### Categories
- **Greetings & Politeness**: Basic greetings and polite expressions
- **Food & Dining**: Restaurant ordering and food-related vocabulary
- **Shopping & Commerce**: Shopping, bargaining, and commercial interactions
- **Time & Dates**: Time expressions, dates, and scheduling
- **Social & Friendship**: Social interactions and daily activities

## File Structure
```
zipop/
├── README.md
├── backend/                      # Backend API Server
│   ├── src/
│   │   ├── routes/
│   │   │   ├── content.ts        # Content CRUD operations
│   │   │   ├── audio.ts          # Audio streaming endpoints
│   │   │   └── metadata.ts       # Categories, levels, index
│   │   ├── scripts/seed.ts       # Database seeding
│   │   ├── types/index.ts        # Shared TypeScript types
│   │   └── app.ts                # Fastify application
│   ├── prisma/schema.prisma      # Database schema
│   ├── audio/                    # Audio files for streaming
│   ├── package.json              # Backend dependencies
│   └── README.md                 # Backend documentation
└── native/                       # React Native App
    ├── App.tsx                   # Main layout component
    ├── services/
    │   ├── apiService.ts         # HTTP client for backend API
    │   └── contentService.ts     # Content loading with caching
    ├── domain/
    │   └── AppState.ts           # Business logic & state
    ├── hooks/
    │   └── useAppState.ts        # React-domain connector
    ├── components/
    │   ├── WordGrid.tsx          # Chinese word display grid
    │   ├── TranslationView.tsx   # Translation footer
    │   ├── ChooseTextView.tsx    # Content selection (now API-powered)
    │   └── AddTextView.tsx       # Text input interface
    ├── utils/
    │   ├── pinyinUtils.ts        # Pinyin conversion utilities
    │   ├── textProcessing.ts     # Chinese text processing
    │   ├── storage.ts            # Document persistence
    │   └── audioUtils.ts         # Audio streaming from backend
    ├── data/                     # Legacy data system (still used for types)
    │   └── types.ts              # Data structure interfaces
    ├── types.ts                  # Core TypeScript interfaces
    ├── index.html                # Web HTML (needs flexbox!)
    ├── index.js                  # Native entry point
    ├── index.web.js              # Web entry point
    ├── webpack.config.js         # Web build config
    └── package.json              # Frontend dependencies
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
- **Full-Stack TypeScript**: Shared types between frontend and backend
- **Independent Development**: Frontend and backend can be developed separately
- **Dynamic Content**: Add new lessons without app updates
- **Scalable Backend**: PostgreSQL + Prisma for robust data management
- **High Performance**: Fastify backend with content caching
- **Testability**: Domain logic isolated and unit testable
- **Maintainability**: Clear separation of concerns across all layers
- **Audio Streaming**: Efficient audio delivery from backend
- **Real-time Updates**: Content changes reflected immediately

## API Documentation

### Content Endpoints
- `GET /api/v1/content` - Get all content (with pagination and filtering)
- `GET /api/v1/content/:id` - Get specific content item
- `GET /api/v1/content/featured` - Get featured content
- `GET /api/v1/content/category/:category` - Get content by category
- `GET /api/v1/content/level/:level` - Get content by level

### Audio Endpoints  
- `GET /api/v1/audio/:contentId` - Stream audio file
- `GET /api/v1/audio/:contentId/info` - Get audio metadata

### Metadata Endpoints
- `GET /api/v1/categories` - Get all categories with lesson counts
- `GET /api/v1/levels` - Get all levels with lesson counts
- `GET /api/v1/index` - Get complete content index

For detailed development information, see `native/README.md` and `backend/README.md`.
