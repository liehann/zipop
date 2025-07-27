import { Word, Sentence, WordListData, SavedDocument } from '../types';
import { toPinyin, sentenceToPinyin, toPinyinWithoutTones } from './pinyinUtils';

// Mock English dictionary - in a real app, this would use a proper API
const mockEnglishDict: Record<string, string> = {
  '你': 'you',
  '好': 'good/well',
  '吗': '(question particle)',
  '我': 'I/me',
  '很': 'very',
  '谢': 'thank',
  '对': 'correct',
  '不': 'not',
  '起': 'rise/up',
  '再': 'again',
  '见': 'see/meet',
  '他': 'he/him',
  '她': 'she/her',
  '是': 'is/to be',
  '老': 'old',
  '师': 'teacher',
  '学': 'study',
  '生': 'student',
  '中': 'middle/China',
  '国': 'country',
  '人': 'person',
  '什': 'what',
  '么': '(particle)',
  '名': 'name',
  '字': 'character/word',
  '叫': 'call',
  '今': 'today',
  '天': 'day/sky',
  '明': 'bright/tomorrow',
  '去': 'go',
  '哪': 'which',
  '里': 'inside/place',
  '吃': 'eat',
  '饭': 'rice/meal',
  '喝': 'drink',
  '水': 'water',
  '茶': 'tea',
  '咖': 'coffee',
  '啡': 'coffee'
};

// Mock sentence translations - in a real app, this would use translation API
const mockSentenceTranslations: Record<string, string> = {
  '你好吗': 'How are you?',
  '我很好': 'I am very well',
  '谢谢你': 'Thank you',
  '对不起': 'Sorry',
  '再见': 'Goodbye',
  '他是老师': 'He is a teacher',
  '她是学生': 'She is a student',
  '你是中国人吗': 'Are you Chinese?',
  '你叫什么名字': 'What is your name?',
  '今天天气很好': 'The weather is very good today',
  '明天去哪里': 'Where are you going tomorrow?',
  '我想吃饭': 'I want to eat',
  '你喝茶吗': 'Do you drink tea?',
  '我喝咖啡': 'I drink coffee'
};

/**
 * Split Chinese text into sentences based on punctuation
 */
export function splitIntoSentences(text: string): string[] {
  // Remove extra whitespace and split by Chinese punctuation
  const cleanText = text.trim().replace(/\s+/g, '');
  const sentences = cleanText.split(/[。！？；]/);
  
  return sentences
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Split a Chinese sentence into individual characters/words
 * This is a simplified approach - in reality, Chinese word segmentation is complex
 */
export function splitIntoWords(sentence: string): string[] {
  // For now, we'll treat each character as a word
  // In a real app, you'd use a proper Chinese word segmentation library
  return sentence.split('').filter(char => char.trim().length > 0);
}

/**
 * Get pinyin for a Chinese character or text using the pinyin library
 */
export function getPinyin(character: string): string {
  return toPinyin(character);
}

/**
 * Get pinyin for a full sentence with proper spacing
 */
export function getSentencePinyin(sentence: string): string {
  return sentenceToPinyin(sentence);
}

/**
 * Get pinyin without tone marks (useful for input or search)
 */
export function getPinyinWithoutTones(character: string): string {
  return toPinyinWithoutTones(character);
}

/**
 * Get English translation for a Chinese character (mock implementation)
 */
export function getEnglishTranslation(character: string): string {
  return mockEnglishDict[character] || character;
}

/**
 * Get English translation for a full sentence (mock implementation)
 */
export function getSentenceTranslation(sentence: string): string {
  return mockSentenceTranslations[sentence] || sentence;
}

/**
 * Process Chinese text into a structured WordListData format
 */
export function processChineseText(
  originalText: string,
  title: string = 'New Document'
): WordListData {
  const sentences = splitIntoSentences(originalText);
  const processedSentences: Sentence[] = [];
  
  sentences.forEach((sentenceText, sentenceIndex) => {
    const words = splitIntoWords(sentenceText);
    const processedWords: Word[] = [];
    
    words.forEach((character, wordIndex) => {
      const word: Word = {
        id: `word-${sentenceIndex}-${wordIndex}`,
        hanzi: character,
        pinyin: getPinyin(character),
        english: getEnglishTranslation(character)
      };
      processedWords.push(word);
    });
    
    const sentence: Sentence = {
      id: `sentence-${sentenceIndex}`,
      words: processedWords,
      sentencePinyin: getSentencePinyin(sentenceText),
      sentenceEnglish: getSentenceTranslation(sentenceText)
    };
    
    processedSentences.push(sentence);
  });
  
  return {
    id: `doc-${Date.now()}`,
    title,
    sentences: processedSentences,
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString()
  };
}

/**
 * Create a SavedDocument from processed text
 */
export function createSavedDocument(
  originalText: string,
  title: string = 'New Document'
): SavedDocument {
  const wordListData = processChineseText(originalText, title);
  
  return {
    id: wordListData.id,
    title,
    originalText,
    wordListData,
    dateCreated: wordListData.dateCreated!,
    dateModified: wordListData.dateModified!
  };
}

/**
 * Generate a default title from text (first few characters)
 */
export function generateTitle(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, '');
  const firstSentence = cleaned.split(/[。！？；]/)[0];
  
  if (firstSentence.length <= 10) {
    return firstSentence;
  }
  
  return firstSentence.substring(0, 8) + '...';
} 