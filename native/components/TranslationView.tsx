import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Word, Sentence } from '../types';

interface TranslationViewProps {
  selectedWord: Word | null;
  selectedSentence: Sentence | null;
  onClose?: () => void;
}

const TranslationView: React.FC<TranslationViewProps> = ({
  selectedWord,
  selectedSentence,
  onClose,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  // Helper function to combine sentence words into full translations
  const getSentenceTranslation = (sentence: Sentence) => {
    const pinyinText = sentence.sentencePinyin || sentence.words.map(word => word.pinyin).join(' ');
    const hanziText = sentence.words.map(word => word.hanzi).join('');
    const englishText = sentence.sentenceEnglish || sentence.words.map(word => word.english).join(' ');
    
    return {
      pinyin: pinyinText,
      hanzi: hanziText,
      english: englishText,
    };
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
    ]}>
      <Text style={[
        styles.label,
        { color: isDarkMode ? '#999999' : '#666666' }
      ]}>
        Translation
      </Text>
      
      {selectedSentence ? (
        // Show sentence translation
        <View style={styles.translationContent}>
          <Text style={[
            styles.typeLabel,
            { color: isDarkMode ? '#81b0ff' : '#007AFF' }
          ]}>
            Sentence
          </Text>
          <View style={styles.translationHeader}>
            <Text style={[
              styles.hanziText,
              { color: isDarkMode ? '#ffffff' : '#000000' }
            ]}>
              {getSentenceTranslation(selectedSentence).hanzi}
            </Text>
            <Text style={[
              styles.pinyinText,
              { color: isDarkMode ? '#81b0ff' : '#007AFF' }
            ]}>
              {getSentenceTranslation(selectedSentence).pinyin}
            </Text>
          </View>
          <Text style={[
            styles.englishText,
            { color: isDarkMode ? '#cccccc' : '#666666' }
          ]}>
            {getSentenceTranslation(selectedSentence).english}
          </Text>
        </View>
      ) : selectedWord ? (
        // Show word translation
        <View style={styles.translationContent}>
          <Text style={[
            styles.typeLabel,
            { color: isDarkMode ? '#ffd700' : '#b8860b' }
          ]}>
            Word
          </Text>
          <View style={styles.translationHeader}>
            <Text style={[
              styles.hanziText,
              { color: isDarkMode ? '#ffffff' : '#000000' }
            ]}>
              {selectedWord.hanzi}
            </Text>
            <Text style={[
              styles.pinyinText,
              { color: isDarkMode ? '#81b0ff' : '#007AFF' }
            ]}>
              {selectedWord.pinyin}
            </Text>
          </View>
          <Text style={[
            styles.englishText,
            { color: isDarkMode ? '#cccccc' : '#666666' }
          ]}>
            {selectedWord.english}
          </Text>
        </View>
      ) : (
        <Text style={[
          styles.placeholderText,
          { color: isDarkMode ? '#666666' : '#999999' }
        ]}>
          Tap a word or sentence to see its translation
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  translationContent: {
    // Content container
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  translationHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    gap: 12,
  },
  hanziText: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'System',
  },
  pinyinText: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  englishText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  placeholderText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TranslationView; 