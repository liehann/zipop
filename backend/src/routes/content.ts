import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ApiResponse, PaginatedResponse, LessonQuery, LessonData } from '../types';

// Validation schemas
const contentQuerySchema = z.object({
  category: z.string().optional(),
  level: z.string().optional(), 
  featured: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
});

const contentParamsSchema = z.object({
  id: z.string(),
});

export async function contentRoutes(fastify: FastifyInstance) {
  
  // GET /api/v1/content - Get all content with filtering and pagination
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = contentQuerySchema.parse(request.query);
      
      const where: any = {};
      
      // Apply filters
      if (query.category) where.categoryId = query.category;
      if (query.level) where.levelId = query.level;
      if (query.featured !== undefined) where.featured = query.featured;
      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } }
        ];
      }
      
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;
      
      // Get total count
      const total = await fastify.prisma.content.count({ where });
      
      // Get content
      const content = await fastify.prisma.content.findMany({
        where,
        include: {
          category: true,
          level: true,
        },
        orderBy: [
          { featured: 'desc' },
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      });
      
      const response: PaginatedResponse<LessonData> = {
        data: content.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          level: item.level.id as 'beginner' | 'intermediate' | 'advanced',
          category: item.category.id,
          tags: item.tags as string[],
          estimatedTime: item.estimatedTime,
          content: item.content as any,
          vocabulary: item.vocabulary as any[],
          metadata: item.metadata as any,
          audio: item.audio as any,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
      
      return response;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, message: 'Failed to fetch content' };
    }
  });
  
  // GET /api/v1/content/:id - Get specific content
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = contentParamsSchema.parse(request.params);
      
      const content = await fastify.prisma.content.findUnique({
        where: { id },
        include: {
          category: true,
          level: true,
        },
      });
      
      if (!content) {
        reply.code(404);
        return { success: false, message: 'Content not found' };
      }
      
      const response: ApiResponse<LessonData> = {
        success: true,
        data: {
          id: content.id,
          title: content.title,
          description: content.description,
          level: content.level.id as 'beginner' | 'intermediate' | 'advanced',
          category: content.category.id,
          tags: content.tags as string[],
          estimatedTime: content.estimatedTime,
          content: content.content as any,
          vocabulary: content.vocabulary as any[],
          metadata: content.metadata as any,
          audio: content.audio as any,
        },
      };
      
      return response;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, message: 'Failed to fetch content' };
    }
  });
  
  // GET /api/v1/content/featured - Get featured content
  fastify.get('/featured', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const content = await fastify.prisma.content.findMany({
        where: { featured: true },
        include: {
          category: true,
          level: true,
        },
        orderBy: { order: 'asc' },
      });
      
      const response: ApiResponse<LessonData[]> = {
        success: true,
        data: content.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          level: item.level.id as 'beginner' | 'intermediate' | 'advanced',
          category: item.category.id,
          tags: item.tags as string[],
          estimatedTime: item.estimatedTime,
          content: item.content as any,
          vocabulary: item.vocabulary as any[],
          metadata: item.metadata as any,
          audio: item.audio as any,
        })),
      };
      
      return response;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, message: 'Failed to fetch featured content' };
    }
  });
  
  // GET /api/v1/content/category/:category - Get content by category
  fastify.get('/category/:category', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { category } = z.object({ category: z.string() }).parse(request.params);
      
      const content = await fastify.prisma.content.findMany({
        where: { categoryId: category },
        include: {
          category: true,
          level: true,
        },
        orderBy: [
          { featured: 'desc' },
          { order: 'asc' }
        ],
      });
      
      const response: ApiResponse<LessonData[]> = {
        success: true,
        data: content.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          level: item.level.id as 'beginner' | 'intermediate' | 'advanced',
          category: item.category.id,
          tags: item.tags as string[],
          estimatedTime: item.estimatedTime,
          content: item.content as any,
          vocabulary: item.vocabulary as any[],
          metadata: item.metadata as any,
          audio: item.audio as any,
        })),
      };
      
      return response;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, message: 'Failed to fetch content by category' };
    }
  });
  
  // GET /api/v1/content/level/:level - Get content by level
  fastify.get('/level/:level', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { level } = z.object({ level: z.string() }).parse(request.params);
      
      const content = await fastify.prisma.content.findMany({
        where: { levelId: level },
        include: {
          category: true,
          level: true,
        },
        orderBy: [
          { featured: 'desc' },
          { order: 'asc' }
        ],
      });
      
      const response: ApiResponse<LessonData[]> = {
        success: true,
        data: content.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          level: item.level.id as 'beginner' | 'intermediate' | 'advanced',
          category: item.category.id,
          tags: item.tags as string[],
          estimatedTime: item.estimatedTime,
          content: item.content as any,
          vocabulary: item.vocabulary as any[],
          metadata: item.metadata as any,
          audio: item.audio as any,
        })),
      };
      
      return response;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, message: 'Failed to fetch content by level' };
    }
  });
}