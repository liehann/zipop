import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Word, Sentence } from '../types';

interface TranslationViewProps {
  selectedWord: Word | null;
  selectedSentence: Sentence | null;
  vocabulary: Array<{ chinese: string; english: string }>;
  onSentenceSelect: (sentence: Sentence) => void;
}

const TranslationView: React.FC<TranslationViewProps> = ({ 
  selectedWord, 
  selectedSentence, 
  vocabulary,
  onSentenceSelect 
}) => {
  const isDarkMode = useColorScheme() === 'dark';


  // Helper function to get sentence translation from individual words
  const getSentenceTranslation = (sentence: Sentence) => {
    const hanzi = sentence.words.map(word => word.hanzi).join('');
    const pinyin = sentence.sentencePinyin || sentence.words.map(word => word.pinyin).join(' ');
    const english = sentence.sentenceEnglish || sentence.words.map(word => word.english).join(' ');
    
    return { hanzi, pinyin, english };
  };

  // Helper function to get character breakdown for any word
  const getCharacterBreakdown = (word: Word) => {
    const chars = Array.from(word.hanzi);
    const pinyinParts = word.pinyin.split(' ');
    
    return chars.map((char, index) => {
      // Look up individual character translation from vocabulary
      const charVocab = vocabulary.find(v => v.chinese === char);
      const charTranslation = charVocab ? charVocab.english : char;
      
      return {
        chinese: char,
        pinyin: pinyinParts[index] || word.pinyin,
        english: charTranslation,
      };
    });
  };

  const handleSentencePress = () => {
    if (selectedSentence) {
      onSentenceSelect(selectedSentence);
    }
  };



  if (!selectedWord && !selectedSentence) {
    return (
      <View style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
      ]}>
        <Text style={[
          styles.placeholderText,
          { color: isDarkMode ? '#666666' : '#999999' }
        ]}>
          Tap a word or sentence to see its translation
        </Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
    ]}>
      {selectedSentence ? (
        // Show sentence translation
        <View style={styles.translationContent}>
          <View style={styles.sentenceHeader}>
            <TouchableOpacity onPress={handleSentencePress} activeOpacity={0.7} style={styles.sentenceTextContainer}>
              <View>
                {/* English first and largest */}
                <Text style={[
                  styles.englishTextLarge,
                  { color: isDarkMode ? '#ffffff' : '#000000' }
                ]}>
                  {getSentenceTranslation(selectedSentence).english}
                </Text>
                
                <View style={styles.translationDetails}>
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
              </View>
            </TouchableOpacity>

          </View>
        </View>
      ) : selectedWord ? (
        // Show word translation with character breakdown
        <View style={styles.translationContent}>
          {/* English first and largest */}
          <Text style={[
            styles.englishTextLarge,
            { color: isDarkMode ? '#ffffff' : '#000000' }
          ]}>
            {selectedWord.english}
          </Text>

          {/* Character breakdown for all words (single and multi-character) */}
          <View style={styles.characterBreakdown}>
            {getCharacterBreakdown(selectedWord).map((char, index) => (
              <View key={index} style={styles.breakdownLine}>
                <Text style={[
                  styles.hanziText,
                  { color: isDarkMode ? '#ffffff' : '#000000' }
                ]}>
                  {char.chinese}
                </Text>
                <Text style={styles.breakdownSeparator}> - </Text>
                <Text style={[
                  styles.pinyinText,
                  { color: isDarkMode ? '#81b0ff' : '#007AFF' }
                ]}>
                  {char.pinyin}
                </Text>
                <Text style={styles.breakdownSeparator}> - </Text>
                <Text style={[
                  styles.breakdownEnglish,
                  { color: isDarkMode ? '#cccccc' : '#555555' }
                ]}>
                  {char.english}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'center',
  },
  translationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  sentenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sentenceTextContainer: {
    flex: 1,
    marginRight: 15,
  },

  englishTextLarge: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 28,
  },
  translationDetails: {
    gap: 4,
  },
  hanziText: {
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 32,
  },
  pinyinText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  characterBreakdown: {
    marginTop: 12,
    gap: 6,
  },
  breakdownLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  breakdownSeparator: {
    color: '#666666',
    fontSize: 14,
  },
  breakdownEnglish: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TranslationView; 