/**
 * ZiPop - Multilanguage Reading App
 * Displays Chinese, Pinyin, and English text
 */

import React, { useState } from 'react';
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

interface Settings {
  showChinese: boolean;
  showPinyin: boolean;
  showEnglish: boolean;
}

// Sample documents
const sampleDocuments: Document[] = [
  {
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
  },
  {
    id: 'doc2',
    title: {
      chinese: '在餐厅',
      pinyin: 'zài cān tīng',
      english: 'At the Restaurant'
    },
    sections: [
      {
        id: 'section3',
        title: {
          chinese: '点菜',
          pinyin: 'diǎn cài',
          english: 'Ordering Food'
        },
        lines: [
          {
            id: 'line7',
            translation: {
              chinese: '菜单在哪里？',
              pinyin: 'cài dān zài nǎ lǐ?',
              english: 'Where is the menu?'
            }
          },
          {
            id: 'line8',
            translation: {
              chinese: '我想要一份米饭',
              pinyin: 'wǒ xiǎng yào yī fèn mǐ fàn',
              english: 'I want a bowl of rice'
            }
          },
          {
            id: 'line9',
            translation: {
              chinese: '多少钱？',
              pinyin: 'duō shǎo qián?',
              english: 'How much does it cost?'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'doc3',
    title: {
      chinese: '购物',
      pinyin: 'gòu wù',
      english: 'Shopping'
    },
    sections: [
      {
        id: 'section4',
        title: {
          chinese: '买衣服',
          pinyin: 'mǎi yī fú',
          english: 'Buying Clothes'
        },
        lines: [
          {
            id: 'line10',
            translation: {
              chinese: '这件衣服多少钱？',
              pinyin: 'zhè jiàn yī fú duō shǎo qián?',
              english: 'How much is this piece of clothing?'
            }
          },
          {
            id: 'line11',
            translation: {
              chinese: '有没有小号的？',
              pinyin: 'yǒu méi yǒu xiǎo hào de?',
              english: 'Do you have a small size?'
            }
          },
          {
            id: 'line12',
            translation: {
              chinese: '我可以试穿吗？',
              pinyin: 'wǒ kě yǐ shì chuān ma?',
              english: 'Can I try it on?'
            }
          }
        ]
      }
    ]
  }
];

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentDocument, setCurrentDocument] = useState<Document>(sampleDocuments[0]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
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

  const renderTranslation = (translation: Translation) => (
    <View style={styles.translationContainer}>
      {settings.showChinese && (
        <Text style={[styles.chineseText, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
          {translation.chinese}
        </Text>
      )}
      {settings.showPinyin && (
        <Text style={[styles.pinyinText, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
          {translation.pinyin}
        </Text>
      )}
      {settings.showEnglish && (
        <Text style={[styles.englishText, {color: isDarkMode ? '#888888' : '#777777'}]}>
          {translation.english}
        </Text>
      )}
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
        backgroundColor={backgroundStyle.backgroundColor}
      />
      
      {/* Header with Menu Button */}
      <View style={[styles.header, {backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f8f8'}]}>
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
});

export default App;
