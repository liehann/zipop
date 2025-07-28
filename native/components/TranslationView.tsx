import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Word, Sentence } from '../types';

interface TranslationViewProps {
  selectedWord: Word | null;
  selectedSentence: Sentence | null;
  onClose?: () => void;
  onSentenceSelect?: (sentence: Sentence) => void;
}

const TranslationView: React.FC<TranslationViewProps> = ({
  selectedWord,
  selectedSentence,
  onClose,
  onSentenceSelect,
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

  // Helper function to break down a word into individual characters
  const getCharacterBreakdown = (word: Word) => {
    const characters = word.hanzi.split('');
    const pinyinParts = word.pinyin.split(' ');
    
    return characters.map((char, index) => ({
      chinese: char,
      pinyin: pinyinParts[index] || '',
      english: getCharacterTranslation(char)
    }));
  };

  // Simple character translation lookup
  const getCharacterTranslation = (char: string): string => {
    const charDict: Record<string, string> = {
      '你': 'you',
      '好': 'good/well',
      '吗': '(question particle)',
      '我': 'I/me',
      '很': 'very',
      '谢': 'thank',
      '对': 'correct',
      '不': 'not',
      '起': 'rise/up',
      '再': 'again',
      '见': 'see/meet',
      '他': 'he/him',
      '她': 'she/her',
      '是': 'is/to be',
      '老': 'old',
      '师': 'teacher',
      '学': 'study',
      '生': 'student',
      '中': 'middle/China',
      '国': 'country',
      '人': 'person',
      '什': 'what',
      '么': '(particle)',
      '名': 'name',
      '字': 'character/word',
      '叫': 'call',
      '客': 'guest',
      '气': 'manner/air',
      '高': 'high',
      '兴': 'interest',
      '认': 'recognize',
      '识': 'know',
      '明': 'bright'
    };
    return charDict[char] || char;
  };

  const handleSentencePress = () => {
    if (selectedSentence && onSentenceSelect) {
      onSentenceSelect(selectedSentence);
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
    ]}>
      {selectedSentence ? (
        // Show sentence translation
        <TouchableOpacity onPress={handleSentencePress} activeOpacity={0.7}>
          <View style={styles.translationContent}>
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
  translationContent: {
    // Content container
  },
  englishTextLarge: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 12,
  },
  translationDetails: {
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
  characterBreakdown: {
    marginTop: 12,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  breakdownText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  breakdownLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  breakdownSeparator: {
    fontSize: 14,
    fontWeight: '400',
    marginHorizontal: 4,
  },
  breakdownEnglish: {
    fontSize: 14,
    fontWeight: '400',
  },
});

export default TranslationView; 