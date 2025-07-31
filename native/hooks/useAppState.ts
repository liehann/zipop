import { useEffect, useState, useCallback } from 'react';
import { appState } from '../domain/AppState';

// Custom hook to connect React components to the AppState domain layer
export const useAppState = () => {
  const [, forceUpdate] = useState(0);

  const handleStateChange = useCallback(() => {
    forceUpdate(prev => prev + 1); // Use counter instead of new object
  }, []);

  useEffect(() => {

    // Subscribe to state changes
    appState.addListener(handleStateChange);

    // Cleanup subscription on unmount
    return () => {
      appState.removeListener(handleStateChange);
    };
  }, []);

  // Memoize bound functions to prevent infinite loops in useEffect dependencies
  const selectWord = useCallback((word: any) => appState.selectWord(word), []);
  const selectSentence = useCallback((sentence: any) => appState.selectSentence(sentence), []);
  const clearSelection = useCallback(() => appState.clearSelection(), []);
  const setCurrentSentence = useCallback((sentenceId: string | null) => appState.setCurrentSentence(sentenceId), []);
  
  const setCurrentView = useCallback((view: any) => appState.setCurrentView(view), []);
  const goToReader = useCallback(() => appState.goToReader(), []);
  const goToAddText = useCallback(() => appState.goToAddText(), []);
  const goToChooseText = useCallback(() => appState.goToChooseText(), []);
  
  const loadDocument = useCallback((document: any) => appState.loadDocument(document), []);
  const saveCurrentDocument = useCallback((document: any) => appState.saveCurrentDocument(document), []);
  
  const toggleAudioPlayback = useCallback(() => appState.toggleAudioPlayback(), []);
  const playSentenceAudio = useCallback((sentence: any) => appState.playSentenceAudio(sentence), []);
  const stopAudioPlayback = useCallback(() => appState.stopAudioPlayback(), []);
  const seekAudio = useCallback((time: number) => appState.seekAudio(time), []);
  const goToPreviousSentence = useCallback(() => appState.goToPreviousSentence(), []);
  const goToNextSentence = useCallback(() => appState.goToNextSentence(), []);
  const repeatCurrentSentence = useCallback(() => appState.repeatCurrentSentence(), []);
  const restartAudio = useCallback(() => appState.restartAudio(), []);
  const updateAudioTime = useCallback((currentTime: number) => appState.updateAudioTime(currentTime), []);
  const formatTime = useCallback((timeInSeconds: number) => appState.formatTime(timeInSeconds), []);

  return {
    // State getters
    wordList: appState.getWordList(),
    audioState: appState.getAudioState(),
    translationState: appState.getTranslationState(),
    sentenceState: appState.getSentenceState(),
    appViewState: appState.getAppViewState(),
    selectedWord: appState.getSelectedWord(),
    selectedSentence: appState.getSelectedSentence(),
    currentSentenceId: appState.getCurrentSentenceId(),
    currentView: appState.getCurrentView(),
    
    // Actions (memoized)
    selectWord,
    selectSentence,
    clearSelection,
    setCurrentSentence,
    
    // Navigation actions (memoized)
    setCurrentView,
    goToReader,
    goToAddText,
    goToChooseText,
    
    // Document management (memoized)
    loadDocument,
    saveCurrentDocument,
    
    // Audio actions (memoized)
    toggleAudioPlayback,
    playSentenceAudio,
    stopAudioPlayback,
    seekAudio,
    goToPreviousSentence,
    goToNextSentence,
    repeatCurrentSentence,
    restartAudio,
    updateAudioTime,
    formatTime,
  };
}; 