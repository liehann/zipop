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

// 11 Labs alignment response interfaces based on official documentation
interface ElevenLabsCharacter {
  text: string;
  start: number; // timing in seconds (assuming)
  end: number;   // timing in seconds (assuming)
}

interface ElevenLabsWord {
  text: string;
  start: number; // timing in seconds (assuming)
  end: number;   // timing in seconds (assuming) 
  loss: number;  // confidence/loss score
}

interface ElevenLabsAlignment {
  characters: ElevenLabsCharacter[];
  words: ElevenLabsWord[];
  loss: number; // overall confidence score
}

interface AlignmentResult {
  contentId: string;
  success: boolean;
  message: string;
  alignment?: ElevenLabsAlignment;
  logFile?: string;
  cached?: boolean;
  cachedAt?: string;
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
      
      // Check if we already have an alignment response stored
      const existingAlignment = content.forceAlignmentResponse as any;
      if (existingAlignment && existingAlignment.provider === 'eleven_labs' && existingAlignment.response) {
        console.log('💾 Using cached alignment response from database');
        
        // Use the cached response
        const cachedResult = {
          success: true,
          message: 'Using cached alignment data',
          alignment: existingAlignment.response,
          cached: true,
          cachedAt: existingAlignment.timestamp
        };
        
        // Extract Chinese text for processing cached data
        const contentData = content.content as any;
        const chineseText = contentData.chinese;
        
        // Still process and update content with cached data if needed
        await updateContentWithAlignment(fastify, content_id, existingAlignment.response, chineseText);
        
        const response: ApiResponse<AlignmentResult> = {
          success: true,
          data: {
            contentId: content_id,
            success: true,
            message: 'Alignment completed using cached data',
            alignment: existingAlignment.response,
            cached: true
          }
        };
        
        return response;
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
      
      // Also save the full 11 Labs response body to a separate file
      const responseBodyFileName = `${content_id}_${timestamp}_response.json`;
      const responseBodyFilePath = path.join(logDir, responseBodyFileName);
      
      if (alignmentResult.alignment) {
        await fs.writeJson(responseBodyFilePath, alignmentResult.alignment, { spaces: 2 });
        console.log(`📄 Saved full 11 Labs response to: ${responseBodyFileName}`);
      }
      
      const logData = {
        contentId: content_id,
        timestamp: new Date().toISOString(),
        request: {
          chineseText,
          audioFile: audioConfig.file
        },
        response: alignmentResult,
        success: alignmentResult.success,
        httpRequestDetails: alignmentResult.requestDetails || null,
        httpResponseDetails: alignmentResult.responseDetails || null,
        fullResponseFile: alignmentResult.alignment ? responseBodyFileName : null
      };
      
      await fs.writeJson(logFilePath, logData, { spaces: 2 });
      
      if (alignmentResult.success && alignmentResult.alignment) {
        // Store the 11 Labs response in the database for future use
        const alignmentStorage = {
          provider: 'eleven_labs',
          timestamp: new Date().toISOString(),
          response: alignmentResult.alignment,
          textLength: chineseText.length,
          audioFile: audioConfig.file
        };
        
        await fastify.prisma.content.update({
          where: { id: content_id },
          data: {
            forceAlignmentResponse: alignmentStorage
          }
        });
        
        console.log('💾 Stored 11 Labs alignment response in database');
        
        // Update content with new alignment timings
        await updateContentWithAlignment(fastify, content_id, alignmentResult.alignment, chineseText);
        
        const response: ApiResponse<AlignmentResult> = {
          success: true,
          data: {
            contentId: content_id,
            success: true,
            message: 'Alignment completed successfully',
            alignment: alignmentResult.alignment,
            logFile: logFileName,
            cached: false
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
  
  // GET /api/v1/alignment/cache/:content_id - Check cached alignment status
  fastify.get('/cache/:content_id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { content_id } = alignmentParamsSchema.parse(request.params);
      
      const content = await fastify.prisma.content.findUnique({
        where: { id: content_id },
        select: { 
          id: true, 
          title: true,
          forceAlignmentResponse: true 
        }
      });
      
      if (!content) {
        reply.code(404);
        return { success: false, message: 'Content not found' };
      }
      
      const alignmentCache = content.forceAlignmentResponse as any;
      const hasCache = alignmentCache && alignmentCache.provider && alignmentCache.response;
      
      return {
        success: true,
        data: {
          contentId: content_id,
          title: content.title,
          hasCachedAlignment: hasCache,
          provider: hasCache ? alignmentCache.provider : null,
          cachedAt: hasCache ? alignmentCache.timestamp : null,
          textLength: hasCache ? alignmentCache.textLength : null,
          audioFile: hasCache ? alignmentCache.audioFile : null
        }
      };
      
    } catch (error) {
      fastify.log.error('Error checking alignment cache:', error);
      reply.code(500);
      return { success: false, message: 'Failed to check alignment cache' };
    }
  });
  
  // DELETE /api/v1/alignment/cache/:content_id - Clear cached alignment
  fastify.delete('/cache/:content_id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { content_id } = alignmentParamsSchema.parse(request.params);
      
      const content = await fastify.prisma.content.findUnique({
        where: { id: content_id },
        select: { id: true, title: true }
      });
      
      if (!content) {
        reply.code(404);
        return { success: false, message: 'Content not found' };
      }
      
      await fastify.prisma.content.update({
        where: { id: content_id },
        data: {
          forceAlignmentResponse: null
        }
      });
      
      console.log(`🗑️ Cleared cached alignment for content: ${content_id}`);
      
      return {
        success: true,
        data: {
          contentId: content_id,
          title: content.title,
          message: 'Cached alignment cleared successfully'
        }
      };
      
    } catch (error) {
      fastify.log.error('Error clearing alignment cache:', error);
      reply.code(500);
      return { success: false, message: 'Failed to clear alignment cache' };
    }
  });
}

