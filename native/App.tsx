/**
 * ZiPop - Multilanguage Reading App
 * Displays Chinese, Pinyin, and English text
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

// Data structure interfaces
interface Translation {
  chinese: string;
  pinyin: string;
  english: string;
}

interface Line {
  id: string;
  translation: Translation;
}

interface Section {
  id: string;
  title: Translation;
  lines: Line[];
}

interface Document {
  id: string;
  title: Translation;
  sections: Section[];
}

// Sample data
const sampleDocument: Document = {
  id: 'doc1',
  title: {
    chinese: '我的第一课',
    pinyin: 'wǒ de dì yī kè',
    english: 'My First Lesson'
  },
  sections: [
    {
      id: 'section1',
      title: {
        chinese: '问候语',
        pinyin: 'wèn hòu yǔ',
        english: 'Greetings'
      },
      lines: [
        {
          id: 'line1',
          translation: {
            chinese: '你好',
            pinyin: 'nǐ hǎo',
            english: 'Hello'
          }
        },
        {
          id: 'line2',
          translation: {
            chinese: '你好吗？',
            pinyin: 'nǐ hǎo ma?',
            english: 'How are you?'
          }
        },
        {
          id: 'line3',
          translation: {
            chinese: '我很好',
            pinyin: 'wǒ hěn hǎo',
            english: 'I am fine'
          }
        }
      ]
    },
    {
      id: 'section2',
      title: {
        chinese: '自我介绍',
        pinyin: 'zì wǒ jiè shào',
        english: 'Self Introduction'
      },
      lines: [
        {
          id: 'line4',
          translation: {
            chinese: '我叫李华',
            pinyin: 'wǒ jiào lǐ huá',
            english: 'My name is Li Hua'
          }
        },
        {
          id: 'line5',
          translation: {
            chinese: '我是学生',
            pinyin: 'wǒ shì xué shēng',
            english: 'I am a student'
          }
        },
        {
          id: 'line6',
          translation: {
            chinese: '很高兴认识你',
            pinyin: 'hěn gāo xìng rèn shi nǐ',
            english: 'Nice to meet you'
          }
        }
      ]
    }
  ]
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  };

  const renderTranslation = (translation: Translation) => (
    <View style={styles.translationContainer}>
      <Text style={[styles.chineseText, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
        {translation.chinese}
      </Text>
      <Text style={[styles.pinyinText, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
        {translation.pinyin}
      </Text>
      <Text style={[styles.englishText, {color: isDarkMode ? '#888888' : '#777777'}]}>
        {translation.english}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Document Title (H1) */}
          <View style={styles.documentTitleContainer}>
            <Text style={[styles.documentTitle, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
              {sampleDocument.title.chinese}
            </Text>
            <Text style={[styles.documentTitlePinyin, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
              {sampleDocument.title.pinyin}
            </Text>
            <Text style={[styles.documentTitleEnglish, {color: isDarkMode ? '#888888' : '#777777'}]}>
              {sampleDocument.title.english}
            </Text>
          </View>

          {/* Sections */}
          {sampleDocument.sections.map((section) => (
            <View key={section.id} style={styles.sectionContainer}>
              {/* Section Title (H2) */}
              <View style={styles.sectionTitleContainer}>
                <Text style={[styles.sectionTitle, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
                  {section.title.chinese}
                </Text>
                <Text style={[styles.sectionTitlePinyin, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
                  {section.title.pinyin}
                </Text>
                <Text style={[styles.sectionTitleEnglish, {color: isDarkMode ? '#888888' : '#777777'}]}>
                  {section.title.english}
                </Text>
              </View>

              {/* Lines (Paragraphs) */}
              {section.lines.map((line) => (
                <View key={line.id} style={styles.lineContainer}>
                  {renderTranslation(line.translation)}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Document Title (H1) styles
  documentTitleContainer: {
    marginBottom: 32,
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  documentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'System',
  },
  documentTitlePinyin: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'System',
  },
  documentTitleEnglish: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: 'System',
  },
  
  // Section styles
  sectionContainer: {
    marginBottom: 24,
  },
  
  // Section Title (H2) styles
  sectionTitleContainer: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d0d0',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'System',
  },
  sectionTitlePinyin: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
    fontFamily: 'System',
  },
  sectionTitleEnglish: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'System',
  },
  
  // Line (Paragraph) styles
  lineContainer: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 6,
  },
  
  // Translation styles
  translationContainer: {
    alignItems: 'flex-start',
  },
  chineseText: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 2,
    fontFamily: 'System',
  },
  pinyinText: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
    fontFamily: 'System',
    fontStyle: 'italic',
  },
  englishText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'System',
  },
});

export default App;
