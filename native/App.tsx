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

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.content}>
          <Text style={[styles.title, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
            ZiPop
          </Text>
          <Text style={[styles.subtitle, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
            Multilanguage Reading App
          </Text>
          
          <View style={styles.languageContainer}>
            <View style={styles.languageBlock}>
              <Text style={[styles.languageLabel, {color: isDarkMode ? '#888888' : '#999999'}]}>
                Simplified Chinese
              </Text>
              <Text style={[styles.chineseText, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
                你好
              </Text>
            </View>
            
            <View style={styles.languageBlock}>
              <Text style={[styles.languageLabel, {color: isDarkMode ? '#888888' : '#999999'}]}>
                Pinyin
              </Text>
              <Text style={[styles.pinyinText, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
                nǐ hǎo
              </Text>
            </View>
            
            <View style={styles.languageBlock}>
              <Text style={[styles.languageLabel, {color: isDarkMode ? '#888888' : '#999999'}]}>
                English
              </Text>
              <Text style={[styles.englishText, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
                Hello
              </Text>
            </View>
          </View>
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
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 48,
  },
  languageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  languageBlock: {
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chineseText: {
    fontSize: 48,
    fontWeight: '400',
    textAlign: 'center',
    // Use system font that supports Chinese characters
    fontFamily: 'System',
  },
  pinyinText: {
    fontSize: 32,
    fontWeight: '400',
    textAlign: 'center',
    // Use system font that supports tone marks
    fontFamily: 'System',
  },
  englishText: {
    fontSize: 32,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default App;
