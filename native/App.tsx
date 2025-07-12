/**
 * ZiPop - Multilanguage Reading App
 * Displays Chinese, Pinyin, and English text
 */

import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Modal,
  useColorScheme,
  Platform,
  Pressable,
} from 'react-native';

// Import types and data
import {
  Translation,
  Line,
  Section,
  Document,
  Settings,
  TranslationCardData,
} from './types';
import { sampleDocuments } from './sampleData';
import TranslationCard from './components/TranslationCard';





function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentDocument, setCurrentDocument] = useState<Document>(sampleDocuments[0]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [translationCard, setTranslationCard] = useState<TranslationCardData | null>(null);
  const [isTranslationCardVisible, setIsTranslationCardVisible] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    showChinese: true,
    showPinyin: true,
    showEnglish: true,
  });

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  };

  const menuBackgroundStyle = {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
  };

  // Handle word long press
  const handleWordLongPress = useCallback((event: any, word: string, translation: Translation, language: 'chinese' | 'pinyin' | 'english') => {
    const { pageX, pageY } = event.nativeEvent;
    setTranslationCard({
      word,
      translation,
      position: { x: pageX, y: pageY },
      language,
    });
    setIsTranslationCardVisible(true);
  }, []);

  // Close translation card
  const closeTranslationCard = useCallback(() => {
    setIsTranslationCardVisible(false);
    setTranslationCard(null);
  }, []);

  // Handle gutter button press
  const handleGutterPress = useCallback((translation: Translation) => {
    setTranslationCard({
      word: 'Full Sentence',
      translation,
      position: { x: 100, y: 200 },
      language: 'chinese',
    });
    setIsTranslationCardVisible(true);
  }, []);

  // Render individual words with long press functionality
  const renderTextWithLongPress = useCallback((text: string, translation: Translation, language: 'chinese' | 'pinyin' | 'english', textStyle: any) => {
    let words: string[];
    
    if (language === 'chinese') {
      // For Chinese, split by character
      words = text.split('');
    } else {
      // For English and Pinyin, split by space
      words = text.split(' ');
    }
    
    return (
      <Text style={textStyle}>
        {words.map((word, index) => (
          <Text key={index}>
            <Pressable
              onLongPress={(event) => handleWordLongPress(event, word, translation, language)}
              delayLongPress={500}
            >
              <Text style={textStyle}>{word}</Text>
            </Pressable>
            {index < words.length - 1 && (language === 'chinese' ? '' : ' ')}
          </Text>
        ))}
      </Text>
    );
  }, [handleWordLongPress]);

  const renderTranslation = (translation: Translation) => (
    <View style={styles.lineContentContainer}>
      {/* Gutter Button */}
      <TouchableOpacity
        style={styles.gutterButton}
        onPress={() => handleGutterPress(translation)}
      >
        <Text style={[styles.gutterButtonText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
          ⓘ
        </Text>
      </TouchableOpacity>

      {/* Translation Content */}
      <View style={styles.translationContainer}>
        {settings.showChinese && (
          <View style={styles.languageRow}>
            {renderTextWithLongPress(
              translation.chinese,
              translation,
              'chinese',
              [styles.languageText, { color: isDarkMode ? '#ffffff' : '#000000' }]
            )}
          </View>
        )}
        {settings.showPinyin && (
          <View style={styles.languageRow}>
            {renderTextWithLongPress(
              translation.pinyin,
              translation,
              'pinyin',
              [styles.languageText, { color: isDarkMode ? '#ffffff' : '#000000' }, styles.pinyinStyle]
            )}
          </View>
        )}
        {settings.showEnglish && (
          <View style={styles.languageRow}>
            {renderTextWithLongPress(
              translation.english,
              translation,
              'english',
              [styles.languageText, { color: isDarkMode ? '#ffffff' : '#000000' }]
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderDocumentTitle = (title: Translation) => (
    <View style={styles.documentTitleContainer}>
      {settings.showChinese && (
        <Text style={[styles.documentTitle, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
          {title.chinese}
        </Text>
      )}
      {settings.showPinyin && (
        <Text style={[styles.documentTitlePinyin, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
          {title.pinyin}
        </Text>
      )}
      {settings.showEnglish && (
        <Text style={[styles.documentTitleEnglish, {color: isDarkMode ? '#888888' : '#777777'}]}>
          {title.english}
        </Text>
      )}
    </View>
  );

  const renderSectionTitle = (title: Translation) => (
    <View style={styles.sectionTitleContainer}>
      {settings.showChinese && (
        <Text style={[styles.sectionTitle, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
          {title.chinese}
        </Text>
      )}
      {settings.showPinyin && (
        <Text style={[styles.sectionTitlePinyin, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
          {title.pinyin}
        </Text>
      )}
      {settings.showEnglish && (
        <Text style={[styles.sectionTitleEnglish, {color: isDarkMode ? '#888888' : '#777777'}]}>
          {title.english}
        </Text>
      )}
    </View>
  );

  const toggleSetting = (key: keyof Settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectDocument = (document: Document) => {
    setCurrentDocument(document);
    setIsMenuVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#2a2a2a' : '#f8f8f8'}
        translucent={false}
      />
      
      {/* Header with Menu Button */}
      <View style={[
        styles.header, 
        {backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f8f8'},
        Platform.OS === 'android' && {
          paddingTop: (StatusBar.currentHeight || 0) + 12,
        }
      ]}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsMenuVisible(true)}
        >
          <Text style={[styles.menuButtonText, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
            ☰
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
          ZiPop
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Document Title (H1) */}
          {renderDocumentTitle(currentDocument.title)}

          {/* Sections */}
          {currentDocument.sections.map((section) => (
            <View key={section.id} style={styles.sectionContainer}>
              {/* Section Title (H2) */}
              {renderSectionTitle(section.title)}

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

      {/* Settings Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.menuContainer, menuBackgroundStyle]}>
            <ScrollView style={styles.menuContent}>
              {/* Menu Header */}
              <View style={styles.menuHeader}>
                <Text style={[styles.menuTitle, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
                  Settings
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsMenuVisible(false)}
                >
                  <Text style={[styles.closeButtonText, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Document Selection */}
              <View style={styles.menuSection}>
                <Text style={[styles.sectionLabel, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
                  Select Document
                </Text>
                {sampleDocuments.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    style={[
                      styles.documentOption,
                      currentDocument.id === doc.id && styles.selectedDocument,
                      {backgroundColor: isDarkMode ? '#333333' : '#ffffff'}
                    ]}
                    onPress={() => selectDocument(doc)}
                  >
                    <Text style={[styles.documentOptionText, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
                      {doc.title.chinese}
                    </Text>
                    <Text style={[styles.documentOptionSubtext, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
                      {doc.title.english}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Language Display Options */}
              <View style={styles.menuSection}>
                <Text style={[styles.sectionLabel, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
                  Display Languages
                </Text>
                
                <View style={styles.toggleRow}>
                  <Text style={[styles.toggleLabel, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
                    Chinese Characters
                  </Text>
                  <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={settings.showChinese ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => toggleSetting('showChinese')}
                    value={settings.showChinese}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={[styles.toggleLabel, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
                    Pinyin
                  </Text>
                  <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={settings.showPinyin ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => toggleSetting('showPinyin')}
                    value={settings.showPinyin}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={[styles.toggleLabel, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
                    English
                  </Text>
                  <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={settings.showEnglish ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => toggleSetting('showEnglish')}
                    value={settings.showEnglish}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Translation Card */}
      <TranslationCard
        visible={isTranslationCardVisible}
        data={translationCard}
        onClose={closeTranslationCard}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Main content styles
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
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'System',
  },
  documentTitlePinyin: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'System',
    fontStyle: 'italic',
  },
  documentTitleEnglish: {
    fontSize: 26,
    fontWeight: 'bold',
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'System',
  },
  sectionTitlePinyin: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'System',
    fontStyle: 'italic',
  },
  sectionTitleEnglish: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
  },
  
  // Line (Paragraph) styles
  lineContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 6,
  },
  
  // Translation styles
  translationContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  // Modal and Menu styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  menuSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // Document selection styles
  documentOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedDocument: {
    borderColor: '#81b0ff',
    borderWidth: 2,
  },
  documentOptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentOptionSubtext: {
    fontSize: 14,
  },
  
  // Toggle switches styles
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },


  pinyinStyle: {
    fontStyle: 'italic',
  },

  // New styles for line content container
  lineContentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gutterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gutterButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Language text styles with equal weight
  languageRow: {
    marginBottom: 4,
  },
  languageText: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
    fontFamily: 'System',
  },
});

export default App;
