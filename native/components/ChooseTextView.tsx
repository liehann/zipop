import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SavedDocument } from '../types';
import { getSavedDocuments, deleteDocument } from '../utils/storage';

interface ChooseTextViewProps {
  onSelectDocument: (document: SavedDocument) => void;
  onCancel: () => void;
  onAddNew: () => void;
}

const ChooseTextView: React.FC<ChooseTextViewProps> = ({ 
  onSelectDocument, 
  onCancel, 
  onAddNew 
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDocuments = async () => {
    try {
      const savedDocs = await getSavedDocuments();
      setDocuments(savedDocs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load saved documents.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDocuments();
  };

  const handleDeleteDocument = (doc: SavedDocument) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(doc.id);
              setDocuments(prevDocs => prevDocs.filter(d => d.id !== doc.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPreviewText = (doc: SavedDocument) => {
    const firstSentence = doc.wordListData.sentences[0];
    if (!firstSentence) return '';
    
    const previewLength = 20;
    const hanziText = firstSentence.words.map(w => w.hanzi).join('');
    
    if (hanziText.length <= previewLength) {
      return hanziText;
    }
    
    return hanziText.substring(0, previewLength) + '...';
  };

  if (isLoading) {
    return (
      <View style={[
        styles.container,
        styles.centered,
        { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }
      ]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#ffffff' : '#000000'} />
        <Text style={[
          styles.loadingText,
          { color: isDarkMode ? '#ffffff' : '#000000' }
        ]}>
          Loading documents...
        </Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }
    ]}>
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
          Choose Text
        </Text>
        
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' }
          ]}
          onPress={onAddNew}
        >
          <Text style={styles.addButtonText}>
            Add New
          </Text>
        </TouchableOpacity>
      </View>

      {/* Document List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDarkMode ? '#ffffff' : '#000000'}
          />
        }
      >
        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[
              styles.emptyStateTitle,
              { color: isDarkMode ? '#ffffff' : '#000000' }
            ]}>
              No Saved Documents
            </Text>
            <Text style={[
              styles.emptyStateText,
              { color: isDarkMode ? '#999999' : '#666666' }
            ]}>
              Tap "Add New" to create your first Chinese text document.
            </Text>
          </View>
        ) : (
          documents.map((doc) => (
            <View key={doc.id} style={[
              styles.documentCard,
              { 
                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                borderColor: isDarkMode ? '#404040' : '#e0e0e0'
              }
            ]}>
              <TouchableOpacity
                style={styles.documentContent}
                onPress={() => onSelectDocument(doc)}
              >
                <Text style={[
                  styles.documentTitle,
                  { color: isDarkMode ? '#ffffff' : '#000000' }
                ]}>
                  {doc.title}
                </Text>
                
                <Text style={[
                  styles.documentPreview,
                  { color: isDarkMode ? '#cccccc' : '#555555' }
                ]}>
                  {getPreviewText(doc)}
                </Text>
                
                <View style={styles.documentMeta}>
                  <Text style={[
                    styles.documentMetaText,
                    { color: isDarkMode ? '#999999' : '#999999' }
                  ]}>
                    {doc.wordListData.sentences.length} sentences
                  </Text>
                  <Text style={[
                    styles.documentMetaText,
                    { color: isDarkMode ? '#999999' : '#999999' }
                  ]}>
                    Modified: {formatDate(doc.dateModified)}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteDocument(doc)}
              >
                <Text style={[
                  styles.deleteButtonText,
                  { color: isDarkMode ? '#ff6b6b' : '#dc3545' }
                ]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  documentCard: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  documentContent: {
    padding: 16,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  documentPreview: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  documentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  documentMetaText: {
    fontSize: 12,
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 107, 107, 0.2)',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ChooseTextView; 