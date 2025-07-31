import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponse, Category, Level, DataIndex } from '../types';

export async function metadataRoutes(fastify: FastifyInstance) {
  
  // GET /api/v1/categories - Get all categories
  fastify.get('/categories', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const categories = await fastify.prisma.category.findMany({
        include: {
          _count: {
            select: { lessons: true }
          }
        },
        orderBy: { name: 'asc' }
      });
      
      const response: ApiResponse<Array<Category & { count: number }>> = {
        success: true,
        data: categories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          count: category._count.content,
        })),
      };
      
      return response;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, message: 'Failed to fetch categories' };
    }
  });
  
  // GET /api/v1/levels - Get all levels
  fastify.get('/levels', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const levels = await fastify.prisma.level.findMany({
        include: {
          _count: {
            select: { lessons: true }
          }
        },
        orderBy: { 
          id: 'asc' // This will order: beginner, intermediate, advanced
        }
      });
      
      const response: ApiResponse<Array<Level & { count: number }>> = {
        success: true,
        data: levels.map(level => ({
          id: level.id,
          name: level.name,
          description: level.description,
          count: level._count.content,
        })),
      };
      
      return response;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, message: 'Failed to fetch levels' };
    }
  });
  
  // GET /api/v1/index - Get data index (similar to your current index.json)
  fastify.get('/index', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [categories, levels, contentCount, content] = await Promise.all([
        fastify.prisma.category.findMany({ orderBy: { name: 'asc' } }),
        fastify.prisma.level.findMany({ orderBy: { id: 'asc' } }),
        fastify.prisma.content.count(),
        fastify.prisma.content.findMany({
          select: {
            id: true,
            title: true,
            levelId: true,
            categoryId: true,
            estimatedTime: true,
            featured: true,
            order: true,
          },
          orderBy: { order: 'asc' }
        })
      ]);
      
      const dataIndex: DataIndex = {
        version: '2.0', // Bumped version to indicate backend-powered
        lastUpdated: new Date().toISOString(),
        totalLessons: contentCount,
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
        })),
        levels: levels.map(level => ({
          id: level.id,
          name: level.name,
          description: level.description,
        })),
        lessons: content.map(item => ({
          id: item.id,
          file: `lessons/${item.id}.json`, // Kept for compatibility
          title: item.title,
          level: item.levelId as 'beginner' | 'intermediate' | 'advanced',
          category: item.categoryId,
          estimatedTime: item.estimatedTime,
          featured: item.featured,
          order: item.order,
        })),
      };
      
      const response: ApiResponse<DataIndex> = {
        success: true,
        data: dataIndex,
      };
      
      return response;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, message: 'Failed to fetch data index' };
    }
  });
}