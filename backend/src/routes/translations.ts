import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponse } from '../types';
import { cedictService } from '../services/cedictService';

// Simple type for params since we're keeping it minimal
interface UpdateTranslationsParams {
  contentId?: string;
}

export async function translationRoutes(fastify: FastifyInstance) {
  
  // POST /api/v1/translations/update - Update translations using CEDICT
  // Can update all content or specific content by ID
  fastify.post('/update/:contentId?', async (request: FastifyRequest<{Params: UpdateTranslationsParams}>, reply: FastifyReply) => {
    try {
      const { contentId } = request.params;

      // Load CEDICT dictionary if not already loaded
      await cedictService.loadDictionary();
      const dictStats = cedictService.getStats();
      
      if (!dictStats.loaded) {
        reply.code(500);
        return { success: false, message: 'Failed to load CEDICT dictionary' };
      }

      let contentItems;
      
      if (contentId) {
        // Update specific content item
        const content = await fastify.prisma.content.findUnique({
          where: { id: contentId }
        });
        
        if (!content) {
          reply.code(404);
          return { success: false, message: `Content not found: ${contentId}` };
        }
        
        contentItems = [content];
      } else {
        // Update all content items
        contentItems = await fastify.prisma.content.findMany();
      }

      let totalUpdated = 0;
      let totalEnhanced = 0;
      const results = [];

      for (const content of contentItems) {
        try {
          const originalVocabulary = content.vocabulary as Array<{ chinese: string; english: string }>;
          const lessonContent = content.content as { chinese: string; sentences: Array<{ chinese: string }> };
          const originalVocabCount = originalVocabulary.length;
          
          // Expand vocabulary to include all characters and words from content with CEDICT translations
          const expandedVocabulary = cedictService.expandLessonVocabulary(lessonContent, originalVocabulary);
          
          // Count enhancements
          const enhancedCount = expandedVocabulary.filter(item => {
            const original = originalVocabulary.find(orig => orig.chinese === item.chinese);
            return !original || original.english !== item.english;
          }).length;
          
          const newItemsCount = expandedVocabulary.length - originalVocabCount;
          
          // Update the content in database
          await fastify.prisma.content.update({
            where: { id: content.id },
            data: {
              vocabulary: expandedVocabulary,
              updatedAt: new Date()
            }
          });

          totalUpdated++;
          totalEnhanced += enhancedCount;
          
          results.push({
            contentId: content.id,
            title: content.title,
            originalCount: originalVocabCount,
            expandedCount: expandedVocabulary.length,
            enhancedCount,
            newItemsCount,
            charactersAdded: expandedVocabulary.filter(v => v.type === 'character').length,
            wordsAdded: expandedVocabulary.filter(v => v.type === 'word').length,
            success: true
          });

          fastify.log.info(`Updated content ${content.id}: ${originalVocabCount} → ${expandedVocabulary.length} vocabulary items (${enhancedCount} enhanced, ${newItemsCount} new)`);
          
        } catch (error) {
          fastify.log.error(`Failed to update translations for content ${content.id}:`, error);
          results.push({
            contentId: content.id,
            title: content.title,
            success: false,
            error: error.message
          });
        }
      }

      const response: ApiResponse<{
        totalProcessed: number;
        totalUpdated: number;
        totalEnhanced: number;
        dictionaryStats: any;
        results: any[];
      }> = {
        success: true,
        data: {
          totalProcessed: contentItems.length,
          totalUpdated,
          totalEnhanced,
          dictionaryStats: dictStats,
          results
        }
      };

      return response;
      
    } catch (error) {
      fastify.log.error('Translation update failed:', error);
      reply.code(500);
      return { success: false, message: `Translation update failed: ${error.message}` };
    }
  });

  // GET /api/v1/translations/stats - Get CEDICT statistics
  fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Load dictionary if not already loaded
      await cedictService.loadDictionary();
      const stats = cedictService.getStats();
      
      const response: ApiResponse<{
        dictionaryLoaded: boolean;
        totalEntries: number;
        sampleTranslations: Array<{chinese: string; english: string; pinyin: string | null}>;
      }> = {
        success: true,
        data: {
          dictionaryLoaded: stats.loaded,
          totalEntries: stats.totalEntries,
          sampleTranslations: [
            { chinese: '你好', english: cedictService.getTranslation('你好') || 'not found', pinyin: cedictService.getPinyin('你好') },
            { chinese: '我', english: cedictService.getTranslation('我') || 'not found', pinyin: cedictService.getPinyin('我') },
            { chinese: '谢谢', english: cedictService.getTranslation('谢谢') || 'not found', pinyin: cedictService.getPinyin('谢谢') }
          ]
        }
      };

      return response;
      
    } catch (error) {
      fastify.log.error('Failed to get translation stats:', error);
      reply.code(500);
      return { success: false, message: `Failed to get translation stats: ${error.message}` };
    }
  });

  // POST /api/v1/translations/test - Test CEDICT service with sample words
  fastify.post('/test', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await cedictService.loadDictionary();
      
      const testWords = ['你好', '我', '好', '谢谢', '什么', '名字', '中国', '学生', '老师', '不存在的词'];
      
      const testResults = testWords.map(word => ({
        chinese: word,
        translation: cedictService.getTranslation(word),
        pinyin: cedictService.getPinyin(word),
        found: !!cedictService.getTranslation(word)
      }));

      const response: ApiResponse<{
        dictionaryStats: any;
        testResults: any[];
        summary: {
          totalTested: number;
          found: number;
          notFound: number;
        };
      }> = {
        success: true,
        data: {
          dictionaryStats: cedictService.getStats(),
          testResults,
          summary: {
            totalTested: testWords.length,
            found: testResults.filter(r => r.found).length,
            notFound: testResults.filter(r => !r.found).length
          }
        }
      };

      return response;
      
    } catch (error) {
      fastify.log.error('Translation test failed:', error);
      reply.code(500);
      return { success: false, message: `Translation test failed: ${error.message}` };
    }
  });
}