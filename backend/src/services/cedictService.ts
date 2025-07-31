import fs from 'fs/promises';
import path from 'path';
import pinyin from 'pinyin';

interface CedictEntry {
  simplified: string;
  traditional: string;
  pinyin: string[];
  definitions: Record<string, string>;
}

export class CedictService {
  private dictionary: Record<string, CedictEntry> | null = null;
  private readonly dictionaryPath: string;

  constructor() {
    // Path to the CEDICT dictionary file in the native app's data directory
    this.dictionaryPath = path.join(__dirname, '../../../native/data/all_cedict.json');
  }

  /**
   * Load the CEDICT dictionary from file
   */
  async loadDictionary(): Promise<void> {
    if (this.dictionary) {
      return; // Already loaded
    }

    try {
      console.log('📚 Loading CEDICT dictionary...');
      const dictContent = await fs.readFile(this.dictionaryPath, 'utf-8');
      this.dictionary = JSON.parse(dictContent);
      console.log(`✅ CEDICT dictionary loaded with ${Object.keys(this.dictionary!).length} entries`);
    } catch (error) {
      console.error('❌ Failed to load CEDICT dictionary:', error);
      throw new Error('Failed to load CEDICT dictionary');
    }
  }

  /**
   * Get English translation for a Chinese word/character
   */
  getTranslation(chinese: string): string | null {
    if (!this.dictionary) {
      throw new Error('Dictionary not loaded. Call loadDictionary() first.');
    }

    const entry = this.dictionary[chinese];
    if (!entry || !entry.definitions) {
      return null;
    }

    // Get the first definition as specified by the user
    const firstDefinitionKey = Object.keys(entry.definitions)[0];
    if (firstDefinitionKey) {
      const definition = entry.definitions[firstDefinitionKey];
      // Clean up the definition by removing trailing spaces and semicolons
      return definition.replace(/;\s*$/, '').trim();
    }

    return null;
  }

  /**
   * Get pinyin for a Chinese word/character
   */
  getPinyin(chinese: string): string | null {
    if (!this.dictionary) {
      throw new Error('Dictionary not loaded. Call loadDictionary() first.');
    }

    const entry = this.dictionary[chinese];
    if (!entry || !entry.pinyin || entry.pinyin.length === 0) {
      return null;
    }

    // Return the first pinyin pronunciation
    return entry.pinyin[0];
  }

  /**
   * Enhanced vocabulary item with CEDICT translation
   */
  enhanceVocabularyItem(vocabularyItem: { chinese: string; english: string }): { chinese: string; english: string } {
    const cedictTranslation = this.getTranslation(vocabularyItem.chinese);
    
    return {
      chinese: vocabularyItem.chinese,
      english: cedictTranslation || vocabularyItem.english // Use CEDICT if available, fallback to original
    };
  }

  /**
   * Process all vocabulary items in a lesson with CEDICT translations
   */
  enhanceVocabulary(vocabulary: Array<{ chinese: string; english: string }>): Array<{ chinese: string; english: string }> {
    return vocabulary.map(item => this.enhanceVocabularyItem(item));
  }

  /**
   * Expand lesson vocabulary to include all characters and words from content with CEDICT translations
   */
  expandLessonVocabulary(
    content: { chinese: string; sentences: Array<{ chinese: string }> },
    originalVocabulary: Array<{ chinese: string; english: string }>
  ): Array<{ chinese: string; english: string; type?: 'character' | 'word' }> {
    // 1. Enhance original vocabulary
    const enhancedOriginal = this.enhanceVocabulary(originalVocabulary);
    
    // 2. Extract comprehensive vocabulary from content
    const extractedVocab = this.extractVocabularyFromContent(content);
    
    // 3. Combine and deduplicate
    const combinedVocab = new Map<string, { chinese: string; english: string; type?: 'character' | 'word' }>();
    
    // Add original vocabulary (no type specified for backward compatibility)
    enhancedOriginal.forEach(item => {
      combinedVocab.set(item.chinese, item);
    });
    
    // Add extracted vocabulary (with type information)
    extractedVocab.forEach(item => {
      if (!combinedVocab.has(item.chinese)) {
        combinedVocab.set(item.chinese, item);
      }
    });
    
    return Array.from(combinedVocab.values()).sort((a, b) => {
      // Sort by type first (characters, then words, then unknown), then by Chinese text
      const getTypeOrder = (type?: string) => {
        if (type === 'character') return 0;
        if (type === 'word') return 1;
        return 2; // original vocabulary without type
      };
      
      const aOrder = getTypeOrder(a.type);
      const bOrder = getTypeOrder(b.type);
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return a.chinese.localeCompare(b.chinese);
    });
  }

  /**
   * Extract comprehensive vocabulary (characters and words) from Chinese text using pinyin library
   */
  extractVocabularyFromText(text: string): Array<{ chinese: string; english: string; type: 'character' | 'word' }> {
    const vocabulary: Array<{ chinese: string; english: string; type: 'character' | 'word' }> = [];
    const processedItems = new Set<string>();

    // 1. Extract individual characters
    for (const char of text) {
      if (this.isChinese(char) && !processedItems.has(char)) {
        const translation = this.getTranslation(char);
        if (translation) {
          vocabulary.push({
            chinese: char,
            english: translation,
            type: 'character'
          });
          processedItems.add(char);
        }
      }
    }

    // 2. Use pinyin library for word segmentation - get the segmented words directly
    try {
      const segmentResult = pinyin.segment(text);
      
      for (const word of segmentResult) {
        if (word.length > 1 && !processedItems.has(word)) {
          const translation = this.getTranslation(word);
          if (translation) {
            vocabulary.push({
              chinese: word,
              english: translation,
              type: 'word'
            });
            processedItems.add(word);
          }
        }
      }
    } catch (error) {
      console.warn('Error during pinyin segmentation:', error);
    }

    return vocabulary.sort((a, b) => {
      // Sort by type first (characters, then words), then by Chinese text
      if (a.type !== b.type) {
        return a.type === 'character' ? -1 : 1;
      }
      return a.chinese.localeCompare(b.chinese);
    });
  }

  /**
   * Extract vocabulary from lesson content
   */
  extractVocabularyFromContent(content: { chinese: string; sentences: Array<{ chinese: string }> }): Array<{ chinese: string; english: string; type: 'character' | 'word' }> {
    const allText = [content.chinese, ...content.sentences.map(s => s.chinese)].join('');
    return this.extractVocabularyFromText(allText);
  }

  /**
   * Check if a character is Chinese (CJK)
   */
  private isChinese(char: string): boolean {
    const code = char.charCodeAt(0);
    return (
      (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
      (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
      (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
      (code >= 0x2a700 && code <= 0x2b73f) || // CJK Extension C
      (code >= 0x2b740 && code <= 0x2b81f) || // CJK Extension D
      (code >= 0x2b820 && code <= 0x2ceaf) // CJK Extension E
    );
  }

  /**
   * Get dictionary stats
   */
  getStats(): { totalEntries: number; loaded: boolean } {
    return {
      totalEntries: this.dictionary ? Object.keys(this.dictionary).length : 0,
      loaded: this.dictionary !== null
    };
  }
}

// Export a singleton instance
export const cedictService = new CedictService();