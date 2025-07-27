import { WordListData, Word } from './types';

// Sample word data for the Chinese reader
const sampleWords: Word[] = [
  {
    id: 'word-1',
    pinyin: 'nǐ hǎo',
    hanzi: '你好',
    english: 'hello'
  },
  {
    id: 'word-2',
    pinyin: 'xiè xiè',
    hanzi: '谢谢',
    english: 'thank you'
  },
  {
    id: 'word-3',
    pinyin: 'zài jiàn',
    hanzi: '再见',
    english: 'goodbye'
  },
  {
    id: 'word-4',
    pinyin: 'duì bù qǐ',
    hanzi: '对不起',
    english: 'sorry'
  },
  {
    id: 'word-5',
    pinyin: 'qǐng',
    hanzi: '请',
    english: 'please'
  },
  {
    id: 'word-6',
    pinyin: 'shì',
    hanzi: '是',
    english: 'to be / yes'
  },
  {
    id: 'word-7',
    pinyin: 'bù',
    hanzi: '不',
    english: 'no / not'
  },
  {
    id: 'word-8',
    pinyin: 'wǒ',
    hanzi: '我',
    english: 'I / me'
  },
  {
    id: 'word-9',
    pinyin: 'nǐ',
    hanzi: '你',
    english: 'you'
  },
  {
    id: 'word-10',
    pinyin: 'tā',
    hanzi: '他',
    english: 'he / him'
  },
  {
    id: 'word-11',
    pinyin: 'tā',
    hanzi: '她',
    english: 'she / her'
  },
  {
    id: 'word-12',
    pinyin: 'shénme',
    hanzi: '什么',
    english: 'what'
  },
  {
    id: 'word-13',
    pinyin: 'nǎr',
    hanzi: '哪儿',
    english: 'where'
  },
  {
    id: 'word-14',
    pinyin: 'shéi',
    hanzi: '谁',
    english: 'who'
  },
  {
    id: 'word-15',
    pinyin: 'wèi shénme',
    hanzi: '为什么',
    english: 'why'
  },
  {
    id: 'word-16',
    pinyin: 'zěnme',
    hanzi: '怎么',
    english: 'how'
  },
  {
    id: 'word-17',
    pinyin: 'duō shǎo',
    hanzi: '多少',
    english: 'how much / how many'
  },
  {
    id: 'word-18',
    pinyin: 'hǎo',
    hanzi: '好',
    english: 'good'
  },
  {
    id: 'word-19',
    pinyin: 'dà',
    hanzi: '大',
    english: 'big'
  },
  {
    id: 'word-20',
    pinyin: 'xiǎo',
    hanzi: '小',
    english: 'small'
  }
];

export const sampleWordList: WordListData = {
  id: 'basic-words',
  title: 'Basic Chinese Words',
  words: sampleWords
}; 