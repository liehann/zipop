import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedDocument } from '../types';

const DOCUMENTS_KEY = 'zipop_saved_documents';
const CURRENT_DOCUMENT_KEY = 'zipop_current_document';

/**
 * Save a document to local storage
 */
export async function saveDocument(document: SavedDocument): Promise<void> {
  try {
    const existingDocuments = await getSavedDocuments();
    
    // Check if document already exists and update it
    const existingIndex = existingDocuments.findIndex(doc => doc.id === document.id);
    
    if (existingIndex >= 0) {
      // Update existing document
      existingDocuments[existingIndex] = {
        ...document,
        dateModified: new Date().toISOString()
      };
    } else {
      // Add new document
      existingDocuments.push(document);
    }
    
    // Sort by date modified (newest first)
    existingDocuments.sort((a, b) => 
      new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
    );
    
    await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(existingDocuments));
  } catch (error) {
    console.error('Failed to save document:', error);
    throw new Error('Failed to save document to storage');
  }
}

/**
 * Get all saved documents from local storage
 */
export async function getSavedDocuments(): Promise<SavedDocument[]> {
  try {
    const documentsJson = await AsyncStorage.getItem(DOCUMENTS_KEY);
    if (!documentsJson) {
      return [];
    }
    
    const documents = JSON.parse(documentsJson) as SavedDocument[];
    
    // Sort by date modified (newest first)
    return documents.sort((a, b) => 
      new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
    );
  } catch (error) {
    console.error('Failed to load documents:', error);
    return [];
  }
}

/**
 * Delete a document from local storage
 */
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    const existingDocuments = await getSavedDocuments();
    const filteredDocuments = existingDocuments.filter(doc => doc.id !== documentId);
    
    await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(filteredDocuments));
  } catch (error) {
    console.error('Failed to delete document:', error);
    throw new Error('Failed to delete document from storage');
  }
}

/**
 * Get a specific document by ID
 */
export async function getDocument(documentId: string): Promise<SavedDocument | null> {
  try {
    const documents = await getSavedDocuments();
    return documents.find(doc => doc.id === documentId) || null;
  } catch (error) {
    console.error('Failed to get document:', error);
    return null;
  }
}

/**
 * Save the currently active document ID
 */
export async function setCurrentDocument(documentId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENT_DOCUMENT_KEY, documentId);
  } catch (error) {
    console.error('Failed to set current document:', error);
  }
}

/**
 * Get the currently active document ID
 */
export async function getCurrentDocumentId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CURRENT_DOCUMENT_KEY);
  } catch (error) {
    console.error('Failed to get current document:', error);
    return null;
  }
}

/**
 * Clear all saved documents (for testing/debugging)
 */
export async function clearAllDocuments(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DOCUMENTS_KEY);
    await AsyncStorage.removeItem(CURRENT_DOCUMENT_KEY);
  } catch (error) {
    console.error('Failed to clear documents:', error);
    throw new Error('Failed to clear documents from storage');
  }
}

/**
 * Export documents as JSON for backup/sharing
 */
export async function exportDocuments(): Promise<string> {
  try {
    const documents = await getSavedDocuments();
    return JSON.stringify(documents, null, 2);
  } catch (error) {
    console.error('Failed to export documents:', error);
    throw new Error('Failed to export documents');
  }
}

/**
 * Import documents from JSON backup
 */
export async function importDocuments(jsonData: string): Promise<number> {
  try {
    const importedDocuments = JSON.parse(jsonData) as SavedDocument[];
    
    if (!Array.isArray(importedDocuments)) {
      throw new Error('Invalid JSON format');
    }
    
    const existingDocuments = await getSavedDocuments();
    
    // Merge imported documents with existing ones, avoiding duplicates
    const allDocuments = [...existingDocuments];
    let importedCount = 0;
    
    for (const doc of importedDocuments) {
      if (!allDocuments.find(existing => existing.id === doc.id)) {
        allDocuments.push(doc);
        importedCount++;
      }
    }
    
    // Sort by date modified (newest first)
    allDocuments.sort((a, b) => 
      new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
    );
    
    await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(allDocuments));
    
    return importedCount;
  } catch (error) {
    console.error('Failed to import documents:', error);
    throw new Error('Failed to import documents');
  }
} 