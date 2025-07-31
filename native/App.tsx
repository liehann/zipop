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
  Platform,
  Dimensions,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

// Import hooks and components
import { useAppState } from './hooks/useAppState';
import WordGrid, { WordGridRef } from './components/WordGrid';
import TranslationView from './components/TranslationView';
import AddTextView from './components/AddTextView';
import ChooseTextView from './components/ChooseTextView';
import Sidebar from './components/Sidebar';
import AudioPlayerControls from './components/AudioPlayerControls';
import { SavedDocument } from './types';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  const wordGridRef = useRef<WordGridRef>(null);
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
    seekAudio,
    goToPreviousSentence,
    goToNextSentence,
    repeatCurrentSentence,
  } = useAppState();

  // Set initial current sentence for demonstration
  useEffect(() => {
    if (wordList.sentences.length > 0 && !currentSentenceId) {
      setCurrentSentence(wordList.sentences[0].id);
    }
  }, [wordList.sentences, currentSentenceId, setCurrentSentence]);

  // Auto-scroll to current sentence when it changes
  useEffect(() => {
    if (currentSentenceId && wordGridRef.current) {
      // Small delay to ensure the UI has updated
      const timeoutId = setTimeout(() => {
        wordGridRef.current?.scrollToSentence(currentSentenceId);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentSentenceId]);

  // Handle scrolling when sentence position is available
  const handleSentenceScroll = (sentenceId: string, y: number, height: number) => {
    if (scrollViewRef.current) {
      // Get the device's actual dimensions
      const screenHeight = Dimensions.get('window').height;
      const headerHeight = 80; // Header with audio controls
      const footerHeight = 150; // Translation view height
      const availableHeight = screenHeight - headerHeight - footerHeight;
      
      // Center the sentence in the available viewport
      // Add some padding so sentence isn't at the very edge
      const paddingTop = 50;
      const targetY = Math.max(0, y - paddingTop);
      
      scrollViewRef.current.scrollTo({
        y: targetY,
        animated: true,
      });
    }
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  };

  // Show loading screen if content is still loading
  if (wordList.id === 'loading') {
    return (
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#2a2a2a' : '#ffffff'}
          translucent={false}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            Loading ZiPop...
          </Text>
          <Text style={[styles.loadingSubtext, { color: isDarkMode ? '#999999' : '#666666' }]}>
            Connecting to backend at 192.168.1.68:3002
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error screen if content failed to load
  if (wordList.id === 'error' || wordList.id === 'empty') {
    return (
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#2a2a2a' : '#ffffff'}
          translucent={false}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            {wordList.id === 'error' ? '❌ Connection Failed' : '📚 No Content Available'}
          </Text>
          <Text style={[styles.loadingSubtext, { color: isDarkMode ? '#999999' : '#666666' }]}>
            {wordList.id === 'error' 
              ? 'Cannot connect to backend at 192.168.1.68:3002. Please check if the backend is running.'
              : 'No lessons found. Please check the backend database.'
            }
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: isDarkMode ? '#666666' : '#cccccc' }]}
            onPress={() => {
              console.log('🔄 Retrying content load...');
              // Force app to reload by triggering a re-render
              Platform.OS === 'web' 
        ? (global as any).location?.reload?.() 
        : require('react-native').DevSettings?.reload?.();
            }}
          >
            <Text style={[styles.retryButtonText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              🔄 Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            {/* FIXED HEADER WITH AUDIO CONTROLS */}
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
              
              <View style={styles.audioControlsHeader}>
                <AudioPlayerControls
                  isPlaying={audioState.isPlaying}
                  currentTime={audioState.currentTime}
                  duration={audioState.duration}
                  onPlayPause={toggleAudioPlayback}
                  onSeek={seekAudio}
                  onPrevious={goToPreviousSentence}
                  onNext={goToNextSentence}
                  onRepeat={repeatCurrentSentence}
                  formatTime={formatTime}
                  isCompact={true}
                />
              </View>
            </View>

            {/* SCROLLABLE CONTENT */}
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollView}
              showsVerticalScrollIndicator={true}
              bounces={false}
            >
              <WordGrid
                ref={wordGridRef}
                sentences={wordList.sentences}
                selectedWordId={selectedWord?.id}
                selectedSentenceId={selectedSentence?.id}
                currentSentenceId={currentSentenceId}
                onWordPress={selectWord}
                onSentencePress={selectSentence}
                onSentenceLayout={handleSentenceScroll}
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
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
  audioControlsHeader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
