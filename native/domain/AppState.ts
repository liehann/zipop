import { WordListData, Word, AudioState, TranslationState, SentenceState } from '../types';
import { sampleWordList } from '../sampleData';

export class AppState {
  private wordList: WordListData;
  private audioState: AudioState;
  private translationState: TranslationState;
  private sentenceState: SentenceState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.wordList = sampleWordList;
    this.audioState = {
      isPlaying: false,
      currentTime: 5, // 00:05
      duration: 116, // 01:56
    };
    this.translationState = {
      selectedWord: null,
    };
    this.sentenceState = {
      currentSentenceId: null,
    };
  }

  // Getter methods for state
  getWordList(): WordListData {
    return this.wordList;
  }

  getAudioState(): AudioState {
    return this.audioState;
  }

  getTranslationState(): TranslationState {
    return this.translationState;
  }

  getSentenceState(): SentenceState {
    return this.sentenceState;
  }

  getSelectedWord(): Word | null {
    return this.translationState.selectedWord;
  }

  getCurrentSentenceId(): string | null {
    return this.sentenceState.currentSentenceId;
  }

  // Actions
  selectWord(word: Word): void {
    this.translationState = {
      ...this.translationState,
      selectedWord: word,
    };
    this.notifyListeners();
  }

  clearSelection(): void {
    this.translationState = {
      ...this.translationState,
      selectedWord: null,
    };
    this.notifyListeners();
  }

  setCurrentSentence(sentenceId: string | null): void {
    this.sentenceState = {
      ...this.sentenceState,
      currentSentenceId: sentenceId,
    };
    this.notifyListeners();
  }

  toggleAudioPlayback(): void {
    this.audioState = {
      ...this.audioState,
      isPlaying: !this.audioState.isPlaying,
    };
    this.notifyListeners();
  }

  updateAudioTime(currentTime: number): void {
    this.audioState = {
      ...this.audioState,
      currentTime,
    };
    this.notifyListeners();
  }

  // Format time for display
  formatTime(timeInSeconds: number): string {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Listener management for state changes
  addListener(listener: () => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: () => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Singleton instance
export const appState = new AppState(); 