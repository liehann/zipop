// Core data structure interfaces for ZiPop app

export interface Translation {
  chinese: string;
  pinyin: string;
  english: string;
}

export interface Line {
  id: string;
  translation: Translation;
}

export interface Section {
  id: string;
  title: Translation;
  lines: Line[];
}

export interface Document {
  id: string;
  title: Translation;
  sections: Section[];
}

export interface Settings {
  showChinese: boolean;
  showPinyin: boolean;
  showEnglish: boolean;
}

// Translation card interfaces
export interface TranslationCardData {
  word: string;
  translation: Translation;
  position: { x: number; y: number };
  language: 'chinese' | 'pinyin' | 'english';
}

export interface TranslationCardProps {
  visible: boolean;
  data: TranslationCardData | null;
  onClose: () => void;
  isDarkMode: boolean;
} 