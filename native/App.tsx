/**
 * ZiPop - Chinese Reader App
 * Multilingual reading app with text management
 */

import React, { useRef, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';

// Import hooks and components
import { useAppState } from './hooks/useAppState';
import WordGrid from './components/WordGrid';
import TranslationView from './components/TranslationView';
import AddTextView from './components/AddTextView';
import ChooseTextView from './components/ChooseTextView';
import { SavedDocument } from './types';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Use the domain layer through the custom hook
  const {
    wordList,
    audioState,
    selectedWord,
    selectedSentence,
    currentSentenceId,
    currentView,
    selectWord,
    selectSentence,
    setCurrentSentence,
    goToReader,
    goToAddText,
    goToChooseText,
    loadDocument,
    saveCurrentDocument,
    formatTime,
  } = useAppState();

  // Set initial current sentence for demonstration
  useEffect(() => {
    if (wordList.sentences.length > 0 && !currentSentenceId) {
      setCurrentSentence(wordList.sentences[0].id);
    }
  }, [wordList.sentences, currentSentenceId, setCurrentSentence]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  };

  // Handle document save from AddTextView
  const handleSaveDocument = async (document: SavedDocument) => {
    try {
      await saveCurrentDocument(document);
    } catch (error) {
      Alert.alert('Error', 'Failed to save document. Please try again.');
    }
  };

  // Handle document selection from ChooseTextView
  const handleSelectDocument = async (document: SavedDocument) => {
    try {
      await loadDocument(document);
    } catch (error) {
      Alert.alert('Error', 'Failed to load document. Please try again.');
    }
  };

  // Render the appropriate view based on current navigation state
  const renderCurrentView = () => {
    switch (currentView) {
      case 'addText':
        return (
          <AddTextView
            onSave={handleSaveDocument}
            onCancel={goToReader}
          />
        );
        
      case 'chooseText':
        return (
          <ChooseTextView
            onSelectDocument={handleSelectDocument}
            onCancel={goToReader}
            onAddNew={goToAddText}
          />
        );
        
      case 'reader':
      default:
        return (
          <>
            {/* FIXED HEADER */}
            <View style={[
              styles.header,
              { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
            ]}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={goToChooseText}
              >
                <Text style={[
                  styles.menuButtonText,
                  { color: isDarkMode ? '#81b0ff' : '#007AFF' }
                ]}>
                  Choose Text
                </Text>
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={[
                  styles.headerTitle,
                  { color: isDarkMode ? '#ffffff' : '#000000' }
                ]}>
                  {wordList.title}
                </Text>
                <Text style={[
                  styles.audioStatus,
                  { color: isDarkMode ? '#999999' : '#666666' }
                ]}>
                  {audioState.isPlaying ? '▶︎' : '⏸'} {formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.menuButton}
                onPress={goToAddText}
              >
                <Text style={[
                  styles.menuButtonText,
                  { color: isDarkMode ? '#81b0ff' : '#007AFF' }
                ]}>
                  Add Text
                </Text>
              </TouchableOpacity>
            </View>

            {/* SCROLLABLE CONTENT */}
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollView}
              showsVerticalScrollIndicator={true}
              bounces={false}
            >
              <WordGrid
                sentences={wordList.sentences}
                selectedWordId={selectedWord?.id}
                currentSentenceId={currentSentenceId}
                onWordPress={selectWord}
                onSentencePress={selectSentence}
              />
            </ScrollView>

            {/* FOOTER */}
            <TranslationView 
              selectedWord={selectedWord} 
              selectedSentence={selectedSentence}
            />
          </>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#2a2a2a' : '#ffffff'}
        translucent={false}
      />
      
      {renderCurrentView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  audioStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  menuButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  menuButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flexGrow: 1,
  },
});

export default App;
