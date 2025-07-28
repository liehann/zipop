import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Word, Sentence } from '../types';

interface WordGridProps {
  sentences: Sentence[];
  selectedWordId?: string;
  currentSentenceId?: string | null;
  onWordPress: (word: Word) => void;
  onSentencePress: (sentence: Sentence) => void;
}

const WordGrid: React.FC<WordGridProps> = ({
  sentences,
  selectedWordId,
  currentSentenceId,
  onWordPress,
  onSentencePress,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const renderWord = (word: Word) => {
    const isSelected = selectedWordId === word.id;
    
    return (
      <TouchableOpacity
        key={word.id}
        style={[
          styles.wordContainer,
          isSelected && styles.selectedWordContainer,
          {
            backgroundColor: isSelected
              ? (isDarkMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 215, 0, 0.15)') // Golden glow
              : 'transparent', // Transparent to inherit sentence background
            borderColor: isSelected 
              ? '#FFD700' 
              : 'transparent', // Transparent border when unselected
            borderWidth: 1 // Consistent border width to maintain stable height
          }
        ]}
        onPress={() => onWordPress(word)}
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
  };

  const renderSentence = (sentence: Sentence) => {
    const isCurrentSentence = currentSentenceId === sentence.id;
    
    return (
      <View key={sentence.id} style={styles.sentenceContainer}>
        <TouchableOpacity
          style={[
            styles.sentenceContent,
            {
              backgroundColor: isCurrentSentence 
                ? (isDarkMode ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)')
                : 'transparent'
            }
          ]}
          onPress={() => onSentencePress(sentence)}
          activeOpacity={0.7}
        >
          {/* Vertical bar indicator for current sentence */}
          <View style={[
            styles.sentenceIndicator,
            {
              backgroundColor: isCurrentSentence 
                ? (isDarkMode ? '#007AFF' : '#007AFF')
                : 'transparent'
            }
          ]} />
          
          {/* Words container */}
          <View style={styles.wordsContainer}>
            {sentence.words.map(renderWord)}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#2a2a2a' : '#fafafa' } // Light background closer to white
    ]}>
      {sentences.map(renderSentence)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    // Background color now set dynamically in component
  },
  sentenceContainer: {
    marginBottom: 0, // Reduced from 16 to 8 for tighter vertical spacing
  },
  sentenceContent: {
    flexDirection: 'row',
    borderRadius: 3,
    padding: 0,
  },
  sentenceIndicator: {
    width: 4,
    borderRadius: 3,
    marginRight: 12,
    minHeight: 50, // Reduced from 60
  },
  wordsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0, // Reduced from 12
    alignItems: 'flex-start',
  },
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6, // Increased from 3 for better spacing with multi-char words
    borderRadius: 3, // Reduced from 8
    minWidth: 30, // Reduced from 40 to allow more flexible sizing
    minHeight: 40, // Reduced from 60
    // borderWidth and borderColor now set dynamically
    // Allow dynamic width based on content
    paddingHorizontal: 8, // More horizontal padding for multi-character words
  },
  selectedWordContainer: {
    // Border color now handled dynamically in component
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinyinText: {
    fontSize: 14, // Reduced from 18 to accommodate multi-character words
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 1, // Reduced from 2
    flexShrink: 1, // Allow text to shrink if needed
  },
  hanziText: {
    fontSize: 16, // Reduced from 18 to accommodate multi-character words
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
    flexShrink: 1, // Allow text to shrink if needed
  },
});

export default WordGrid; 