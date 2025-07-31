# ZiPop Backend API

Backend API server for the ZiPop multilingual reading app, built with Node.js, Fastify, TypeScript, and SQLite.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database and seed with lesson data
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:3002`

## API Endpoints

### Content
- `GET /api/v1/content` - Get all content (with pagination and filtering)
- `GET /api/v1/content/:id` - Get specific content
- `GET /api/v1/content/featured` - Get featured content
- `GET /api/v1/content/category/:category` - Get content by category
- `GET /api/v1/content/level/:level` - Get content by level

### Audio
- `GET /api/v1/audio/:lessonId` - Stream lesson audio file
- `GET /api/v1/audio/:lessonId/info` - Get audio metadata

### Metadata
- `GET /api/v1/categories` - Get all categories with lesson counts
- `GET /api/v1/levels` - Get all levels with lesson counts  
- `GET /api/v1/index` - Get complete data index (like the original index.json)

### System
- `GET /health` - Health check endpoint
- `GET /` - API information and endpoint list

## Query Parameters

### Lessons endpoint (`/api/v1/lessons`)
- `category` - Filter by category ID
- `level` - Filter by level ID
- `featured` - Filter by featured status (true/false)
- `search` - Search in title and description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Example: `/api/v1/content?category=greetings&level=beginner&page=1&limit=10`

## Database

Uses SQLite with Prisma ORM for development. The database schema supports:

- **Categories**: Content categorization (greetings, food, shopping, etc.)
- **Levels**: Difficulty levels (beginner, intermediate, advanced)
- **Content**: Full content items with JSON fields for existing data structure

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database  
npm run db:push

# Seed database with content data from native app
npm run db:seed

# Reset database and reseed
npm run db:reset
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test
```

## Data Migration

The backend automatically imports content data from the native app's `data/` directory:

1. **Audio Files**: Copied from `native/assets/audio/` to `backend/audio/`
2. **Categories & Levels**: Imported from `native/data/index.json`
3. **Content**: All JSON files from `native/data/lessons/` imported with metadata

The original data structure is preserved in JSON fields, ensuring compatibility with the existing React Native app.

## Production Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=3002
DATABASE_URL="file:./prod.db"  # or PostgreSQL connection string
CORS_ORIGINS=https://your-app-domain.com
LOG_LEVEL=info
```

### Deployment Steps
1. Build the application: `npm run build`
2. Set up production database (SQLite or migrate to PostgreSQL)
3. Run migrations: `npm run db:push`
4. Seed database: `npm run db:seed`  
5. Start server: `npm start`

### Recommended Hosting
- **Railway** - Easiest deployment
- **DigitalOcean App Platform** - Good for production
- **AWS/Google Cloud** - Most scalable
- **Vercel** - For serverless deployment

## API Response Format

All API responses follow this structure:

```typescript
// Single item response
{
  "success": true,
  "data": { /* lesson/category/level data */ }
}

// Paginated response  
{
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}

// Error response
{
  "success": false,
  "message": "Error description"
}
```

## Architecture

- **Fastify**: High-performance web framework
- **Prisma**: Type-safe database ORM
- **SQLite**: File-based database (easily upgradeable to PostgreSQL)
- **Zod**: Runtime type validation
- **TypeScript**: Full type safety throughout

Audio files are served statically through Fastify with proper caching headers for optimal performance.