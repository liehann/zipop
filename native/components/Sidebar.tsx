import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  useColorScheme,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onChooseText: () => void;
  onAddText: () => void;
  onCopyChinese: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  visible,
  onClose,
  onChooseText,
  onAddText,
  onCopyChinese,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const handleCopyChinese = () => {
    onCopyChinese();
    onClose(); // Close sidebar after copying
  };

  const handleChooseText = () => {
    onChooseText();
    onClose(); // Close sidebar after navigation
  };

  const handleAddText = () => {
    onAddText();
    onClose(); // Close sidebar after navigation
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[
          styles.sidebar,
          { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }
        ]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={[
              styles.closeButtonText,
              { color: isDarkMode ? '#ffffff' : '#000000' }
            ]}>
              ✕
            </Text>
          </TouchableOpacity>

          <View style={styles.menuItems}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleChooseText}
            >
              <Text style={[
                styles.menuItemText,
                { color: isDarkMode ? '#ffffff' : '#000000' }
              ]}>
                📚 Choose Text
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleAddText}
            >
              <Text style={[
                styles.menuItemText,
                { color: isDarkMode ? '#ffffff' : '#000000' }
              ]}>
                ➕ Add Text
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleCopyChinese}
            >
              <Text style={[
                styles.menuItemText,
                { color: isDarkMode ? '#ffffff' : '#000000' }
              ]}>
                📋 Copy Chinese
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  sidebar: {
    width: 280,
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 20,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default Sidebar; 