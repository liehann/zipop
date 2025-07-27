import { WordListData, Word, Sentence } from './types';

// Sample sentences for the Chinese reader
const sentence1: Sentence = {
  id: 'sentence-1',
  words: [
    {
      id: 'word-1-1',
      pinyin: 'nǐ',
      hanzi: '你',
      english: 'you'
    },
    {
      id: 'word-1-2',
      pinyin: 'hǎo',
      hanzi: '好',
      english: 'good/well'
    },
    {
      id: 'word-1-3',
      pinyin: 'ma',
      hanzi: '吗',
      english: 'question particle'
    }
  ]
};

const sentence2: Sentence = {
  id: 'sentence-2',
  words: [
    {
      id: 'word-2-1',
      pinyin: 'wǒ',
      hanzi: '我',
      english: 'I/me'
    },
    {
      id: 'word-2-2',
      pinyin: 'hěn',
      hanzi: '很',
      english: 'very'
    },
    {
      id: 'word-2-3',
      pinyin: 'hǎo',
      hanzi: '好',
      english: 'good/well'
    }
  ]
};

const sentence3: Sentence = {
  id: 'sentence-3',
  words: [
    {
      id: 'word-3-1',
      pinyin: 'xiè',
      hanzi: '谢',
      english: 'thank'
    },
    {
      id: 'word-3-2',
      pinyin: 'xiè',
      hanzi: '谢',
      english: 'thank'
    },
    {
      id: 'word-3-3',
      pinyin: 'nǐ',
      hanzi: '你',
      english: 'you'
    }
  ]
};

const sentence4: Sentence = {
  id: 'sentence-4',
  words: [
    {
      id: 'word-4-1',
      pinyin: 'duì',
      hanzi: '对',
      english: 'correct'
    },
    {
      id: 'word-4-2',
      pinyin: 'bù',
      hanzi: '不',
      english: 'not'
    },
    {
      id: 'word-4-3',
      pinyin: 'qǐ',
      hanzi: '起',
      english: 'rise/up'
    }
  ]
};

const sentence5: Sentence = {
  id: 'sentence-5',
  words: [
    {
      id: 'word-5-1',
      pinyin: 'zài',
      hanzi: '再',
      english: 'again'
    },
    {
      id: 'word-5-2',
      pinyin: 'jiàn',
      hanzi: '见',
      english: 'see/meet'
    }
  ]
};

const sentence6: Sentence = {
  id: 'sentence-6',
  words: [
    {
      id: 'word-6-1',
      pinyin: 'tā',
      hanzi: '他',
      english: 'he/him'
    },
    {
      id: 'word-6-2',
      pinyin: 'shì',
      hanzi: '是',
      english: 'is/to be'
    },
    {
      id: 'word-6-3',
      pinyin: 'lǎo',
      hanzi: '老',
      english: 'old'
    },
    {
      id: 'word-6-4',
      pinyin: 'shī',
      hanzi: '师',
      english: 'teacher'
    }
  ]
};

export const sampleWordList: WordListData = {
  id: 'basic-sentences',
  title: 'Basic Chinese Sentences',
  sentences: [sentence1, sentence2, sentence3, sentence4, sentence5, sentence6]
}; 