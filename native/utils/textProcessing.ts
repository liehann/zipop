import { Word, Sentence, WordListData, SavedDocument } from '../types';
import { toPinyin, sentenceToPinyin, toPinyinWithoutTones } from './pinyinUtils';

// Mock English dictionary - expanded to include multi-character words
const mockEnglishDict: Record<string, string> = {
  // Single characters
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
  '啡': 'coffee',
  '客': 'guest',
  '气': 'manner/air',
  '高': 'high',
  '兴': 'interest',
  '认': 'recognize',
  '识': 'know',
  
  // Multi-character words
  '你好': 'hello',
  '谢谢': 'thank you',
  '不客气': "you're welcome",
  '什么': 'what',
  '名字': 'name',
  '很高兴': 'very happy',
  '高兴': 'happy',
  '认识': 'to know/meet',
  '再见': 'goodbye',
  '老师': 'teacher',
  '学生': 'student',
  '中国': 'China',
  '中国人': 'Chinese person',
  '今天': 'today',
  '明天': 'tomorrow',
  '吃饭': 'eat/have a meal',
  '喝茶': 'drink tea',
  '咖啡': 'coffee',
  '对不起': 'sorry',
  '很好': 'very good',
  '没关系': 'no problem',
  '没事': "it's okay"
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
 * Split a Chinese sentence into words using vocabulary knowledge
 * This attempts to group characters into proper words rather than treating each character separately
 */
export function splitIntoWords(sentence: string, vocabulary?: Array<{chinese: string; english: string}>): string[] {
  if (!sentence || sentence.length === 0) {
    return [];
  }

  const words: string[] = [];
  let i = 0;
  
  while (i < sentence.length) {
    let matched = false;
    
    // If vocabulary is provided, try to match multi-character words first
    if (vocabulary) {
      // Sort vocabulary by length (longest first) to match longer words first
      const sortedVocab = vocabulary.sort((a, b) => b.chinese.length - a.chinese.length);
      
      for (const vocab of sortedVocab) {
        const word = vocab.chinese;
        if (sentence.substring(i, i + word.length) === word) {
          words.push(word);
          i += word.length;
          matched = true;
          break;
        }
      }
    }
    
    // If no vocabulary match, try common multi-character patterns
    if (!matched) {
      const remainingText = sentence.substring(i);
      
      // Common 2-character words/patterns
      const twoCharPatterns = [
        '你好', '谢谢', '不客', '客气', '什么', '名字', '高兴', '认识', '再见',
        '老师', '学生', '中国', '今天', '明天', '吃饭', '喝茶', '咖啡', '对不起',
        '很好', '不错', '没事', '问题', '时间', '地方', '朋友', '家人', '工作'
      ];
      
      for (const pattern of twoCharPatterns) {
        if (remainingText.startsWith(pattern)) {
          words.push(pattern);
          i += pattern.length;
          matched = true;
          break;
        }
      }
    }
    
    // If still no match, try common 3-character patterns
    if (!matched) {
      const remainingText = sentence.substring(i);
      
      const threeCharPatterns = [
        '不客气', '没关系', '对不起', '很高兴'
      ];
      
      for (const pattern of threeCharPatterns) {
        if (remainingText.startsWith(pattern)) {
          words.push(pattern);
          i += pattern.length;
          matched = true;
          break;
        }
      }
    }
    
    // If no pattern matched, take single character
    if (!matched) {
      const char = sentence.charAt(i);
      if (char.trim().length > 0) {
        words.push(char);
      }
      i++;
    }
  }
  
  return words.filter(word => word.trim().length > 0);
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
 * Get English translation for a Chinese word (handles both single chars and multi-char words)
 */
export function getEnglishTranslation(word: string, vocabulary?: Array<{chinese: string; english: string}>): string {
  // First check if vocabulary is provided and contains this word
  if (vocabulary) {
    const vocabMatch = vocabulary.find(v => v.chinese === word);
    if (vocabMatch) {
      return vocabMatch.english;
    }
  }
  
  // Then check our mock dictionary
  return mockEnglishDict[word] || word;
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
  title: string = 'New Document',
  vocabulary?: Array<{chinese: string; english: string}>
): WordListData {
  const sentences = splitIntoSentences(originalText);
  const processedSentences: Sentence[] = [];
  
  sentences.forEach((sentenceText, sentenceIndex) => {
    const words = splitIntoWords(sentenceText, vocabulary);
    const processedWords: Word[] = [];
    
    words.forEach((wordText, wordIndex) => {
      const word: Word = {
        id: `word-${sentenceIndex}-${wordIndex}`,
        hanzi: wordText,
        pinyin: getPinyin(wordText),
        english: getEnglishTranslation(wordText, vocabulary)
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
  title: string = 'New Document',
  vocabulary?: Array<{chinese: string; english: string}>
): SavedDocument {
  const wordListData = processChineseText(originalText, title, vocabulary);
  
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