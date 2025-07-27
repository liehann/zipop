// Core data structure interfaces for ZiPop Chinese Reader App

export interface Word {
  id: string;
  pinyin: string;
  hanzi: string;
  english: string;
}

export interface Sentence {
  id: string;
  words: Word[];
}

export interface WordListData {
  id: string;
  title: string;
  sentences: Sentence[];
}

// Audio player state - simplified
export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

// Translation display state - supports both word and sentence translations
export interface TranslationState {
  selectedWord: Word | null;
  selectedSentence: Sentence | null;
}

// Sentence playback state
export interface SentenceState {
  currentSentenceId: string | null;
} 