import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { TranslationCardProps } from '../types';

const TranslationCard: React.FC<TranslationCardProps> = ({ visible, data, onClose, isDarkMode }) => {
  if (!visible || !data) return null;

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth * 0.8;
  const cardHeight = 180;
  
  // Calculate position to keep card on screen
  const left = Math.min(Math.max(data.position.x - cardWidth / 2, 10), screenWidth - cardWidth - 10);
  const top = Math.max(data.position.y - cardHeight - 10, 60);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.translationCardOverlay} onPress={onClose}>
        <View
          style={[
            styles.translationCard,
            {
              left,
              top,
              width: cardWidth,
              height: cardHeight,
              backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
              borderColor: isDarkMode ? '#444444' : '#e0e0e0',
            },
          ]}
        >
          <View style={styles.translationCardHeader}>
            <Text style={[styles.translationCardTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              "{data.word}"
            </Text>
            <TouchableOpacity style={styles.translationCardClose} onPress={onClose}>
              <Text style={[styles.translationCardCloseText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                ×
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.translationCardContent}>
            <View style={styles.translationCardRow}>
              <Text style={[styles.translationCardLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                Chinese:
              </Text>
              <Text style={[styles.translationCardText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                {data.translation.chinese}
              </Text>
            </View>
            
            <View style={styles.translationCardRow}>
              <Text style={[styles.translationCardLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                Pinyin:
              </Text>
              <Text style={[styles.translationCardText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                {data.translation.pinyin}
              </Text>
            </View>
            
            <View style={styles.translationCardRow}>
              <Text style={[styles.translationCardLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                English:
              </Text>
              <Text style={[styles.translationCardText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                {data.translation.english}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Translation Card styles
  translationCardOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  translationCard: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  translationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  translationCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  translationCardClose: {
    padding: 5,
  },
  translationCardCloseText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  translationCardContent: {
    padding: 15,
  },
  translationCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  translationCardLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  translationCardText: {
    fontSize: 16,
    fontWeight: '400',
  },
});

export default TranslationCard; 