import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Word } from '../types';

interface TranslationViewProps {
  selectedWord: Word | null;
  onClose?: () => void;
}

const TranslationView: React.FC<TranslationViewProps> = ({
  selectedWord,
  onClose,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

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
      
      {selectedWord ? (
        <View style={styles.translationContent}>
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
          Tap a word to see its translation
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