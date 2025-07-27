import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SavedDocument } from '../types';
import { createSavedDocument, generateTitle } from '../utils/textProcessing';

interface AddTextViewProps {
  onSave: (document: SavedDocument) => void;
  onCancel: () => void;
}

const AddTextView: React.FC<AddTextViewProps> = ({ onSave, onCancel }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [title, setTitle] = useState('');
  const [chineseText, setChineseText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!chineseText.trim()) {
      Alert.alert('Error', 'Please enter some Chinese text to process.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Generate title if not provided
      const finalTitle = title.trim() || generateTitle(chineseText);
      
      // Process the text
      const document = createSavedDocument(chineseText.trim(), finalTitle);
      
      // Save the document
      onSave(document);
      
      Alert.alert(
        'Success',
        `Document "${finalTitle}" has been created and saved!`,
        [{ text: 'OK', onPress: () => {} }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process the text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextChange = (text: string) => {
    setChineseText(text);
    
    // Auto-generate title if user hasn't set one
    if (!title.trim() && text.trim()) {
      const autoTitle = generateTitle(text);
      setTitle(autoTitle);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[
        styles.header,
        { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
      ]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={[
            styles.cancelButtonText,
            { color: isDarkMode ? '#ff6b6b' : '#dc3545' }
          ]}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <Text style={[
          styles.headerTitle,
          { color: isDarkMode ? '#ffffff' : '#000000' }
        ]}>
          Add Chinese Text
        </Text>
        
        <TouchableOpacity
          style={[
            styles.processButton,
            { 
              backgroundColor: isProcessing 
                ? (isDarkMode ? '#4a4a4a' : '#cccccc')
                : (isDarkMode ? '#007AFF' : '#007AFF'),
              opacity: isProcessing ? 0.6 : 1
            }
          ]}
          onPress={handleProcess}
          disabled={isProcessing}
        >
          <Text style={styles.processButtonText}>
            {isProcessing ? 'Processing...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text style={[
            styles.label,
            { color: isDarkMode ? '#cccccc' : '#333333' }
          ]}>
            Title (optional)
          </Text>
          <TextInput
            style={[
              styles.titleInput,
              {
                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
                borderColor: isDarkMode ? '#404040' : '#e0e0e0'
              }
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title for this text..."
            placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
            maxLength={50}
          />
        </View>

        {/* Chinese Text Input */}
        <View style={styles.inputSection}>
          <Text style={[
            styles.label,
            { color: isDarkMode ? '#cccccc' : '#333333' }
          ]}>
            Chinese Text
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
                borderColor: isDarkMode ? '#404040' : '#e0e0e0'
              }
            ]}
            value={chineseText}
            onChangeText={handleTextChange}
            placeholder="Paste or type Chinese text here...&#10;&#10;The app will automatically:&#10;• Split text into sentences&#10;• Generate pinyin for each character&#10;• Provide English translations"
            placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
          />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={[
            styles.instructionsTitle,
            { color: isDarkMode ? '#81b0ff' : '#007AFF' }
          ]}>
            How it works:
          </Text>
          <Text style={[
            styles.instructionsText,
            { color: isDarkMode ? '#999999' : '#666666' }
          ]}>
            • Paste any Chinese text into the text area above{'\n'}
            • The app will split it into sentences and individual characters{'\n'}
            • Pinyin and English translations will be generated automatically{'\n'}
            • You can then read the text with interactive word translations
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  processButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  processButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 200,
    maxHeight: 300,
  },
  instructionsSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AddTextView; 