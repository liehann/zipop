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

// Import types and data
import {
  WordListData,
  Word,
  AudioState,
  TranslationState,
} from './types';
import { sampleWordList } from './sampleData';

const sampleText = Array(25).fill(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
);


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
    <SafeAreaView style={[styles.container]}>
       <View style={styles.header}>
        <Text>Header</Text>
      </View>
     <ScrollView contentContainerStyle={styles.scrollView} bounces={false}>
        {sampleText.map((text) => {
          return (
            <View style={styles.paragraph}>
              <Text>{text}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <Text>Footer</Text>
      </View>      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  audioStatus: {
    fontSize: 14,
    fontWeight: '500',
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
  scrollView: {
    flexGrow: 1,
    borderColor: 'red',
    borderWidth: 2,
    paddingBottom: 100,
  },
  paragraph: {
    padding: 10,
  },
  header: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'green',
    borderWidth: 2,    
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'blue',
    borderWidth: 2,
  },
});

export default App;