async function callElevenLabsAlignment(text: string, audioFilePath: string): Promise<{ success: boolean; message: string; alignment?: ElevenLabsAlignment; requestDetails?: any; responseDetails?: any }> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable not set');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('text', text);
    formData.append('file', fs.createReadStream(audioFilePath));
    
    // Get audio file stats for logging
    const audioStats = await fs.stat(audioFilePath);
    
    // Prepare request details for logging
    const url = 'https://api.elevenlabs.io/v1/forced-alignment';
    const headers = {
      'xi-api-key': apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4), // Masked API key
      ...formData.getHeaders(),
    };
    
    const requestDetails = {
      method: 'POST',
      url: url,
      headers: headers,
      formData: {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), // First 100 chars
        textLength: text.length,
        audioFile: {
          path: audioFilePath,
          size: audioStats.size,
          exists: true
        }
      },
      timeout: 60000
    };
    
    console.log('🚀 Making 11 Labs API request:', JSON.stringify(requestDetails, null, 2));
    
    // Call 11 Labs forced alignment API
    const response = await axios.post(url, formData, {
      headers: {
        'xi-api-key': apiKey,
        ...formData.getHeaders(),
      },
      timeout: 60000, // 60 second timeout
    });
    
    const responseDetails = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      dataKeys: Object.keys(response.data || {}),
      dataSize: JSON.stringify(response.data || {}).length
    };
    
    console.log('✅ 11 Labs API response:', JSON.stringify(responseDetails, null, 2));
    
    if (response.status === 200 && response.data && response.data.characters && response.data.words) {
      // Log the actual response structure
      console.log('✅ 11 Labs response data keys:', Object.keys(response.data));
      console.log('✅ 11 Labs characters count:', response.data.characters.length);
      console.log('✅ 11 Labs words count:', response.data.words.length);
      console.log('✅ 11 Labs overall loss:', response.data.loss);
      console.log('✅ Sample character:', response.data.characters[0]);
      console.log('✅ Sample word:', response.data.words[0]);
      
      return {
        success: true,
        message: 'Alignment completed successfully',
        alignment: response.data, // Store the actual response data
        requestDetails,
        responseDetails
      };
    } else {
      console.log('❌ Unexpected response format:', Object.keys(response.data || {}));
      return {
        success: false,
        message: 'Invalid response format from 11 Labs API',
        requestDetails,
        responseDetails
      };
    }
    
  } catch (error: any) {
    console.error('❌ 11 Labs API error:', error);
    
    // Enhanced error logging
    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.code,
      config: error.config ? {
        method: error.config.method,
        url: error.config.url,
        headers: error.config.headers ? Object.keys(error.config.headers) : undefined,
        timeout: error.config.timeout
      } : undefined
    };
    
    let responseDetails = null;
    if (error.response) {
      responseDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      };
      console.log('❌ 11 Labs API error response:', JSON.stringify(responseDetails, null, 2));
    }
    
    console.log('❌ 11 Labs API error details:', JSON.stringify(errorDetails, null, 2));
    
    if (error.response) {
      return {
        success: false,
        message: `11 Labs API error: ${error.response.status} - ${JSON.stringify(error.response.data) || error.response.statusText}`,
        requestDetails: errorDetails.config,
        responseDetails
      };
    } else if (error.request) {
      return {
        success: false,
        message: '11 Labs API request failed - no response received',
        requestDetails: errorDetails.config,
        responseDetails: { error: 'No response received' }
      };
    } else {
      return {
        success: false,
        message: `11 Labs API error: ${error.message}`,
        requestDetails: errorDetails.config,
        responseDetails: { error: error.message }
      };
    }
  }
}

