# Migration to Backend API

This document outlines the migration from build-time JSON data loading to a dynamic backend API system.

## What Changed

### Before (v1.0 - Build-time Data)
- ✅ Content loaded at build time from JSON files
- ✅ Audio files bundled with app
- ✅ Static lesson system with manual updates
- ✅ `dataLoader.ts` for lesson management

### After (v2.0 - Backend API)
- ✅ Content loaded dynamically from PostgreSQL database
- ✅ Audio files streamed from backend server
- ✅ Real-time content updates without app rebuilds
- ✅ `apiService.ts` + `contentService.ts` for API integration

## Technical Changes

### Database
- **Old**: Local JSON files in `native/data/lessons/`
- **New**: PostgreSQL database with Prisma ORM
- **Migration**: Run `npm run db:seed` to import existing JSON data

### Content Loading
- **Old**: `import lesson from './data/lessons/lesson.json'`
- **New**: `await contentService.getContentById('lesson-id')`
- **Migration**: `dataLoader.ts` functions replaced with `contentService.ts`

### Audio System
- **Old**: Local files in `native/assets/audio/`
- **New**: Streaming from `http://localhost:3002/api/v1/audio/:contentId`
- **Migration**: `audioUtils.ts` updated to use backend URLs

### Data Types
- **Old**: `Lesson` model in database and APIs
- **New**: `Content` model (more generic for multimedia content)
- **Migration**: All references updated throughout codebase

## New Architecture

### Service Layer (New)
```typescript
// API Communication
apiService.ts           // HTTP client for backend
contentService.ts       // Content loading with caching

// Old system (removed)
dataLoader.ts          // Build-time lesson loading
```

### Backend API (New)
```
GET /api/v1/content               # Get all content
GET /api/v1/content/:id          # Get specific content
GET /api/v1/content/featured     # Get featured content
GET /api/v1/audio/:contentId     # Stream audio
GET /api/v1/categories           # Get categories
GET /api/v1/levels              # Get levels
```

### Database Schema (New)
```sql
Content    # Lessons/stories/dialogues (was: Lesson)
Category   # Content categorization  
Level      # Difficulty levels
```

## Development Workflow Changes

### Old Workflow
```bash
cd native
npm run web              # App loads with bundled data
```

### New Workflow
```bash
# Terminal 1: Start Backend
cd backend
npm run dev              # Backend API on :3002

# Terminal 2: Start Frontend
cd native  
npm run web              # Frontend on :3001, connects to :3002
```

## Key Benefits

### For Users
- ✅ **Fresh Content**: New lessons appear without app updates
- ✅ **Better Performance**: Content cached intelligently
- ✅ **Audio Streaming**: No large audio files to download

### For Developers
- ✅ **Content Management**: Easy to add/edit content via API
- ✅ **Scalability**: Database handles thousands of lessons
- ✅ **Analytics**: Track content usage and performance
- ✅ **A/B Testing**: Test different content versions

### For Deployment
- ✅ **Smaller Apps**: No bundled content reduces app size
- ✅ **Dynamic Updates**: Content changes without app store updates
- ✅ **Multi-platform**: Same backend serves iOS, Android, Web

## Compatibility

### Maintained Features
- ✅ All existing UI/UX remains the same
- ✅ Pinyin generation still works identically
- ✅ Word selection and translation features unchanged
- ✅ Dark/light mode and responsive design preserved
- ✅ User-created documents still supported

### Enhanced Features
- ✅ **Loading States**: Better feedback during content loading
- ✅ **Error Handling**: Graceful handling of connection issues
- ✅ **Caching**: Smarter content caching for offline usage
- ✅ **Real-time**: Content updates appear immediately

## Breaking Changes

### Environment Setup
- **Required**: Backend server must be running for app to function
- **Database**: PostgreSQL required (was: no database)
- **Dependencies**: Additional backend dependencies

### API Dependencies
- **Network Required**: App needs internet connection for initial load
- **Backend URL**: Must configure correct backend URL for production
- **CORS**: Web app requires CORS configuration

## Migration Steps

If you have the old version and want to update:

1. **Set up Backend**:
   ```bash
   cd backend
   npm install
   cp env.template .env
   npm run db:push
   npm run db:seed
   ```

2. **Update Frontend**:
   ```bash
   cd native
   npm install  # Gets new service layer dependencies
   ```

3. **Start Both Servers**:
   ```bash
   # Backend (required)
   cd backend && npm run dev
   
   # Frontend  
   cd native && npm run web
   ```

4. **Verify Migration**:
   - App loads content from backend
   - Audio streams from backend
   - No console errors about missing files

## Rollback Plan

To revert to the old system:
1. Checkout the last commit before backend migration
2. Use `git revert` to undo the migration commits
3. Old build-time system will work immediately

The migration preserves all existing functionality while adding the benefits of a modern backend architecture.