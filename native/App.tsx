/**
 * ZiPop - Chinese Reader App
 * Multilingual reading app with text management
 */

import React, { useRef, useEffect, useState } from 'react';
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
import Clipboard from '@react-native-clipboard/clipboard';

// Import hooks and components
import { useAppState } from './hooks/useAppState';
import WordGrid from './components/WordGrid';
import TranslationView from './components/TranslationView';
import AddTextView from './components/AddTextView';
import ChooseTextView from './components/ChooseTextView';
import Sidebar from './components/Sidebar';
import { SavedDocument } from './types';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
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
    toggleAudioPlayback,
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

  // Copy all Chinese text to clipboard
  const handleCopyChinese = async () => {
    try {
      const chineseText = wordList.sentences
        .map(sentence => 
          sentence.words.map(word => word.hanzi).join('')
        )
        .join('');
      
      await Clipboard.setString(chineseText);
      Alert.alert('Success', 'Chinese text copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy text. Please try again.');
    }
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
                style={styles.hamburgerButton}
                onPress={() => setSidebarVisible(true)}
              >
                <Text style={[
                  styles.hamburgerIcon,
                  { color: isDarkMode ? '#ffffff' : '#000000' }
                ]}>
                  ☰
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
                  {formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}
                </Text>
              </View>
              
              {/* Play/Pause Button */}
              <TouchableOpacity
                style={[
                  styles.headerPlayButton,
                  { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' }
                ]}
                onPress={toggleAudioPlayback}
                activeOpacity={0.7}
              >
                <Text style={styles.headerPlayButtonText}>
                  {audioState.isPlaying ? '⏸' : '▶️'}
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
                selectedSentenceId={selectedSentence?.id}
                currentSentenceId={currentSentenceId}
                onWordPress={selectWord}
                onSentencePress={selectSentence}
              />
            </ScrollView>

            {/* FOOTER */}
            <TranslationView 
              selectedWord={selectedWord} 
              selectedSentence={selectedSentence}
              onSentenceSelect={(sentence) => {
                setCurrentSentence(sentence.id);
                selectSentence(sentence);
              }}
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
      
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onChooseText={goToChooseText}
        onAddText={goToAddText}
        onCopyChinese={handleCopyChinese}
      />
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
  hamburgerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  hamburgerIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerPlayButtonText: {
    fontSize: 16,
    color: '#ffffff',
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
