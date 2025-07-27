import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Word } from '../types';

interface WordGridProps {
  words: Word[];
  selectedWordId?: string;
  onWordPress: (word: Word) => void;
}

const WordGrid: React.FC<WordGridProps> = ({
  words,
  selectedWordId,
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
              ? (isDarkMode ? 'rgba(255, 206, 84, 0.2)' : 'rgba(255, 206, 84, 0.15)')
              : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)')
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

  return (
    <View style={styles.wordsGrid}>
      {words.map(renderWord)}
    </View>
  );
};

const styles = StyleSheet.create({
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
    padding: 16,
  },
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
    minHeight: 80,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectedWordContainer: {
    borderWidth: 2,
    borderColor: '#D2691E',
  },
  pinyinText: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 4,
  },
  hanziText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
});

export default WordGrid; 