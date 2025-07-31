/**
 * Tests for Content Persistence Feature
 * @format
 */

import { appState, AppState } from '../domain/AppState';
import { setCurrentDocument, getCurrentDocumentId, saveDocument, clearAllDocuments } from '../utils/storage';
import { SavedDocument } from '../types';

// Mock the storage utilities for testing
jest.mock('../utils/storage');
jest.mock('../services/contentService');
jest.mock('../utils/audioManager');
jest.mock('../utils/audioUtils');

const mockedSetCurrentDocument = setCurrentDocument as jest.MockedFunction<typeof setCurrentDocument>;
const mockedGetCurrentDocumentId = getCurrentDocumentId as jest.MockedFunction<typeof getCurrentDocumentId>;
const mockedSaveDocument = saveDocument as jest.MockedFunction<typeof saveDocument>;
const mockedClearAllDocuments = clearAllDocuments as jest.MockedFunction<typeof clearAllDocuments>;

// Mock content service
const mockContentService = {
  getContentById: jest.fn(),
  getFeaturedContent: jest.fn(),
  contentToWordListData: jest.fn()
};

jest.mock('../services/contentService', () => ({
  default: mockContentService
}));

describe('Content Persistence', () => {
  let testAppState: AppState;

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Clear storage
    await mockedClearAllDocuments();
    
    // Create fresh app state instance for each test
    testAppState = new AppState();
    
    // Wait a bit for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    await mockedClearAllDocuments();
  });

  describe('Initial Load Behavior', () => {
    test('should load default content when no previous document exists', async () => {
      // Mock no previous document
      mockedGetCurrentDocumentId.mockResolvedValue(null);
      
      // Mock backend content
      const mockBackendContent = {
        id: 'beginner-greetings',
        title: 'Beginner Greetings',
        content: { sentences: [] },
        metadata: {},
        audio: null
      };
      mockContentService.getContentById.mockResolvedValue(mockBackendContent);
      mockContentService.contentToWordListData.mockReturnValue({
        id: 'beginner-greetings',
        title: 'Beginner Greetings',
        sentences: [],
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
      });

      // Create new instance to trigger loadDefaultContent
      const newAppState = new AppState();
      
      // Wait for async loading
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify that getCurrentDocumentId was called
      expect(mockedGetCurrentDocumentId).toHaveBeenCalled();
      
      // Verify that backend content was attempted to be loaded
      expect(mockContentService.getContentById).toHaveBeenCalledWith('beginner-greetings');
    });

    test('should restore previous document when it exists in storage', async () => {
      const mockDocumentId = 'test-document-123';
      const mockSavedDocument: SavedDocument = {
        id: mockDocumentId,
        title: 'Test Document',
        wordListData: {
          id: mockDocumentId,
          title: 'Test Document',
          sentences: [{
            id: 'sentence-1',
            words: [{
              id: 'word-1',
              hanzi: '你好',
              pinyin: 'nǐ hǎo',
              english: 'hello'
            }]
          }],
          dateCreated: new Date().toISOString(),
          dateModified: new Date().toISOString()
        },
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        audio: null,
        lessonData: null
      };

      // Mock previous document exists
      mockedGetCurrentDocumentId.mockResolvedValue(mockDocumentId);
      
      // Mock the getDocument function to return our test document
      const { getDocument } = await import('../utils/storage');
      const mockedGetDocument = getDocument as jest.MockedFunction<typeof getDocument>;
      mockedGetDocument.mockResolvedValue(mockSavedDocument);

      // Create new instance to trigger loadDefaultContent
      const newAppState = new AppState();
      
      // Wait for async loading
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify that getCurrentDocumentId was called
      expect(mockedGetCurrentDocumentId).toHaveBeenCalled();
      
      // Verify that the document was loaded
      expect(mockedGetDocument).toHaveBeenCalledWith(mockDocumentId);
      
      // Verify that the word list was set to the restored document
      const wordList = newAppState.getWordList();
      expect(wordList.id).toBe(mockDocumentId);
      expect(wordList.title).toBe('Test Document');
    });

    test('should fall back to default content when previous document cannot be loaded', async () => {
      const mockDocumentId = 'nonexistent-document';
      
      // Mock previous document exists but cannot be loaded
      mockedGetCurrentDocumentId.mockResolvedValue(mockDocumentId);
      
      // Mock the getDocument function to return null (document not found)
      const { getDocument } = await import('../utils/storage');
      const mockedGetDocument = getDocument as jest.MockedFunction<typeof getDocument>;
      mockedGetDocument.mockResolvedValue(null);
      
      // Mock contentService to return null for the document ID
      mockContentService.getContentById.mockResolvedValue(null);
      
      // Mock featured content fallback
      const mockFeaturedContent = [{
        id: 'featured-lesson',
        title: 'Featured Lesson',
        content: { sentences: [] },
        metadata: {},
        audio: null
      }];
      mockContentService.getFeaturedContent.mockResolvedValue(mockFeaturedContent);
      mockContentService.contentToWordListData.mockReturnValue({
        id: 'featured-lesson',
        title: 'Featured Lesson',
        sentences: [],
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
      });

      // Create new instance to trigger loadDefaultContent
      const newAppState = new AppState();
      
      // Wait for async loading
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify that getCurrentDocumentId was called
      expect(mockedGetCurrentDocumentId).toHaveBeenCalled();
      
      // Verify that getDocument was called but failed
      expect(mockedGetDocument).toHaveBeenCalledWith(mockDocumentId);
      
      // Verify that backend content was attempted
      expect(mockContentService.getContentById).toHaveBeenCalledWith(mockDocumentId);
      
      // Verify that featured content was loaded as fallback
      expect(mockContentService.getFeaturedContent).toHaveBeenCalled();
    });
  });

  describe('Document Loading and Persistence', () => {
    test('should save current document ID when loading a document', async () => {
      const mockDocument: SavedDocument = {
        id: 'test-document',
        title: 'Test Document',
        wordListData: {
          id: 'test-document',
          title: 'Test Document',
          sentences: [],
          dateCreated: new Date().toISOString(),
          dateModified: new Date().toISOString()
        },
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        audio: null,
        lessonData: null
      };

      // Load the document
      await testAppState.loadDocument(mockDocument);
      
      // Verify that setCurrentDocument was called with the correct ID
      expect(mockedSetCurrentDocument).toHaveBeenCalledWith('test-document');
      
      // Verify that the word list was updated
      const wordList = testAppState.getWordList();
      expect(wordList.id).toBe('test-document');
      expect(wordList.title).toBe('Test Document');
    });

    test('should save and load a custom document', async () => {
      const mockDocument: SavedDocument = {
        id: 'custom-document',
        title: 'My Custom Lesson',
        wordListData: {
          id: 'custom-document',
          title: 'My Custom Lesson',
          sentences: [{
            id: 'sentence-1',
            words: [{
              id: 'word-1',
              hanzi: '早上好',
              pinyin: 'zǎo shàng hǎo',
              english: 'good morning'
            }]
          }],
          dateCreated: new Date().toISOString(),
          dateModified: new Date().toISOString()
        },
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        audio: null,
        lessonData: null
      };

      // Save the document (this should also load it)
      await testAppState.saveCurrentDocument(mockDocument);
      
      // Verify that saveDocument was called
      expect(mockedSaveDocument).toHaveBeenCalledWith(mockDocument);
      
      // Verify that setCurrentDocument was called
      expect(mockedSetCurrentDocument).toHaveBeenCalledWith('custom-document');
      
      // Verify that the word list was updated
      const wordList = testAppState.getWordList();
      expect(wordList.id).toBe('custom-document');
      expect(wordList.title).toBe('My Custom Lesson');
    });
  });
});