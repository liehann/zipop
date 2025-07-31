import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import multipart from '@fastify/multipart';
import { PrismaClient } from '@prisma/client';
import path from 'path';

import { contentRoutes } from './routes/content';
import { audioRoutes } from './routes/audio';
import { metadataRoutes } from './routes/metadata';

const prisma = new PrismaClient();

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

// Register plugins
app.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app-domain.com'] 
    : true, // Allow all origins in development
  credentials: true
});

app.register(multipart);

// Serve static files (audio, images, etc.)
app.register(staticFiles, {
  root: path.join(__dirname, '../static'),
  prefix: '/static/',
});

// Add Prisma to Fastify instance
app.decorate('prisma', prisma);

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

// Register routes
app.register(contentRoutes, { prefix: '/api/v1/content' });
app.register(audioRoutes, { prefix: '/api/v1/audio' });
app.register(metadataRoutes, { prefix: '/api/v1' });

// Health check
app.get('/health', async (request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  } catch (error) {
    reply.code(500);
    return { status: 'error', database: 'disconnected' };
  }
});

// Root endpoint
app.get('/', async (request, reply) => {
  return { 
    message: 'ZiPop Backend API',
    version: '1.0.0',
    endpoints: {
      content: '/api/v1/content',
      audio: '/api/v1/audio',
      categories: '/api/v1/categories',
      levels: '/api/v1/levels',
      static: '/static/',
      health: '/health'
    }
  };
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
    const host = process.env.HOST || '0.0.0.0';
    
    await app.listen({ port, host });
    console.log(`🚀 ZiPop Backend API running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

export default app;