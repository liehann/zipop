// Core data structure interfaces for ZiPop Chinese Reader App

export interface Word {
  chinese: string;
  pinyin: string;
  english: string;
}

export interface Sentence {
  id: string;
  words: Word[];
  startTime?: number; // For audio synchronization
  endTime?: number;
}

export interface ChineseText {
  id: string;
  title: string;
  sentences: Sentence[];
  audioUrl?: string; // Generated TTS audio URL
}

// Audio player state
export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  currentSentenceId: string | null;
}

// Translation bar state
export interface TranslationBarState {
  type: 'sentence' | 'word' | 'character';
  content: {
    chinese: string;
    pinyin: string;
    english: string;
  };
  visible: boolean;
}

// App settings
export interface Settings {
  playbackSpeed: number;
  autoScroll: boolean;
  fontSize: number;
}

// Audio player component props
export interface AudioPlayerProps {
  audioState: AudioState;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  isDarkMode: boolean;
}

// Translation bar component props
export interface TranslationBarProps {
  state: TranslationBarState;
  onClose: () => void;
  isDarkMode: boolean;
}

// Main app props for text display
export interface TextDisplayProps {
  text: ChineseText;
  audioState: AudioState;
  onSentencePress: (sentence: Sentence) => void;
  onWordPress: (word: Word) => void;
  onCharacterPress: (character: string, word: Word) => void;
  isDarkMode: boolean;
} 