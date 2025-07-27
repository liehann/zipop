/**
 * ZiPop - Chinese Reader App
 * Simple word-based Chinese reader with fixed header and footer
 */

import React, { useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

// Import hooks and components
import { useAppState } from './hooks/useAppState';
import WordGrid from './components/WordGrid';
import TranslationView from './components/TranslationView';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Use the domain layer through the custom hook
  const {
    wordList,
    audioState,
    selectedWord,
    selectWord,
    formatTime,
  } = useAppState();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#2a2a2a' : '#ffffff'}
        translucent={false}
      />
      
      {/* FIXED HEADER */}
      <View style={[
        styles.header,
        { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
      ]}>
        <Text style={[
          styles.headerTitle,
          { color: isDarkMode ? '#ffffff' : '#000000' }
        ]}>
          中文阅读器
        </Text>
        <Text style={[
          styles.audioStatus,
          { color: isDarkMode ? '#999999' : '#666666' }
        ]}>
          {audioState.isPlaying ? '▶︎' : '⏸'} {formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}
        </Text>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={true}
        bounces={false}
      >
        <WordGrid
          words={wordList.words}
          selectedWordId={selectedWord?.id}
          onWordPress={selectWord}
        />
      </ScrollView>

      {/* FOOTER */}
      <TranslationView selectedWord={selectedWord} />
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  audioStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flexGrow: 1,
  },
});

export default App;
