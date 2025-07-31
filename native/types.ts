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
  // Full sentence translations
  sentencePinyin?: string;
  sentenceEnglish?: string;
}

export interface WordListData {
  id: string;
  title: string;
  sentences: Sentence[];
  dateCreated?: string;
  dateModified?: string;
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

// App navigation state
export interface AppViewState {
  currentView: 'reader' | 'addText' | 'chooseText';
}

// Storage format for saved documents
export interface SavedDocument {
  id: string;
  title: string;
  originalText: string;
  wordListData: WordListData;
  dateCreated: string;
  dateModified: string;
  // Optional fields for built-in lessons with audio
  audio?: any; // Audio configuration from lesson data
  lessonData?: any; // Complete lesson data for audio timing lookups
} 