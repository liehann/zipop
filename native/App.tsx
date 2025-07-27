/**
 * ZiPop - Chinese Reader App
 * Simple word-based Chinese reader with fixed header and footer
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

// Import types and data
import {
  WordListData,
  Word,
  AudioState,
  TranslationState,
} from './types';
import { sampleWordList } from './sampleData';
import WordGrid from './components/WordGrid';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  
  // App state
  const [wordList] = useState<WordListData>(sampleWordList);
  const [audioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 5, // 00:05
    duration: 116, // 01:56
  });
  
  const [translationState, setTranslationState] = useState<TranslationState>({
    selectedWord: null,
  });

  // Format time for display
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle word tap
  const handleWordTap = useCallback((word: Word) => {
    setTranslationState({ selectedWord: word });
  }, []);

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
          selectedWordId={translationState.selectedWord?.id}
          onWordPress={handleWordTap}
        />
      </ScrollView>

      {/* FOOTER */}
      <View style={[
        styles.footer,
        { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
      ]}>
        <Text style={[
          styles.footerLabel,
          { color: isDarkMode ? '#999999' : '#666666' }
        ]}>
          Translation
        </Text>
        
        {translationState.selectedWord ? (
          <View style={styles.translationContent}>
            <View style={styles.translationHeader}>
              <Text style={[
                styles.translationHanzi,
                { color: isDarkMode ? '#ffffff' : '#000000' }
              ]}>
                {translationState.selectedWord.hanzi}
              </Text>
              <Text style={[
                styles.translationPinyin,
                { color: isDarkMode ? '#81b0ff' : '#007AFF' }
              ]}>
                {translationState.selectedWord.pinyin}
              </Text>
            </View>
            <Text style={[
              styles.translationEnglish,
              { color: isDarkMode ? '#cccccc' : '#666666' }
            ]}>
              {translationState.selectedWord.english}
            </Text>
          </View>
        ) : (
          <Text style={[
            styles.noTranslationText,
            { color: isDarkMode ? '#666666' : '#999999' }
          ]}>
            Tap a word to see its translation
          </Text>
        )}
      </View>
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  translationContent: {
    // Content styling
  },
  translationHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    gap: 12,
  },
  translationHanzi: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'System',
  },
  translationPinyin: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  translationEnglish: {
    fontSize: 16,
    fontWeight: '400',
  },
  noTranslationText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default App;
