import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  useColorScheme,
  Animated,
  Easing,
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
  const slideAnim = useRef(new Animated.Value(-280)).current; // Start off-screen
  const opacityAnim = useRef(new Animated.Value(0)).current; // Start transparent
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      // Show modal first, then animate in
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 50,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 50,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      // Animate out first, then hide modal
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -280,
          duration: 50,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 50,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Hide modal after animation completes
        setModalVisible(false);
      });
    }
  }, [visible, modalVisible, slideAnim, opacityAnim]);

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
      visible={modalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[
          styles.sidebar,
          {
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            transform: [{ translateX: slideAnim }],
          }
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
        </Animated.View>
        
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  overlayTouchable: {
    flex: 1,
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