import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs-extra';
import path from 'path';
import { ApiResponse } from '../types';

// Validation schemas
const alignmentParamsSchema = z.object({
  content_id: z.string(),
});

// 11 Labs alignment response interfaces
interface ElevenLabsAlignment {
  alignment: {
    char_start_times_ms: number[];
    char_end_times_ms: number[];
    chars: string[];
  };
}

interface AlignmentResult {
  contentId: string;
  success: boolean;
  message: string;
  alignment?: ElevenLabsAlignment;
  logFile?: string;
}

export async function alignmentRoutes(fastify: FastifyInstance) {
  
  // POST /api/v1/alignment/:content_id - Process forced alignment with 11 Labs
  fastify.post('/:content_id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { content_id } = alignmentParamsSchema.parse(request.params);
      
      // Get content from database
      const content = await fastify.prisma.content.findUnique({
        where: { id: content_id },
      });
      
      if (!content) {
        reply.code(404);
        return { success: false, message: 'Content not found' };
      }
      
      // Extract Chinese text from content
      const contentData = content.content as any;
      const chineseText = contentData.chinese;
      
      if (!chineseText) {
        reply.code(400);
        return { success: false, message: 'No Chinese text found in content' };
      }
      
      // Get audio configuration
      const audioConfig = content.audio as any;
      if (!audioConfig || !audioConfig.file) {
        reply.code(400);
        return { success: false, message: 'No audio file configured for this content' };
      }
      
      // Construct audio file path
      const audioFilePath = path.join(__dirname, '../../static/audio', audioConfig.file);
      
      // Check if audio file exists
      if (!(await fs.pathExists(audioFilePath))) {
        reply.code(400);
        return { success: false, message: 'Audio file not found' };
      }
      
      // Call 11 Labs API
      const alignmentResult = await callElevenLabsAlignment(chineseText, audioFilePath);
      
      // Ensure log directory exists
      const logDir = path.join(__dirname, '../../logs/alignment');
      await fs.ensureDir(logDir);
      
      // Write response to log file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFileName = `${content_id}_${timestamp}.json`;
      const logFilePath = path.join(logDir, logFileName);
      
      const logData = {
        contentId: content_id,
        timestamp: new Date().toISOString(),
        request: {
          chineseText,
          audioFile: audioConfig.file
        },
        response: alignmentResult,
        success: alignmentResult.success
      };
      
      await fs.writeJson(logFilePath, logData, { spaces: 2 });
      
      if (alignmentResult.success && alignmentResult.alignment) {
        // Update content with new alignment timings
        await updateContentWithAlignment(fastify, content_id, alignmentResult.alignment, chineseText);
        
        const response: ApiResponse<AlignmentResult> = {
          success: true,
          data: {
            contentId: content_id,
            success: true,
            message: 'Alignment completed successfully',
            alignment: alignmentResult.alignment,
            logFile: logFileName
          }
        };
        
        return response;
      } else {
        reply.code(500);
        const response: ApiResponse<AlignmentResult> = {
          success: false,
          data: {
            contentId: content_id,
            success: false,
            message: alignmentResult.message || 'Alignment failed',
            logFile: logFileName
          }
        };
        
        return response;
      }
      
    } catch (error) {
      fastify.log.error('Alignment processing error:', error);
      reply.code(500);
      return { success: false, message: 'Internal server error during alignment processing' };
    }
  });
  
  // GET /api/v1/alignment/logs - Get alignment log files
  fastify.get('/logs', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const logDir = path.join(__dirname, '../../logs/alignment');
      await fs.ensureDir(logDir);
      
      const files = await fs.readdir(logDir);
      const logFiles = files.filter(file => file.endsWith('.json'));
      
      const logs = await Promise.all(
        logFiles.map(async (file) => {
          const filePath = path.join(logDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            created: stats.ctime,
            size: stats.size
          };
        })
      );
      
      return {
        success: true,
        data: logs.sort((a, b) => b.created.getTime() - a.created.getTime())
      };
      
    } catch (error) {
      fastify.log.error('Error reading alignment logs:', error);
      reply.code(500);
      return { success: false, message: 'Failed to read alignment logs' };
    }
  });
  
  // GET /api/v1/alignment/logs/:filename - Get specific log file
  fastify.get('/logs/:filename', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { filename } = z.object({ filename: z.string() }).parse(request.params);
      
      const logFilePath = path.join(__dirname, '../../logs/alignment', filename);
      
      if (!(await fs.pathExists(logFilePath))) {
        reply.code(404);
        return { success: false, message: 'Log file not found' };
      }
      
      const logData = await fs.readJson(logFilePath);
      
      return {
        success: true,
        data: logData
      };
      
    } catch (error) {
      fastify.log.error('Error reading log file:', error);
      reply.code(500);
      return { success: false, message: 'Failed to read log file' };
    }
  });
}

