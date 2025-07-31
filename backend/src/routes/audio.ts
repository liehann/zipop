import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';
import { AudioInfo, ApiResponse } from '../types';

const audioParamsSchema = z.object({
  lessonId: z.string(),
});

export async function audioRoutes(fastify: FastifyInstance) {
  
  // GET /api/v1/audio/:lessonId/info - Get audio metadata
  fastify.get('/:lessonId/info', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { lessonId } = audioParamsSchema.parse(request.params);
      
      const content = await fastify.prisma.content.findUnique({
        where: { id: lessonId },
      });
      
      if (!content) {
        reply.code(404);
        return { success: false, message: 'Content not found' };
      }
      
      const audioConfig = content.audio as any;
      
      if (!audioConfig || !audioConfig.enabled) {
        reply.code(404);
        return { success: false, message: 'Audio not available for this content' };
      }
      
      const audioInfo: AudioInfo = {
        lessonId: content.id,
        filename: audioConfig.file,
        url: `/api/v1/audio/${lessonId}`,
        duration: audioConfig.totalDuration,
        hasTimings: audioConfig.hasTimings,
      };
      
      const response: ApiResponse<AudioInfo> = {
        success: true,
        data: audioInfo,
      };
      
      return response;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, message: 'Failed to fetch audio info' };
    }
  });
  
  // GET /api/v1/audio/:lessonId - Stream audio file
  fastify.get('/:lessonId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { lessonId } = audioParamsSchema.parse(request.params);
      
      const content = await fastify.prisma.content.findUnique({
        where: { id: lessonId },
      });
      
      if (!content) {
        reply.code(404);
        return { success: false, message: 'Content not found' };
      }
      
      const audioConfig = content.audio as any;
      
      if (!audioConfig || !audioConfig.enabled) {
        reply.code(404);
        return { success: false, message: 'Audio not available for this content' };
      }
      
      const audioPath = path.join(__dirname, '../../audio', audioConfig.file);
      
      try {
        await fs.access(audioPath);
        
        // Set appropriate headers for audio streaming
        reply.header('Content-Type', 'audio/mpeg');
        reply.header('Accept-Ranges', 'bytes');
        reply.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        // Send the file
        return reply.sendFile(audioConfig.file, path.join(__dirname, '../../audio'));
      } catch (fileError) {
        fastify.log.error(`Audio file not found: ${audioPath}`);
        reply.code(404);
        return { success: false, message: 'Audio file not found' };
      }
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, message: 'Failed to serve audio file' };
    }
  });
}