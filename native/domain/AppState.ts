import { WordListData, Word, AudioState, TranslationState, SentenceState, Sentence, AppViewState, SavedDocument } from '../types';
import contentService from '../services/contentService';
import { saveDocument, setCurrentDocument } from '../utils/storage';
import { audioManager, AudioManagerConfig } from '../utils/audioManager';
import { loadAudioFromConfig } from '../utils/audioUtils';

export class AppState {
  private wordList: WordListData;
  private audioState: AudioState;
  private translationState: TranslationState;
  private sentenceState: SentenceState;
  private appViewState: AppViewState;
  private listeners: Set<() => void> = new Set();
  private currentLessonAudio: any = null; // Store current lesson's audio config
  private currentLessonData: any = null; // Store current lesson data for timing lookups

  constructor() {
    // Initialize with empty data - will load default content asynchronously
    this.wordList = {
      id: 'loading',
      title: 'Loading...',
      sentences: [],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString()
    };
    
    // Load default content asynchronously
    this.loadDefaultContent();
    
    this.audioState = {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
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

    // Configure audio manager callbacks
    this.setupAudioManager();
  }

  private async loadDefaultContent(): Promise<void> {
    try {
      // Try to load beginner-greetings content as default
      const beginnerGreetingsContent = await contentService.getContentById('beginner-greetings');
      if (beginnerGreetingsContent) {
        this.wordList = contentService.contentToWordListData(beginnerGreetingsContent);
        this.currentLessonAudio = beginnerGreetingsContent.audio;
        this.currentLessonData = beginnerGreetingsContent;
        this.initializeAudio();
        this.notifyListeners();
      } else {
        // Try to load any featured content
        const featuredContent = await contentService.getFeaturedContent();
        if (featuredContent.length > 0) {
          const firstContent = featuredContent[0];
          this.wordList = contentService.contentToWordListData(firstContent);
          this.currentLessonAudio = firstContent.audio;
          this.currentLessonData = firstContent;
          this.initializeAudio();
          this.notifyListeners();
        } else {
          // Fallback to empty content
          this.wordList = {
            id: 'empty',
            title: 'No Content Available',
            sentences: [],
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
          };
          this.notifyListeners();
        }
      }
    } catch (error) {
      console.error('Failed to load default content:', error);
      this.wordList = {
        id: 'error',
        title: 'Connection Error',
        sentences: [],
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };
      this.notifyListeners();
    }
  }

  private setupAudioManager(): void {
    const config: AudioManagerConfig = {
      onTimeUpdate: (currentTime: number) => {
        this.updateAudioTime(currentTime);
        this.updateCurrentSentenceFromTime(currentTime);
      },
      onPlaybackEnd: () => {
        this.audioState = {
          ...this.audioState,
          isPlaying: false,
        };
        this.notifyListeners();
      },
      onError: (error: string) => {
        console.error('Audio Manager Error:', error);
        this.audioState = {
          ...this.audioState,
          isPlaying: false,
        };
        this.notifyListeners();
      },
    };

    // Apply configuration to existing audio manager
    (audioManager as any).config = config;
  }

  /**
   * Update the current sentence based on audio playback time
   */
  private updateCurrentSentenceFromTime(currentTime: number): void {
    if (!this.currentLessonData?.content?.sentences) {
      console.log('No lesson data available for sentence tracking');
      return;
    }

    // Find the sentence that should be playing at the current time
    // Add a small buffer (0.1 seconds) to prevent rapid switching
    const playingSentence = this.currentLessonData.content.sentences.find((sentence: any) => {
      if (sentence.timing && sentence.timing.start !== undefined && sentence.timing.end !== undefined) {
        const isInRange = currentTime >= (sentence.timing.start - 0.1) && currentTime <= (sentence.timing.end + 0.1);
        if (isInRange) {
          console.log(`Found playing sentence at time ${currentTime}:`, sentence.chinese);
        }
        return isInRange;
      }
      return false;
    });

    if (playingSentence) {
      // Find the corresponding sentence in our wordList
      const sentenceChinese = playingSentence.chinese;
      console.log(`Looking for sentence in wordList: "${sentenceChinese}"`);
      
      // Remove punctuation from both sides for comparison
      const normalizedSentenceChinese = sentenceChinese.replace(/[。！？；，]/g, '');
      
      const matchingSentence = this.wordList.sentences.find(sentence => {
        const wordListSentence = sentence.words.map(word => word.hanzi).join('');
        const normalizedWordListSentence = wordListSentence.replace(/[。！？；，]/g, '');
        return normalizedWordListSentence === normalizedSentenceChinese;
      });

      if (matchingSentence) {
        console.log(`Found matching sentence with ID: ${matchingSentence.id}, current ID: ${this.sentenceState.currentSentenceId}`);
        
        if (this.sentenceState.currentSentenceId !== matchingSentence.id) {
          console.log(`Updating current sentence ID to: ${matchingSentence.id}`);
          
          // Update current sentence
          this.sentenceState = {
            ...this.sentenceState,
            currentSentenceId: matchingSentence.id,
          };
          
          // Also select this sentence for display in the translation view
          this.translationState = {
            ...this.translationState,
            selectedSentence: matchingSentence,
            selectedWord: null, // Clear word selection when sentence changes
          };
          
          this.notifyListeners();
        }
      } else {
        console.log(`No matching sentence found for: "${sentenceChinese}" (normalized: "${normalizedSentenceChinese}")`);
        console.log('Available sentences (normalized):', this.wordList.sentences.map(s => {
          const original = s.words.map(word => word.hanzi).join('');
          const normalized = original.replace(/[。！？；，]/g, '');
          return `"${original}" → "${normalized}"`;
        }));
      }
    } else {
      // If no sentence is playing, keep the current selection but update current sentence to null
      // This prevents losing the translation display when audio is between sentences
      if (this.sentenceState.currentSentenceId !== null) {
        this.sentenceState = {
          ...this.sentenceState,
          currentSentenceId: null,
        };
        this.notifyListeners();
      }
    }
  }

  private async initializeAudio(): Promise<void> {
    if (this.currentLessonAudio?.enabled && this.currentLessonData?.id) {
      try {
        // Load audio using content ID instead of filename
        const audioSource = contentService.getAudioUrl(this.currentLessonData.id);
        const audioLoaded = await audioManager.loadAudio(audioSource);
        if (audioLoaded) {
          const audioState = audioManager.getState();
          this.audioState = {
            ...this.audioState,
            duration: audioState.duration,
          };
          this.notifyListeners();
        }
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    }
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
    const audioState = audioManager.getState();
    
    if (audioState.isPlaying) {
      audioManager.pause();
    } else {
      audioManager.play(this.audioState.currentTime);
    }
    
    this.audioState = {
      ...this.audioState,
      isPlaying: !audioState.isPlaying,
    };
    this.notifyListeners();
  }

  /**
   * Play audio for a specific sentence
   */
  playSentenceAudio(sentence: Sentence): void {
    // Find the timing data for this sentence from the lesson data
    const lessonData = getLessonById('beginner-greetings'); // TODO: Make this dynamic based on current lesson
    
    if (lessonData?.content?.sentences) {
      // Get the Chinese text by concatenating hanzi from all words
      const sentenceChinese = sentence.words.map(word => word.hanzi).join('');
      
      const sentenceData = lessonData.content.sentences.find(
        s => s.chinese === sentenceChinese
      );
      
      if (sentenceData?.timing && sentenceData.timing.duration > 0) {
        audioManager.playSentence({
          start: sentenceData.timing.start,
          end: sentenceData.timing.end,
          duration: sentenceData.timing.duration,
        });
        
        this.audioState = {
          ...this.audioState,
          isPlaying: true,
        };
        this.notifyListeners();
      } else {
        console.warn('No timing data found for sentence:', sentenceChinese);
      }
    }
  }

  /**
   * Stop audio playback
   */
  stopAudioPlayback(): void {
    audioManager.stop();
    this.audioState = {
      ...this.audioState,
      isPlaying: false,
      currentTime: 0,
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