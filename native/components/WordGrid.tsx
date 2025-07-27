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
}

const WordGrid: React.FC<WordGridProps> = ({
  sentences,
  selectedWordId,
  currentSentenceId,
  onWordPress,
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
              : 'transparent'
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
        <View style={[
          styles.sentenceContent,
          {
            backgroundColor: isCurrentSentence 
              ? (isDarkMode ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)')
              : 'transparent'
          }
        ]}>
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
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {sentences.map(renderSentence)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sentenceContainer: {
    marginBottom: 24,
  },
  sentenceContent: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
  },
  sentenceIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 16,
    minHeight: 60, // Ensures consistent spacing
  },
  wordsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-start',
  },
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 60,
    minHeight: 60,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectedWordContainer: {
    borderWidth: 2,
    borderColor: '#FFD700', // Golden border for selected word
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
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 2,
  },
  hanziText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
});

export default WordGrid; 