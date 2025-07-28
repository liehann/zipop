/**
 * Type definitions for the lesson data system
 */

export interface VocabularyItem {
  chinese: string;
  english: string;
}

export interface SentencePair {
  chinese: string;
  english: string;
}

export interface LessonContent {
  chinese: string; // Full Chinese text for processing
  sentences: SentencePair[];
}

export interface LessonMetadata {
  dateCreated: string;
  dateModified: string;
  author: string;
  version: string;
}

export interface LessonData {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  estimatedTime: number; // in minutes
  content: LessonContent;
  vocabulary: VocabularyItem[];
  metadata: LessonMetadata;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Level {
  id: string;
  name: string;
  description: string;
}

export interface LessonReference {
  id: string;
  file: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  estimatedTime: number;
  featured: boolean;
  order: number;
}

export interface DataIndex {
  version: string;
  lastUpdated: string;
  totalLessons: number;
  categories: Category[];
  levels: Level[];
  lessons: LessonReference[];
}

// Built-in lesson document type (extends SavedDocument structure)
export interface BuiltInLesson {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  estimatedTime: number;
  isBuiltIn: true;
  lessonData: LessonData;
}

// Extended document type that can be either saved or built-in
export interface DocumentSource {
  type: 'saved' | 'builtin';
  document: any; // SavedDocument or BuiltInLesson
} 