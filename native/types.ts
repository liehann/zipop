// Core data structure interfaces for ZiPop Chinese Reader App

export interface Word {
  id: string;
  pinyin: string;
  hanzi: string;
  english: string;
}

export interface WordListData {
  id: string;
  title: string;
  words: Word[];
}

// Audio player state - simplified
export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

// Translation display state
export interface TranslationState {
  selectedWord: Word | null;
} 