import pinyin from 'pinyin';

/**
 * Pinyin conversion utilities using the pinyin library by @hotoo
 */

// Configure pinyin library options
export const pinyinOptions = {
  style: pinyin.STYLE_TONE, // Use tone marks (nǐ, hǎo, etc.)
  segment: true, // Enable word segmentation
  group: false, // Don't group results
};

/**
 * Convert Chinese character(s) to pinyin with tone marks
 * @param text Chinese text to convert
 * @returns Pinyin with tone marks, or original text if not Chinese
 */
export function toPinyin(text: string): string {
  if (!text || text.trim() === '') {
    return text;
  }
  
  try {
    const result = pinyin(text, pinyinOptions);
    if (result && result.length > 0) {
      // Join all characters' pinyin with spaces for multi-character words
      return result.map(item => item[0] || '').filter(p => p).join(' ');
    }
    return text; // Return original if no pinyin found (likely not Chinese)
  } catch (error) {
    console.warn('Error converting to pinyin:', error);
    return text;
  }
}

/**
 * Convert Chinese sentence to pinyin with proper word spacing
 * @param sentence Chinese sentence to convert
 * @returns Pinyin sentence with spaces between words
 */
export function sentenceToPinyin(sentence: string): string {
  if (!sentence || sentence.trim() === '') {
    return sentence;
  }
  
  try {
    const result = pinyin(sentence, {
      ...pinyinOptions,
      segment: true, // Enable word segmentation for better sentence handling
    });
    return result.map(item => item[0]).join(' ');
  } catch (error) {
    console.warn('Error converting sentence to pinyin:', error);
    return sentence;
  }
}

/**
 * Convert Chinese text to pinyin without tone marks (useful for input or search)
 * @param text Chinese text to convert
 * @returns Pinyin without tone marks
 */
export function toPinyinWithoutTones(text: string): string {
  if (!text || text.trim() === '') {
    return text;
  }
  
  try {
    const result = pinyin(text, {
      style: pinyin.STYLE_NORMAL, // No tone marks
      segment: true,
      group: false,
    });
    if (result && result.length > 0) {
      // Join all characters' pinyin with spaces for multi-character words
      return result.map(item => item[0] || '').filter(p => p).join(' ');
    }
    return text;
  } catch (error) {
    console.warn('Error converting to pinyin without tones:', error);
    return text;
  }
}

/**
 * Convert Chinese text to pinyin with numeric tones (ni3 hao3)
 * @param text Chinese text to convert
 * @returns Pinyin with numeric tone indicators
 */
export function toPinyinWithNumericTones(text: string): string {
  if (!text || text.trim() === '') {
    return text;
  }
  
  try {
    const result = pinyin(text, {
      style: pinyin.STYLE_TONE2, // Numeric tones (ni3, hao3)
      segment: true,
      group: false,
    });
    if (result && result.length > 0) {
      // Join all characters' pinyin with spaces for multi-character words
      return result.map(item => item[0] || '').filter(p => p).join(' ');
    }
    return text;
  } catch (error) {
    console.warn('Error converting to pinyin with numeric tones:', error);
    return text;
  }
}

/**
 * Check if text contains Chinese characters
 * @param text Text to check
 * @returns True if text contains Chinese characters
 */
export function isChineseText(text: string): boolean {
  if (!text) return false;
  
  // Check for Chinese characters (CJK Unified Ideographs)
  const chineseRegex = /[\u4e00-\u9fff]/;
  return chineseRegex.test(text);
}

/**
 * Batch convert multiple Chinese texts to pinyin
 * @param texts Array of Chinese texts to convert
 * @returns Array of pinyin conversions
 */
export function batchToPinyin(texts: string[]): string[] {
  return texts.map(text => toPinyin(text));
}

// Re-export pinyin constants for advanced usage
export const PINYIN_STYLES = {
  TONE: pinyin.STYLE_TONE,        // nǐ hǎo
  TONE2: pinyin.STYLE_TONE2,      // ni3 hao3
  NORMAL: pinyin.STYLE_NORMAL,    // ni hao
  FIRST_LETTER: pinyin.STYLE_FIRST_LETTER, // n h
} as const; 