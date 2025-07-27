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
    selectedWord: appState.getSelectedWord(),
    selectedSentence: appState.getSelectedSentence(),
    currentSentenceId: appState.getCurrentSentenceId(),
    
    // Actions
    selectWord: appState.selectWord.bind(appState),
    selectSentence: appState.selectSentence.bind(appState),
    clearSelection: appState.clearSelection.bind(appState),
    setCurrentSentence: appState.setCurrentSentence.bind(appState),
    toggleAudioPlayback: appState.toggleAudioPlayback.bind(appState),
    updateAudioTime: appState.updateAudioTime.bind(appState),
    formatTime: appState.formatTime.bind(appState),
  };
}; 