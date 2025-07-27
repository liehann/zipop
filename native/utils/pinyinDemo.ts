import { 
  toPinyin, 
  sentenceToPinyin, 
  toPinyinWithoutTones, 
  toPinyinWithNumericTones,
  isChineseText,
  batchToPinyin 
} from './pinyinUtils';

/**
 * Demo examples showing pinyin library capabilities
 * This file can be imported and used for testing or reference
 */

// Example usage of different pinyin conversion functions
export const pinyinExamples = {
  // Single character conversions
  singleCharacters: {
    '你': toPinyin('你'),         // "nǐ"
    '好': toPinyin('好'),         // "hǎo" 
    '中': toPinyin('中'),         // "zhōng"
    '国': toPinyin('国'),         // "guó"
  },

  // Sentence conversions with proper spacing
  sentences: {
    '你好': sentenceToPinyin('你好'),                    // "nǐ hǎo"
    '你好吗': sentenceToPinyin('你好吗'),                // "nǐ hǎo ma"
    '我是中国人': sentenceToPinyin('我是中国人'),          // "wǒ shì zhōng guó rén"
    '今天天气很好': sentenceToPinyin('今天天气很好'),      // "jīn tiān tiān qì hěn hǎo"
  },

  // Pinyin without tone marks (useful for input)
  withoutTones: {
    '你好': toPinyinWithoutTones('你好'),               // "ni hao"
    '谢谢': toPinyinWithoutTones('谢谢'),               // "xie xie"
    '再见': toPinyinWithoutTones('再见'),               // "zai jian"
  },

  // Pinyin with numeric tones
  numericTones: {
    '你好': toPinyinWithNumericTones('你好'),           // "ni3 hao3"
    '中文': toPinyinWithNumericTones('中文'),           // "zhong1 wen2"
  },

  // Check if text is Chinese
  chineseCheck: {
    '你好': isChineseText('你好'),                      // true
    'hello': isChineseText('hello'),                   // false
    '你好world': isChineseText('你好world'),            // true (contains Chinese)
  },

  // Batch conversion
  batchExample: batchToPinyin(['你', '好', '世', '界']), // ["nǐ", "hǎo", "shì", "jiè"]
};

/**
 * Function to test pinyin conversion with common Chinese phrases
 */
export function testPinyinConversion(): void {
  console.log('=== Pinyin Library Demo ===\n');

  // Test common greetings
  const greetings = ['你好', '您好', '早上好', '晚上好', '再见'];
  console.log('Common greetings:');
  greetings.forEach(greeting => {
    console.log(`${greeting} → ${sentenceToPinyin(greeting)}`);
  });

  console.log('\nCommon phrases:');
  const phrases = [
    '我爱你',
    '谢谢你', 
    '对不起',
    '没关系',
    '祝你好运'
  ];
  
  phrases.forEach(phrase => {
    console.log(`${phrase} → ${sentenceToPinyin(phrase)}`);
  });

  console.log('\nNumbers 1-10:');
  const numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  numbers.forEach((num, index) => {
    console.log(`${num} (${index + 1}) → ${toPinyin(num)}`);
  });
}

/**
 * Example of how to use pinyin conversion in your components
 */
export function createWordFromChinese(hanzi: string, english: string = ''): {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
} {
  return {
    id: `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    hanzi,
    pinyin: toPinyin(hanzi),
    english: english || hanzi // fallback to original if no translation provided
  };
}

// Example usage:
// const word = createWordFromChinese('你', 'you');
// console.log(word); // { id: '...', hanzi: '你', pinyin: 'nǐ', english: 'you' } 