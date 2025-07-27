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
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import types and data
import {
  WordListData,
  Word,
  AudioState,
  TranslationState,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
} from './types';
import { sampleWordList } from './sampleData';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  let insets;
  
  try {
    insets = useSafeAreaInsets();
  } catch (error) {
    // Fallback if safe area context is not available
    insets = { top: 0, bottom: 0, left: 0, right: 0 };
  }
  
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

  // Render individual word
  const renderWord = useCallback((word: Word) => {
    const isSelected = translationState.selectedWord?.id === word.id;
    
    return (
      <TouchableOpacity
        key={word.id}
        style={[
          styles.wordContainer,
          isSelected && styles.selectedWordContainer,
          {
            backgroundColor: isSelected
              ? (isDarkMode ? 'rgba(255, 206, 84, 0.2)' : 'rgba(255, 206, 84, 0.15)')
              : 'transparent'
          }
        ]}
        onPress={() => handleWordTap(word)}
      >
        {/* Pinyin on top */}
        <Text style={[
          styles.pinyinText,
          { color: isDarkMode ? '#999999' : '#666666' }
        ]}>
          {word.pinyin}
        </Text>
        
        {/* Hanzi on bottom */}
        <Text style={[
          styles.hanziText,
          { color: isDarkMode ? '#ffffff' : '#000000' }
        ]}>
          {word.hanzi}
        </Text>
      </TouchableOpacity>
    );
  }, [handleWordTap, translationState.selectedWord, isDarkMode]);

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
      
      {/* Parent View with flex: 1 and flexDirection: 'column' */}
      <View style={styles.parentContainer}>
        
        {/* FIXED HEADER - View with fixed height, not in ScrollView */}
        <View style={[
          styles.header,
          { 
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            height: HEADER_HEIGHT 
          }
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

        {/* SCROLLABLE CONTENT - ScrollView with flex: 1 */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: FOOTER_HEIGHT + insets.bottom }
          ]}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.wordsGrid}>
            {wordList.words.map(renderWord)}
          </View>
        </ScrollView>
        
      </View>

      {/* FIXED FOOTER - Absolute positioned at bottom */}
      <View style={[
        styles.footer,
        { 
          backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
          height: FOOTER_HEIGHT,
          paddingBottom: insets.bottom,
          bottom: 0,
        }
      ]}>
        <View style={styles.footerContent}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  parentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
    minHeight: 80,
    marginBottom: 16,
  },
  selectedWordContainer: {
    borderWidth: 2,
    borderColor: '#D2691E',
  },
  pinyinText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 4,
  },
  hanziText: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    zIndex: 10,
    elevation: 10,
  },
  footerContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  translationContent: {
    flex: 1,
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
