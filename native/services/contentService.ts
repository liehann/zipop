/**
 * Content Service for ZiPop
 * Replaces the dataLoader with API-based content loading
 */

import { LessonData, BuiltInLesson, DocumentSource } from '../data/types';
import { SavedDocument, WordListData, Word, Sentence } from '../types';
import { splitIntoWords, getPinyin, getEnglishTranslation, getSentencePinyin } from '../utils/textProcessing';
import apiService from './apiService';

class ContentService {
  private contentCache: Map<string, LessonData> = new Map();
  private categoriesCache: any[] | null = null;
  private levelsCache: any[] | null = null;

  /**
   * Get all content with optional filtering
   */
  async getAllContent(options?: {
    category?: string;
    level?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<LessonData[]> {
    try {
      const response = await apiService.getAllContent(options);
      
      // Cache the content items
      response.data.forEach(content => {
        this.contentCache.set(content.id, content);
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch content:', error);
      throw error;
    }
  }

  /**
   * Get content by ID (with caching)
   */
  async getContentById(id: string): Promise<LessonData | null> {
    try {
      // Check cache first
      if (this.contentCache.has(id)) {
        return this.contentCache.get(id)!;
      }

      // Fetch from API
      const response = await apiService.getContentById(id);
      const content = response.data;
      
      // Cache the result
      this.contentCache.set(id, content);
      
      return content;
    } catch (error) {
      console.error(`Failed to fetch content ${id}:`, error);
      return null;
    }
  }

  /**
   * Get featured content
   */
  async getFeaturedContent(): Promise<LessonData[]> {
    try {
      const response = await apiService.getFeaturedContent();
      
      // Cache the content items
      response.data.forEach(content => {
        this.contentCache.set(content.id, content);
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch featured content:', error);
      throw error;
    }
  }

  /**
   * Get content by category
   */
  async getContentByCategory(category: string): Promise<LessonData[]> {
    try {
      const response = await apiService.getContentByCategory(category);
      
      // Cache the content items
      response.data.forEach(content => {
        this.contentCache.set(content.id, content);
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch content for category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Get content by level
   */
  async getContentByLevel(level: string): Promise<LessonData[]> {
    try {
      const response = await apiService.getContentByLevel(level);
      
      // Cache the content items
      response.data.forEach(content => {
        this.contentCache.set(content.id, content);
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch content for level ${level}:`, error);
      throw error;
    }
  }

  /**
   * Search content
   */
  async searchContent(query: string, filters?: {
    category?: string;
    level?: string;
    featured?: boolean;
  }): Promise<LessonData[]> {
    try {
      const response = await apiService.searchContent(query, filters);
      
      // Cache the content items
      response.data.forEach(content => {
        this.contentCache.set(content.id, content);
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to search content with query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get categories (with caching)
   */
  async getCategories(): Promise<Array<{ id: string; name: string; description: string; count: number }>> {
    try {
      if (this.categoriesCache) {
        return this.categoriesCache;
      }

      const response = await apiService.getCategories();
      this.categoriesCache = response.data;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Get levels (with caching)
   */
  async getLevels(): Promise<Array<{ id: string; name: string; description: string; count: number }>> {
    try {
      if (this.levelsCache) {
        return this.levelsCache;
      }

      const response = await apiService.getLevels();
      this.levelsCache = response.data;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch levels:', error);
      throw error;
    }
  }

  /**
   * Convert content to WordListData format using pre-split sentences from API
   */
  contentToWordListData(content: LessonData): WordListData {
    // Use the pre-split sentences from the API instead of processing the full text
    const processedSentences = content.content.sentences.map((sentencePair, sentenceIndex) => {
      // Process each individual sentence to get words
      const words = this.processSentenceToWords(sentencePair.chinese, sentenceIndex, content.vocabulary);
      
      return {
        id: `sentence-${sentenceIndex}`,
        words,
        sentencePinyin: getSentencePinyin(sentencePair.chinese),
        sentenceEnglish: sentencePair.english
      };
    });
    
    return {
      id: content.id,
      title: content.title,
      sentences: processedSentences,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString()
    };
  }

  /**
   * Process a single sentence into words with proper IDs
   */
  private processSentenceToWords(
    sentenceText: string,
    sentenceIndex: number,
    vocabulary?: Array<{chinese: string; english: string}>
  ): Word[] {
    const words = splitIntoWords(sentenceText, vocabulary);
    
    return words.map((wordText, wordIndex) => ({
      id: `word-${sentenceIndex}-${wordIndex}`,
      hanzi: wordText,
      pinyin: getPinyin(wordText),
      english: getEnglishTranslation(wordText, vocabulary)
    }));
  }

  /**
   * Convert content to BuiltInLesson format (like the old lessonToBuiltInLesson)
   */
  contentToBuiltInLesson(content: LessonData): BuiltInLesson {
    return {
      id: content.id,
      title: content.title,
      description: content.description,
      level: content.level,
      category: content.category,
      estimatedTime: content.estimatedTime,
      isBuiltIn: true,
      lessonData: content,
    };
  }

  /**
   * Get all content formatted as BuiltInLessons (replaces getBuiltInLessons)
   */
  async getBuiltInLessons(): Promise<BuiltInLesson[]> {
    try {
      const content = await this.getAllContent();
      return content.map(item => this.contentToBuiltInLesson(item));
    } catch (error) {
      console.error('Failed to fetch built-in lessons:', error);
      return [];
    }
  }

  /**
   * Create a unified document source from content
   */
  createDocumentSourceFromContent(content: LessonData): DocumentSource {
    return {
      type: 'builtin',
      document: this.contentToBuiltInLesson(content),
    };
  }



  /**
   * Clear caches (useful for development or when data changes)
   */
  clearCache(): void {
    this.contentCache.clear();
    this.categoriesCache = null;
    this.levelsCache = null;
  }

  /**
   * Check if backend is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      await apiService.healthCheck();
      return true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const contentService = new ContentService();
export default contentService;