import { useEffect, useState } from 'react';
import { appState } from '../domain/AppState';

// Custom hook to connect React components to the AppState domain layer
export const useAppState = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleStateChange = () => {
      forceUpdate({}); // Force re-render when state changes
    };

    // Subscribe to state changes
    appState.addListener(handleStateChange);

    // Cleanup subscription on unmount
    return () => {
      appState.removeListener(handleStateChange);
    };
  }, []);

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
    
    // Actions
    selectWord: appState.selectWord.bind(appState),
    selectSentence: appState.selectSentence.bind(appState),
    clearSelection: appState.clearSelection.bind(appState),
    setCurrentSentence: appState.setCurrentSentence.bind(appState),
    
    // Navigation actions
    setCurrentView: appState.setCurrentView.bind(appState),
    goToReader: appState.goToReader.bind(appState),
    goToAddText: appState.goToAddText.bind(appState),
    goToChooseText: appState.goToChooseText.bind(appState),
    
    // Document management
    loadDocument: appState.loadDocument.bind(appState),
    saveCurrentDocument: appState.saveCurrentDocument.bind(appState),
    
    // Audio actions
    toggleAudioPlayback: appState.toggleAudioPlayback.bind(appState),
    playSentenceAudio: appState.playSentenceAudio.bind(appState),
    stopAudioPlayback: appState.stopAudioPlayback.bind(appState),
    updateAudioTime: appState.updateAudioTime.bind(appState),
    formatTime: appState.formatTime.bind(appState),
  };
}; 