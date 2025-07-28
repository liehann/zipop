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
import { getBuiltInLessons, lessonToWordListData } from '../data/dataLoader';
import { BuiltInLesson } from '../data/types';

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
  const [builtInLessons, setBuiltInLessons] = useState<BuiltInLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDocuments = async () => {
    try {
      const savedDocs = await getSavedDocuments();
      setDocuments(savedDocs);
      
      // Load built-in lessons
      const lessons = getBuiltInLessons();
      setBuiltInLessons(lessons);
    } catch (error) {
      Alert.alert('Error', 'Failed to load documents.');
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

  const handleSelectBuiltInLesson = (lesson: BuiltInLesson) => {
    // Convert the lesson to a SavedDocument format for the app
    const wordListData = lessonToWordListData(lesson.lessonData);
    const document: SavedDocument = {
      id: lesson.id,
      title: lesson.title,
      originalText: lesson.lessonData.content.chinese,
      wordListData,
      dateCreated: lesson.lessonData.metadata.dateCreated,
      dateModified: lesson.lessonData.metadata.dateModified,
    };
    
    onSelectDocument(document);
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

  const getLessonPreviewText = (lesson: BuiltInLesson) => {
    const previewLength = 25;
    const chineseText = lesson.lessonData.content.chinese;
    
    if (chineseText.length <= previewLength) {
      return chineseText;
    }
    
    return chineseText.substring(0, previewLength) + '...';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return isDarkMode ? '#4CAF50' : '#2E7D32';
      case 'intermediate':
        return isDarkMode ? '#FF9800' : '#F57C00';
      case 'advanced':
        return isDarkMode ? '#F44336' : '#C62828';
      default:
        return isDarkMode ? '#9E9E9E' : '#616161';
    }
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

      {/* Content */}
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
        {/* Built-in Lessons Section */}
        {builtInLessons.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[
                styles.sectionTitle,
                { color: isDarkMode ? '#ffffff' : '#000000' }
              ]}>
                📚 Featured Lessons
              </Text>
              <Text style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? '#cccccc' : '#666666' }
              ]}>
                Curated content for learning Chinese
              </Text>
            </View>

            {builtInLessons.map((lesson) => (
              <View key={lesson.id} style={[
                styles.lessonCard,
                { 
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                  borderColor: isDarkMode ? '#404040' : '#e0e0e0',
                  borderLeftColor: getLevelColor(lesson.level),
                }
              ]}>
                <TouchableOpacity
                  style={styles.documentContent}
                  onPress={() => handleSelectBuiltInLesson(lesson)}
                >
                  <View style={styles.lessonHeader}>
                    <Text style={[
                      styles.documentTitle,
                      { color: isDarkMode ? '#ffffff' : '#000000' }
                    ]}>
                      {lesson.title}
                    </Text>
                    <View style={[
                      styles.levelBadge,
                      { backgroundColor: getLevelColor(lesson.level) }
                    ]}>
                      <Text style={styles.levelBadgeText}>
                        {lesson.level.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[
                    styles.lessonDescription,
                    { color: isDarkMode ? '#cccccc' : '#666666' }
                  ]}>
                    {lesson.description}
                  </Text>
                  
                  <Text style={[
                    styles.documentPreview,
                    { color: isDarkMode ? '#cccccc' : '#555555' }
                  ]}>
                    {getLessonPreviewText(lesson)}
                  </Text>
                  
                  <View style={styles.documentMeta}>
                    <Text style={[
                      styles.documentMetaText,
                      { color: isDarkMode ? '#999999' : '#999999' }
                    ]}>
                      📖 {lesson.lessonData.content.sentences.length} sentences
                    </Text>
                    <Text style={[
                      styles.documentMetaText,
                      { color: isDarkMode ? '#999999' : '#999999' }
                    ]}>
                      ⏱️ ~{lesson.estimatedTime} min
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Divider between sections */}
        {builtInLessons.length > 0 && documents.length > 0 && (
          <View style={styles.divider} />
        )}

        {/* Saved Documents Section */}
        {documents.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[
                styles.sectionTitle,
                { color: isDarkMode ? '#ffffff' : '#000000' }
              ]}>
                📄 My Documents
              </Text>
              <Text style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? '#cccccc' : '#666666' }
              ]}>
                Your saved Chinese texts
              </Text>
            </View>

            {documents.map((doc) => (
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
            ))}
          </>
        )}

        {/* Empty state */}
        {documents.length === 0 && builtInLessons.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[
              styles.emptyStateTitle,
              { color: isDarkMode ? '#ffffff' : '#000000' }
            ]}>
              No Content Available
            </Text>
            <Text style={[
              styles.emptyStateText,
              { color: isDarkMode ? '#999999' : '#666666' }
            ]}>
              Tap "Add New" to create your first Chinese text document.
            </Text>
          </View>
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
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
  lessonCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
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
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  levelBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  lessonDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
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
});

export default ChooseTextView; 