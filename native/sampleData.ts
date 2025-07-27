import { ChineseText, Sentence, Word } from './types';

// Helper function to create words from sentence data
function createWordsFromSentence(chinese: string, pinyin: string, english: string): Word[] {
  // Split pinyin by spaces to get individual words
  const pinyinWords = pinyin.split(/\s+/).filter(word => word.trim());
  const englishWords = english.split(/\s+/).filter(word => word.trim());
  
  const words: Word[] = [];
  let chineseIndex = 0;
  
  for (let i = 0; i < pinyinWords.length; i++) {
    const pinyinWord = pinyinWords[i];
    
    // Estimate Chinese characters for this pinyin word
    // Most pinyin words correspond to 1-3 Chinese characters
    let chineseChars = '';
    const estimatedLength = Math.max(1, Math.min(3, Math.ceil(pinyinWord.length / 3)));
    
    for (let j = 0; j < estimatedLength && chineseIndex < chinese.length; j++) {
      const char = chinese[chineseIndex];
      // Skip punctuation and spaces
      if (char.match(/[\u4e00-\u9fff]/)) {
        chineseChars += char;
        chineseIndex++;
      } else if (char.match(/[.,!?;:，。！？；：]/)) {
        chineseChars += char;
        chineseIndex++;
        break; // Stop at punctuation
      } else {
        chineseIndex++;
      }
    }
    
    // If we have remaining Chinese characters and this is the last pinyin word,
    // include all remaining characters
    if (i === pinyinWords.length - 1 && chineseIndex < chinese.length) {
      chineseChars += chinese.slice(chineseIndex);
    }
    
    // Try to match English words to Chinese/Pinyin words
    // For now, use a simple distribution approach
    const englishWordsPerPinyin = Math.ceil(englishWords.length / pinyinWords.length);
    const startIdx = i * englishWordsPerPinyin;
    const endIdx = Math.min(startIdx + englishWordsPerPinyin, englishWords.length);
    const englishPart = englishWords.slice(startIdx, endIdx).join(' ');
    
    if (chineseChars || pinyinWord) {
      words.push({
        chinese: chineseChars,
        pinyin: pinyinWord,
        english: englishPart || ''
      });
    }
  }
  
  // Fallback: if no words were created, create a single word with the full sentence
  if (words.length === 0) {
    words.push({
      chinese: chinese,
      pinyin: pinyin,
      english: english
    });
  }
  
  return words;
}

// Sample Chinese text for the reader
const sampleTextMarkdown = `
# 学习中文的第一天
# Learning Chinese - Day One

你好，我的名字是李华。
nǐ hǎo, wǒ de míng zi shì lǐ huá.
Hello, my name is Li Hua.

我今年二十五岁。
wǒ jīn nián èr shí wǔ suì.
I am twenty-five years old.

我来自北京。
wǒ lái zì běi jīng.
I come from Beijing.

我是一名学生。
wǒ shì yī míng xué shēng.
I am a student.

我在大学学习英语。
wǒ zài dà xué xué xí yīng yǔ.
I study English at university.

我喜欢读书。
wǒ xǐ huān dú shū.
I like reading books.

我也喜欢看电影。
wǒ yě xǐ huān kàn diàn yǐng.
I also like watching movies.

周末的时候，我经常和朋友一起出去。
zhōu mò de shí hòu, wǒ jīng cháng hé péng yǒu yī qǐ chū qù.
On weekends, I often go out with friends.

我们去餐厅吃饭。
wǒ men qù cān tīng chī fàn.
We go to restaurants to eat.

有时候我们去电影院看电影。
yǒu shí hòu wǒ men qù diàn yǐng yuán kàn diàn yǐng.
Sometimes we go to the cinema to watch movies.

中文很有趣。
zhōng wén hěn yǒu qù.
Chinese is very interesting.

但是也很难学。
dàn shì yě hěn nán xué.
But it's also difficult to learn.

我每天都练习说中文。
wǒ měi tiān dōu liàn xí shuō zhōng wén.
I practice speaking Chinese every day.

我希望有一天能说得很流利。
wǒ xī wàng yǒu yī tiān néng shuō de hěn liú lì.
I hope one day I can speak very fluently.

谢谢你听我介绍自己。
xiè xiè nǐ tīng wǒ jiè shào zì jǐ.
Thank you for listening to my self-introduction.
`;

// Parser function to convert markdown format to ChineseText structure
function parseMarkdownToChineseText(markdown: string): ChineseText {
  const lines = markdown.trim().split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return {
      id: 'sample-text',
      title: 'Sample Text',
      sentences: []
    };
  }
  
  // Parse title (first 2 lines starting with #)
  const titleLines = lines.slice(0, 2);
  const title = titleLines[0].replace(/^#\s*/, '').trim();
  
  const sentences: Sentence[] = [];
  let sentenceIndex = 0;
  
  // Parse sentences (groups of 3 lines: Chinese, Pinyin, English)
  for (let i = 2; i < lines.length; i += 4) { // Skip empty lines
    const chineseLine = lines[i]?.trim();
    const pinyinLine = lines[i + 1]?.trim();
    const englishLine = lines[i + 2]?.trim();
    
    if (chineseLine && pinyinLine && englishLine) {
      const words = createWordsFromSentence(chineseLine, pinyinLine, englishLine);
      
      // Calculate estimated timing for audio (rough estimate: 0.5 seconds per character)
      const startTime = sentenceIndex * 3.0; // 3 seconds per sentence
      const endTime = startTime + Math.max(2.0, chineseLine.length * 0.3);
      
      sentences.push({
        id: `sentence-${sentenceIndex + 1}`,
        words: words,
        startTime: startTime,
        endTime: endTime
      });
      
      sentenceIndex++;
    }
  }
  
  return {
    id: 'chinese-reader-sample',
    title: title,
    sentences: sentences
  };
}

// Export the parsed Chinese text
export const sampleChineseText: ChineseText = parseMarkdownToChineseText(sampleTextMarkdown);

// For backward compatibility, also export a function to get multiple texts
export const getSampleTexts = (): ChineseText[] => {
  return [sampleChineseText];
}; 