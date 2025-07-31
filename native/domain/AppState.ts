import { WordListData, Word, AudioState, TranslationState, SentenceState, Sentence, AppViewState, SavedDocument } from '../types';
import contentService from '../services/contentService';
import { saveDocument, setCurrentDocument, getCurrentDocumentId, getDocument } from '../utils/storage';
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
      // First, try to restore the previously opened document
      const previousDocumentId = await getCurrentDocumentId();
      console.log('🔄 Checking for previous document:', previousDocumentId);
      
      if (previousDocumentId) {
        // Try to load the previous document (could be a saved document or backend content)
        const restoredContent = await this.restorePreviousDocument(previousDocumentId);
        if (restoredContent) {
          console.log('✅ Successfully restored previous document:', previousDocumentId);
          return; // Exit early if restoration was successful
        } else {
          console.log('❌ Failed to restore previous document, falling back to default');
        }
      }

      // If no previous document or restoration failed, try to load beginner-greetings content as default
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

  /**
   * Attempt to restore a previously opened document by ID
   * Tries both saved documents and backend content
   */
  private async restorePreviousDocument(documentId: string): Promise<boolean> {
    try {
      // First, try to load from saved documents (local storage)
      const savedDocument = await getDocument(documentId);
      if (savedDocument) {
        console.log('📂 Found saved document:', savedDocument.title);
        this.wordList = savedDocument.wordListData;
        
        // Set audio configuration if available (for built-in lessons)
        if (savedDocument.audio && savedDocument.lessonData) {
          this.currentLessonAudio = savedDocument.audio;
          this.currentLessonData = savedDocument.lessonData;
          await this.initializeAudio();
        } else {
          // Clear audio if no audio configuration
          this.currentLessonAudio = null;
          this.currentLessonData = null;
        }
        
        // Set first sentence as current if available
        if (savedDocument.wordListData.sentences.length > 0) {
          this.setCurrentSentence(savedDocument.wordListData.sentences[0].id);
        }
        
        this.notifyListeners();
        return true;
      }

      // If not found in saved documents, try to load from backend content
      const backendContent = await contentService.getContentById(documentId);
      if (backendContent) {
        console.log('🌐 Found backend content:', backendContent.title);
        this.wordList = contentService.contentToWordListData(backendContent);
        this.currentLessonAudio = backendContent.audio;
        this.currentLessonData = backendContent;
        await this.initializeAudio();
        
        // Ensure the current document ID is maintained
        await setCurrentDocument(documentId);
        
        // Set first sentence as current if available
        if (this.wordList.sentences.length > 0) {
          this.setCurrentSentence(this.wordList.sentences[0].id);
        }
        
        this.notifyListeners();
        return true;
      }

      console.log('📭 Document not found in saved documents or backend content:', documentId);
      return false;
    } catch (error) {
      console.error('Failed to restore previous document:', documentId, error);
      return false;
    }
  }

  private setupAudioManager(): void {
    const config: AudioManagerConfig = {
      onTimeUpdate: (currentTime: number) => {
        // Combine both updates into a single call to prevent multiple re-renders
        this.updateAudioState(currentTime);
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



  private async initializeAudio(): Promise<void> {
    if (this.currentLessonAudio?.enabled && this.currentLessonAudio?.file) {
      try {
        // Load audio using static file configuration
        const audioConfig = await loadAudioFromConfig(this.currentLessonAudio);
        if (audioConfig) {
          const audioLoaded = await audioManager.loadAudio(audioConfig.source.uri);
          if (audioLoaded) {
            const audioState = audioManager.getState();
            this.audioState = {
              ...this.audioState,
              duration: audioState.duration,
            };
            this.notifyListeners();
          }
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

  getCurrentVocabulary(): Array<{ chinese: string; english: string }> {
    return this.currentLessonData?.vocabulary || [];
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
      console.log('🎵 Loading document:', document.title, 'with audio:', !!document.audio);
      
      this.wordList = document.wordListData;
      
      // Set audio configuration if available (for built-in lessons)
      if (document.audio && document.lessonData) {
        console.log('🎵 Setting up audio for document:', document.title);
        this.currentLessonAudio = document.audio;
        this.currentLessonData = document.lessonData;
        // Initialize audio for the new content
        await this.initializeAudio();
      } else {
        console.log('🎵 No audio config for document:', document.title);
        // Clear audio if no audio configuration
        this.currentLessonAudio = null;
        this.currentLessonData = null;
      }
      
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
      // If audio has reached the end, restart from beginning
      if (this.audioState.currentTime >= this.audioState.duration && this.audioState.duration > 0) {
        this.restartAudio();
        return;
      } else {
        audioManager.play(this.audioState.currentTime);
      }
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
    if (!this.currentLessonData?.content?.sentences) {
      console.warn('No lesson data available for sentence playback');
      return;
    }
    
    // Find the sentence index in wordList to get corresponding timing data
    const sentenceIndex = this.wordList.sentences.findIndex(s => s.id === sentence.id);
    
    if (sentenceIndex >= 0 && sentenceIndex < this.currentLessonData.content.sentences.length) {
      const sentenceData = this.currentLessonData.content.sentences[sentenceIndex];
      
      if (sentenceData?.timing && sentenceData.timing.duration > 0) {
        console.log(`Playing sentence at index ${sentenceIndex} with timing:`, sentenceData.timing);
        
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
        console.warn('No timing data found for sentence at index:', sentenceIndex);
      }
    } else {
      console.warn('Sentence index not found or out of range:', sentenceIndex);
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

  /**
   * Seek audio to specific time position
   */
  seekAudio(time: number): void {
    audioManager.seekTo(time);
    this.audioState = {
      ...this.audioState,
      currentTime: time,
    };
    this.notifyListeners();
  }

  /**
   * Navigate to previous sentence
   */
  goToPreviousSentence(): void {
    if (!this.currentLessonData?.content?.sentences || this.wordList.sentences.length === 0) {
      return;
    }

    const currentIndex = this.getCurrentSentenceIndex();
    const previousIndex = Math.max(0, currentIndex - 1);
    
    if (previousIndex !== currentIndex) {
      this.navigateToSentenceByIndex(previousIndex);
    }
  }

  /**
   * Navigate to next sentence
   */
  goToNextSentence(): void {
    if (!this.currentLessonData?.content?.sentences || this.wordList.sentences.length === 0) {
      return;
    }

    const currentIndex = this.getCurrentSentenceIndex();
    const nextIndex = Math.min(this.wordList.sentences.length - 1, currentIndex + 1);
    
    if (nextIndex !== currentIndex) {
      this.navigateToSentenceByIndex(nextIndex);
    }
  }

  /**
   * Get current sentence index
   */
  private getCurrentSentenceIndex(): number {
    if (!this.sentenceState.currentSentenceId) {
      return 0;
    }
    
    const index = this.wordList.sentences.findIndex(
      sentence => sentence.id === this.sentenceState.currentSentenceId
    );
    return Math.max(0, index);
  }

  /**
   * Navigate to sentence by index and start playing from that position
   */
  private navigateToSentenceByIndex(index: number): void {
    if (index < 0 || index >= this.wordList.sentences.length) {
      return;
    }

    const sentence = this.wordList.sentences[index];
    const sentenceData = this.currentLessonData?.content?.sentences?.[index];
    
    // Update current sentence
    this.sentenceState = {
      ...this.sentenceState,
      currentSentenceId: sentence.id,
    };

    // If we have timing data, seek to the sentence start time
    if (sentenceData?.timing?.start !== undefined) {
      this.seekAudio(sentenceData.timing.start);
    }

    this.notifyListeners();
  }

  /**
   * Handle audio end - restart from beginning when play is pressed
   */
  restartAudio(): void {
    this.seekAudio(0);
    audioManager.play(0);
    this.audioState = {
      ...this.audioState,
      isPlaying: true,
      currentTime: 0,
    };
    this.notifyListeners();
  }

  /**
   * Repeat the current sentence
   */
  repeatCurrentSentence(): void {
    if (!this.currentLessonData?.content?.sentences || this.wordList.sentences.length === 0) {
      return;
    }

    const currentIndex = this.getCurrentSentenceIndex();
    const sentenceData = this.currentLessonData?.content?.sentences?.[currentIndex];
    
    if (sentenceData?.timing?.start !== undefined) {
      // Seek to sentence start and play
      this.seekAudio(sentenceData.timing.start);
      audioManager.play(sentenceData.timing.start);
      this.audioState = {
        ...this.audioState,
        isPlaying: true,
        currentTime: sentenceData.timing.start,
      };
      this.notifyListeners();
    }
  }

  /**
   * Combined audio state update that handles both time and sentence updates
   * This prevents multiple re-renders by batching updates into a single call
   */
  private updateAudioState(currentTime: number): void {
    let shouldUpdate = false;
    let newAudioState = { ...this.audioState };
    let newSentenceState = { ...this.sentenceState };

    // Update audio time only if it has changed significantly
    if (Math.abs(this.audioState.currentTime - currentTime) > 0.01) { // 10ms threshold
      newAudioState.currentTime = currentTime;
      shouldUpdate = true;
    }

    // Update current sentence based on audio playback time
    if (this.currentLessonData?.content?.sentences) {
      const newSentenceId = this.findCurrentSentenceId(currentTime);
      if (this.sentenceState.currentSentenceId !== newSentenceId) {
        newSentenceState.currentSentenceId = newSentenceId;
        shouldUpdate = true;
      }
    }

    // Only update state and notify listeners if something actually changed
    if (shouldUpdate) {
      this.audioState = newAudioState;
      this.sentenceState = newSentenceState;
      this.notifyListeners();
    }
  }

  /**
   * Find the appropriate sentence ID based on current playback time
   */
  private findCurrentSentenceId(currentTime: number): string | null {
    if (!this.currentLessonData?.content?.sentences) {
      return null;
    }

    let playingSentenceIndex = -1;
    
    // First, try to find a sentence that's currently playing (within its timing range)
    let playingSentence = this.currentLessonData.content.sentences.find((sentence: any, index: number) => {
      if (sentence.timing && sentence.timing.start !== undefined && sentence.timing.end !== undefined) {
        const isInRange = currentTime >= sentence.timing.start && currentTime <= sentence.timing.end;
        if (isInRange) {
          playingSentenceIndex = index;
        }
        return isInRange;
      }
      return false;
    });

    // If no sentence is actively playing, find the most appropriate sentence to highlight
    if (!playingSentence) {
      for (let index = 0; index < this.currentLessonData.content.sentences.length; index++) {
        const sentence = this.currentLessonData.content.sentences[index];
        
        if (sentence.timing && sentence.timing.start !== undefined && sentence.timing.end !== undefined) {
          // If we're past this sentence's end time, and there's a next sentence
          if (currentTime > sentence.timing.end) {
            const nextIndex = index + 1;
            if (nextIndex < this.currentLessonData.content.sentences.length) {
              const nextSentence = this.currentLessonData.content.sentences[nextIndex];
              // If the next sentence hasn't started yet, or we're before it starts, show the next sentence
              if (!nextSentence.timing || currentTime < nextSentence.timing.start || !nextSentence.timing.start) {
                playingSentence = nextSentence;
                playingSentenceIndex = nextIndex;
                break;
              }
            } else {
              // This is the last sentence and we're past its end - keep showing it
              playingSentence = sentence;
              playingSentenceIndex = index;
              break;
            }
          }
          // If we're before this sentence starts, show it (we're approaching it)
          else if (currentTime < sentence.timing.start) {
            playingSentence = sentence;
            playingSentenceIndex = index;
            break;
          }
        }
      }
    }

    if (playingSentence && playingSentenceIndex >= 0) {
      const matchingSentence = this.wordList.sentences[playingSentenceIndex];
      return matchingSentence?.id || null;
    }

    return null;
  }

  updateAudioTime(currentTime: number): void {
    // Only update if the time has actually changed to avoid unnecessary re-renders
    if (Math.abs(this.audioState.currentTime - currentTime) > 0.01) { // 10ms threshold
      this.audioState = {
        ...this.audioState,
        currentTime,
      };
      this.notifyListeners();
    }
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