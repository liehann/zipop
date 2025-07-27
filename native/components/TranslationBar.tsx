import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { TranslationBarProps } from '../types';

const TranslationBar: React.FC<TranslationBarProps> = ({
  state,
  onClose,
  isDarkMode,
}) => {
  if (!state.visible) {
    return null;
  }

  return (
    <SafeAreaView 
      style={[
        styles.safeArea,
        { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }
      ]}
    >
      <View style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
      ]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[
            styles.headerIcon,
            { color: '#D2691E' }
          ]}>
            📖
          </Text>
          <Text style={[
            styles.headerTitle,
            { color: isDarkMode ? '#ffffff' : '#000000' }
          ]}>
            Word Translation
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Chinese and Pinyin */}
          <View style={styles.chinesePinyinRow}>
            <Text style={[
              styles.chineseText,
              { color: isDarkMode ? '#ffffff' : '#000000' }
            ]}>
              {state.content.chinese}
            </Text>
            <Text style={[
              styles.pinyinText,
              { color: isDarkMode ? '#999999' : '#666666' }
            ]}>
              {state.content.pinyin}
            </Text>
          </View>

          {/* English Translation */}
          <Text style={[
            styles.englishText,
            { color: isDarkMode ? '#cccccc' : '#666666' }
          ]}>
            {state.content.english}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    gap: 8,
  },
  chinesePinyinRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  chineseText: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'System',
  },
  pinyinText: {
    fontSize: 18,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  englishText: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 24,
  },
});

export default TranslationBar; 