async function callElevenLabsAlignment(text: string, audioFilePath: string): Promise<{ success: boolean; message: string; alignment?: ElevenLabsAlignment }> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable not set');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('text', text);
    formData.append('audio', fs.createReadStream(audioFilePath));
    formData.append('language', 'zh'); // Chinese language code
    
    // Call 11 Labs forced alignment API
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/speech-to-speech/forced-alignment',
      formData,
      {
        headers: {
          'xi-api-key': apiKey,
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60 second timeout
      }
    );
    
    if (response.status === 200 && response.data.alignment) {
      return {
        success: true,
        message: 'Alignment completed successfully',
        alignment: response.data
      };
    } else {
      return {
        success: false,
        message: 'Invalid response from 11 Labs API'
      };
    }
    
  } catch (error: any) {
    console.error('11 Labs API error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: `11 Labs API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`
      };
    } else if (error.request) {
      return {
        success: false,
        message: '11 Labs API request failed - no response received'
      };
    } else {
      return {
        success: false,
        message: `11 Labs API error: ${error.message}`
      };
    }
  }
}

async function updateContentWithAlignment(
  fastify: FastifyInstance,
  contentId: string,
  alignment: ElevenLabsAlignment,
  originalText: string
): Promise<void> {
  try {
    // Get current content
    const content = await fastify.prisma.content.findUnique({
      where: { id: contentId },
    });
    
    if (!content) {
      throw new Error('Content not found');
    }
    
    const contentData = content.content as any;
    
    // Process alignment data to update sentences and words
    const updatedContent = processAlignmentData(contentData, alignment, originalText);
    
    // Update metadata
    const metadata = content.metadata as any;
    const updatedMetadata = {
      ...metadata,
      timingsUpdated: true,
      timingsSource: '11labs',
      dateModified: new Date().toISOString(),
      alignmentProcessed: true
    };
    
    // Update audio config
    const audioConfig = content.audio as any;
    const updatedAudioConfig = {
      ...audioConfig,
      hasTimings: true
    };
    
    // Save updated content to database
    await fastify.prisma.content.update({
      where: { id: contentId },
      data: {
        content: updatedContent,
        metadata: updatedMetadata,
        audio: updatedAudioConfig,
        updatedAt: new Date()
      }
    });
    
    console.log(`Successfully updated content ${contentId} with alignment data`);
    
  } catch (error) {
    console.error('Error updating content with alignment:', error);
    throw error;
  }
}

function processAlignmentData(contentData: any, alignment: ElevenLabsAlignment, originalText: string): any {
  // This function converts 11 Labs character-level timing data to sentence and word level timing
  // This is a simplified implementation - you may need to adjust based on your specific needs
  
  const { char_start_times_ms, char_end_times_ms, chars } = alignment.alignment;
  
  // Convert milliseconds to seconds for consistency with existing data
  const charStartTimes = char_start_times_ms.map(ms => ms / 1000);
  const charEndTimes = char_end_times_ms.map(ms => ms / 1000);
  
  // Create a mapping of character positions to timing
  const charTimingMap: { [index: number]: { start: number; end: number } } = {};
  chars.forEach((char, index) => {
    charTimingMap[index] = {
      start: charStartTimes[index],
      end: charEndTimes[index]
    };
  });
  
  // Update sentences with timing data
  const updatedSentences = contentData.sentences.map((sentence: any) => {
    const sentenceText = sentence.chinese;
    
    // Find the position of this sentence in the original text
    const sentenceStart = originalText.indexOf(sentenceText);
    if (sentenceStart === -1) {
      return sentence; // Keep original if not found
    }
    
    const sentenceEnd = sentenceStart + sentenceText.length - 1;
    
    // Get timing for the sentence
    const sentenceTiming = {
      start: charTimingMap[sentenceStart]?.start || 0,
      end: charTimingMap[sentenceEnd]?.end || 0,
      duration: (charTimingMap[sentenceEnd]?.end || 0) - (charTimingMap[sentenceStart]?.start || 0)
    };
    
    // Create word-level timing
    const words = [];
    let currentPos = sentenceStart;
    
    for (const char of sentenceText) {
      if (charTimingMap[currentPos]) {
        words.push({
          word: char,
          start: charTimingMap[currentPos].start,
          end: charTimingMap[currentPos].end,
          duration: charTimingMap[currentPos].end - charTimingMap[currentPos].start
        });
      }
      currentPos++;
    }
    
    return {
      ...sentence,
      timing: sentenceTiming,
      words: words
    };
  });
  
  return {
    ...contentData,
    sentences: updatedSentences
  };
}