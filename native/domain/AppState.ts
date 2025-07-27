import { WordListData, Word, AudioState, TranslationState, SentenceState, Sentence, AppViewState, SavedDocument } from '../types';
import { sampleWordList } from '../sampleData';
import { saveDocument, setCurrentDocument } from '../utils/storage';

export class AppState {
  private wordList: WordListData;
  private audioState: AudioState;
  private translationState: TranslationState;
  private sentenceState: SentenceState;
  private appViewState: AppViewState;
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
      selectedSentence: null,
    };
    this.sentenceState = {
      currentSentenceId: null,
    };
    this.appViewState = {
      currentView: 'reader',
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

  getAppViewState(): AppViewState {
    return this.appViewState;
  }

  getCurrentView(): AppViewState['currentView'] {
    return this.appViewState.currentView;
  }

  getSelectedWord(): Word | null {
    return this.translationState.selectedWord;
  }

  getSelectedSentence(): Sentence | null {
    return this.translationState.selectedSentence;
  }

  getCurrentSentenceId(): string | null {
    return this.sentenceState.currentSentenceId;
  }

  // Actions
  selectWord(word: Word): void {
    this.translationState = {
      ...this.translationState,
      selectedWord: word,
      selectedSentence: null, // Clear sentence selection when selecting a word
    };
    this.notifyListeners();
  }

  selectSentence(sentence: Sentence): void {
    this.translationState = {
      ...this.translationState,
      selectedWord: null, // Clear word selection when selecting a sentence
      selectedSentence: sentence,
    };
    this.notifyListeners();
  }

  clearSelection(): void {
    this.translationState = {
      ...this.translationState,
      selectedWord: null,
      selectedSentence: null,
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

  // Navigation actions
  setCurrentView(view: AppViewState['currentView']): void {
    this.appViewState = {
      ...this.appViewState,
      currentView: view,
    };
    this.notifyListeners();
  }

  goToReader(): void {
    this.setCurrentView('reader');
  }

  goToAddText(): void {
    this.setCurrentView('addText');
  }

  goToChooseText(): void {
    this.setCurrentView('chooseText');
  }

  // Document management
  async loadDocument(document: SavedDocument): Promise<void> {
    try {
      this.wordList = document.wordListData;
      
      // Set current document in storage
      await setCurrentDocument(document.id);
      
      // Set first sentence as current if available
      if (document.wordListData.sentences.length > 0) {
        this.setCurrentSentence(document.wordListData.sentences[0].id);
      }
      
      // Clear any selections
      this.clearSelection();
      
      // Go to reader view
      this.goToReader();
      
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load document:', error);
      throw new Error('Failed to load document');
    }
  }

  async saveCurrentDocument(document: SavedDocument): Promise<void> {
    try {
      await saveDocument(document);
      
      // Load the saved document
      await this.loadDocument(document);
    } catch (error) {
      console.error('Failed to save document:', error);
      throw new Error('Failed to save document');
    }
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