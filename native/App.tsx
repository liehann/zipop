/**
 * ZiPop - Chinese Reader App
 * Audio-synchronized Chinese text reader with word-level translations
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Pressable,
} from 'react-native';

// Import types and data
import {
  ChineseText,
  Sentence,
  Word,
  AudioState,
  TranslationBarState,
  Settings,
} from './types';
import { sampleChineseText } from './sampleData';
import AudioPlayer from './components/AudioPlayer';
import TranslationBar from './components/TranslationBar';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  
  // App state
  const [currentText] = useState<ChineseText>(sampleChineseText);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 2, // Show 0:02 like in the design
    duration: 100, // Estimated duration in seconds
    playbackSpeed: 1.0,
    currentSentenceId: null,
  });
  
  const [translationBarState, setTranslationBarState] = useState<TranslationBarState>({
    type: 'word',
    content: { chinese: '中国的', pinyin: 'Zhōngguó de', english: "China's" },
    visible: true, // Show by default like in the design
  });
  
  const [settings] = useState<Settings>({
    playbackSpeed: 1.0,
    autoScroll: true,
    fontSize: 20,
  });

  // Audio control handlers
  const handlePlay = useCallback(() => {
    setAudioState(prev => ({ ...prev, isPlaying: true }));
    // TODO: Implement actual TTS audio playback
  }, []);

  const handlePause = useCallback(() => {
    setAudioState(prev => ({ ...prev, isPlaying: false }));
    // TODO: Pause actual audio
  }, []);

  const handleSeek = useCallback((time: number) => {
    setAudioState(prev => ({ ...prev, currentTime: time }));
    // TODO: Seek audio to specific time
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setAudioState(prev => ({ ...prev, playbackSpeed: speed }));
    // TODO: Change actual audio playback speed
  }, []);

  // Text interaction handlers
  const handleSentencePress = useCallback((sentence: Sentence) => {
    const combinedChinese = sentence.words.map(w => w.chinese).join('');
    const combinedPinyin = sentence.words.map(w => w.pinyin).join(' ');
    const combinedEnglish = sentence.words.map(w => w.english).join(' ');
    
    setTranslationBarState({
      type: 'sentence',
      content: {
        chinese: combinedChinese,
        pinyin: combinedPinyin,
        english: combinedEnglish,
      },
      visible: true,
    });
  }, []);

  const handleWordPress = useCallback((word: Word) => {
    setTranslationBarState({
      type: 'word',
      content: {
        chinese: word.chinese,
        pinyin: word.pinyin,
        english: word.english,
      },
      visible: true,
    });
  }, []);

  const handleCharacterPress = useCallback((character: string, word: Word) => {
    setTranslationBarState({
      type: 'character',
      content: {
        chinese: character,
        pinyin: word.pinyin, // Use the word's pinyin for context
        english: word.english, // Use the word's English for context
      },
      visible: true,
    });
  }, []);

  const handleCloseTranslationBar = useCallback(() => {
    setTranslationBarState(prev => ({ ...prev, visible: false }));
  }, []);

  // Header action handlers
  const handleNewText = useCallback(() => {
    // TODO: Implement new text functionality
    console.log('New Text pressed');
  }, []);

  const handleLibrary = useCallback(() => {
    // TODO: Implement library functionality
    console.log('Library pressed');
  }, []);

  // Simulate audio progress for demo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (audioState.isPlaying) {
      interval = setInterval(() => {
        setAudioState(prev => {
          const newTime = prev.currentTime + 0.1;
          
          // Find current sentence based on time
          const currentSentence = currentText.sentences.find(
            sentence => sentence.startTime !== undefined && sentence.endTime !== undefined &&
                       newTime >= sentence.startTime && newTime < sentence.endTime
          );
          
          const newCurrentSentenceId = currentSentence ? currentSentence.id : null;
          
          return {
            ...prev,
            currentTime: newTime < prev.duration ? newTime : prev.duration,
            currentSentenceId: newCurrentSentenceId,
          };
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [audioState.isPlaying, currentText.sentences]);

  // Render individual word with Chinese and Pinyin stacked
  const renderWord = useCallback((word: Word, wordIndex: number) => {
    return (
      <Pressable
        key={wordIndex}
        onPress={() => handleWordPress(word)}
        style={styles.wordContainer}
      >
        <View style={styles.wordContent}>
          {/* Pinyin on top */}
          <Text style={[
            styles.pinyinText,
            { 
              color: isDarkMode ? '#999999' : '#666666',
              fontSize: settings.fontSize * 0.6
            }
          ]}>
            {word.pinyin}
          </Text>
          
          {/* Chinese characters below */}
          <Text style={[
            styles.chineseText,
            { 
              color: isDarkMode ? '#ffffff' : '#000000',
              fontSize: settings.fontSize
            }
          ]}>
            {word.chinese}
          </Text>
        </View>
      </Pressable>
    );
  }, [handleWordPress, isDarkMode, settings.fontSize]);

  // Render individual sentence
  const renderSentence = useCallback((sentence: Sentence, sentenceIndex: number) => {
    const isCurrentSentence = audioState.currentSentenceId === sentence.id;
    
    return (
      <View
        key={sentence.id}
        style={[
          styles.sentenceContainer,
          isCurrentSentence && styles.currentSentenceContainer,
          { backgroundColor: isCurrentSentence 
            ? (isDarkMode ? 'rgba(255, 206, 84, 0.1)' : 'rgba(255, 206, 84, 0.1)')
            : 'transparent'
          }
        ]}
      >
        <View style={styles.sentenceContent}>
          {sentence.words.map((word, wordIndex) => renderWord(word, wordIndex))}
        </View>
      </View>
    );
  }, [audioState.currentSentenceId, renderWord, isDarkMode]);

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
      
      {/* Header */}
      <View style={[
        styles.header,
        { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
      ]}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Text style={styles.headerIcon}>📖</Text>
          </View>
          <Text style={[
            styles.headerTitle,
            { color: isDarkMode ? '#ffffff' : '#000000' }
          ]}>
            中文阅读器
          </Text>
          <Text style={[
            styles.headerSubtitle,
            { color: isDarkMode ? '#999999' : '#666666' }
          ]}>
            Chinese Reader
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleNewText}
          >
            <Text style={[
              styles.headerButtonText,
              { color: isDarkMode ? '#ffffff' : '#000000' }
            ]}>
              + New Text
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleLibrary}
          >
            <Text style={[
              styles.headerButtonText,
              { color: isDarkMode ? '#ffffff' : '#000000' }
            ]}>
              📚 Library
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Audio Player */}
      <AudioPlayer
        audioState={audioState}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
        onSpeedChange={handleSpeedChange}
        isDarkMode={isDarkMode}
      />

      {/* Scrollable Text Content */}
      <ScrollView
        ref={scrollViewRef}
        contentInsetAdjustmentBehavior="automatic"
        style={[styles.textScrollView, backgroundStyle]}
        contentContainerStyle={styles.textContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.textContainer}>
          {/* Sentences */}
          {currentText.sentences.map((sentence, index) => 
            renderSentence(sentence, index)
          )}
        </View>
        
        {/* Bottom padding to ensure content doesn't get hidden behind translation bar */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Translation Bar at Bottom */}
      <TranslationBar
        state={translationBarState}
        onClose={handleCloseTranslationBar}
        isDarkMode={isDarkMode}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D2691E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  textScrollView: {
    flex: 1,
  },
  textContent: {
    flexGrow: 1,
  },
  textContainer: {
    padding: 24,
  },
  sentenceContainer: {
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
  },
  currentSentenceContainer: {
    backgroundColor: 'rgba(255, 206, 84, 0.15)',
  },
  sentenceContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 16,
  },
  wordContainer: {
    marginBottom: 8,
  },
  wordContent: {
    alignItems: 'center',
    minWidth: 24,
  },
  pinyinText: {
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16,
  },
  chineseText: {
    fontWeight: '500',
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 28,
  },
});

export default App;