async function updateContentWithAlignment(
  fastify: FastifyInstance,
  contentId: string,
  alignment: any,
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
  // Convert 11 Labs alignment data to our content structure
  console.log('🔧 Processing 11 Labs alignment data...');
  console.log(`📊 Characters: ${alignment.characters.length}, Words: ${alignment.words.length}, Loss: ${alignment.loss}`);
  
  // Create position-based character timing array (not text-based to handle duplicates)
  const charTimings = alignment.characters || alignment.words || [];
  console.log(`🔤 Processing ${charTimings.length} character timings`);
  
  // Build the full text from character timings to match positions
  const alignedText = charTimings.map(char => char.text).join('');
  console.log(`📝 Aligned text length: ${alignedText.length}, Original text length: ${originalText.length}`);
  console.log(`📝 Aligned text preview: ${alignedText.substring(0, 50)}...`);
  console.log(`📝 Original text preview: ${originalText.substring(0, 50)}...`);
  
  // Update sentences with timing data from 11 Labs
  const updatedSentences = contentData.sentences.map((sentence: any, sentenceIndex: number) => {
    const sentenceText = sentence.chinese;
    console.log(`🔤 Processing sentence ${sentenceIndex + 1}: ${sentenceText}`);
    
    // Find where this sentence appears in the original text
    const sentenceStartPos = originalText.indexOf(sentenceText);
    if (sentenceStartPos === -1) {
      console.log(`⚠️ Sentence not found in original text: ${sentenceText.substring(0, 20)}...`);
      return sentence;
    }
    
    const sentenceEndPos = sentenceStartPos + sentenceText.length - 1;
    console.log(`📍 Sentence position in original text: ${sentenceStartPos} - ${sentenceEndPos}`);
    
    // Find corresponding positions in aligned text
    let alignedStartIdx = -1;
    let alignedEndIdx = -1;
    
    // Try to match the sentence in the aligned text
    for (let i = 0; i <= alignedText.length - sentenceText.length; i++) {
      if (alignedText.substring(i, i + sentenceText.length) === sentenceText) {
        alignedStartIdx = i;
        alignedEndIdx = i + sentenceText.length - 1;
        break;
      }
    }
    
    if (alignedStartIdx === -1) {
      console.log(`⚠️ Sentence not found in aligned text: ${sentenceText.substring(0, 20)}...`);
      return sentence;
    }
    
    console.log(`📍 Sentence position in aligned text: ${alignedStartIdx} - ${alignedEndIdx}`);
    
    // Get timing from character positions
    const startTiming = charTimings[alignedStartIdx];
    const endTiming = charTimings[alignedEndIdx];
    
    if (!startTiming || !endTiming) {
      console.log(`⚠️ No timing found for sentence positions`);
      return sentence;
    }
    
    const timing = {
      start: startTiming.start,
      end: endTiming.end,
      duration: endTiming.end - startTiming.start
    };
    
    console.log(`⏱️ Sentence timing: ${timing.start}s - ${timing.end}s (${timing.duration}s)`);
    
    // Create word-level timing for each character in the sentence
    const sentenceWords = [];
    for (let i = 0; i < sentenceText.length; i++) {
      const charIdx = alignedStartIdx + i;
      const charTiming = charTimings[charIdx];
      
      if (charTiming) {
        sentenceWords.push({
          word: charTiming.text,
          start: charTiming.start,
          end: charTiming.end,
          duration: charTiming.end - charTiming.start
        });
      }
    }
    
    console.log(`📝 Created ${sentenceWords.length} word timings for sentence`);
    
    return {
      ...sentence,
      timing: timing,
      words: sentenceWords
    };
  });
  
  console.log('✅ Alignment processing complete');
  
  return {
    ...contentData,
    sentences: updatedSentences
  };
}