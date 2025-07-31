/**
 * Data loader for built-in lesson content
 * This file imports all lesson data at build time and provides utilities to access them
 */

import { DataIndex, LessonData, BuiltInLesson, DocumentSource } from './types';
import { SavedDocument, WordListData, Word, Sentence } from '../types';
import { splitIntoWords, getPinyin, getEnglishTranslation, getSentencePinyin } from '../utils/textProcessing';

// Import data index
import dataIndex from './index.json';

// Import all lesson files
import beginnerGreetings from './lessons/beginner-greetings.json';
import restaurantOrdering from './lessons/restaurant-ordering.json';
import shoppingBasics from './lessons/shopping-basics.json';
import timeAndDates from './lessons/time-and-dates.json';
import coffeeAndCake from './lessons/coffee_and_cake.json';

// Lesson data registry
const lessonRegistry: Record<string, LessonData> = {
  'beginner-greetings': beginnerGreetings as LessonData,
  'restaurant-ordering': restaurantOrdering as LessonData,
  'shopping-basics': shoppingBasics as LessonData,
  'time-and-dates': timeAndDates as LessonData,
  'coffee-and-cake': coffeeAndCake as LessonData,
};

/**
 * Get the data index with all lesson metadata
 */
export function getDataIndex(): DataIndex {
  return dataIndex as DataIndex;
}

/**
 * Get all available lessons
 */
export function getAllLessons(): LessonData[] {
  return Object.values(lessonRegistry);
}

/**
 * Get a specific lesson by ID
 */
export function getLessonById(id: string): LessonData | null {
  return lessonRegistry[id] || null;
}

/**
 * Get lessons by category
 */
export function getLessonsByCategory(category: string): LessonData[] {
  return getAllLessons().filter(lesson => lesson.category === category);
}

/**
 * Get lessons by level
 */
export function getLessonsByLevel(level: 'beginner' | 'intermediate' | 'advanced'): LessonData[] {
  return getAllLessons().filter(lesson => lesson.level === level);
}

/**
 * Get featured lessons
 */
export function getFeaturedLessons(): LessonData[] {
  const index = getDataIndex();
  const featuredIds = index.lessons
    .filter(lesson => lesson.featured)
    .sort((a, b) => a.order - b.order)
    .map(lesson => lesson.id);
  
  return featuredIds.map(id => getLessonById(id)).filter(Boolean) as LessonData[];
}

/**
 * Convert a lesson data to a WordListData format using pre-split sentences
 */
export function lessonToWordListData(lesson: LessonData): WordListData {
  // Use the pre-split sentences from the lesson data instead of processing the full text
  const processedSentences = lesson.content.sentences.map((sentencePair, sentenceIndex) => {
    // Process each individual sentence to get words
    const words = splitIntoWords(sentencePair.chinese, lesson.vocabulary);
    const processedWords = words.map((wordText, wordIndex) => ({
      id: `word-${sentenceIndex}-${wordIndex}`,
      hanzi: wordText,
      pinyin: getPinyin(wordText),
      english: getEnglishTranslation(wordText, lesson.vocabulary)
    }));
    
    return {
      id: `sentence-${sentenceIndex}`,
      words: processedWords,
      sentencePinyin: getSentencePinyin(sentencePair.chinese),
      sentenceEnglish: sentencePair.english
    };
  });
  
  return {
    id: lesson.id,
    title: lesson.title,
    sentences: processedSentences,
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString()
  };
}

/**
 * Convert a lesson to a BuiltInLesson format
 */
export function lessonToBuiltInLesson(lesson: LessonData): BuiltInLesson {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    level: lesson.level,
    category: lesson.category,
    estimatedTime: lesson.estimatedTime,
    isBuiltIn: true,
    lessonData: lesson,
  };
}

/**
 * Get all built-in lessons formatted for the document selection UI
 */
export function getBuiltInLessons(): BuiltInLesson[] {
  return getAllLessons()
    .sort((a, b) => {
      const aRef = getDataIndex().lessons.find(l => l.id === a.id);
      const bRef = getDataIndex().lessons.find(l => l.id === b.id);
      return (aRef?.order || 999) - (bRef?.order || 999);
    })
    .map(lessonToBuiltInLesson);
}

/**
 * Create a unified document source from a built-in lesson
 */
export function createDocumentSourceFromLesson(lesson: LessonData): DocumentSource {
  return {
    type: 'builtin',
    document: lessonToBuiltInLesson(lesson),
  };
}

/**
 * Search lessons by title or description
 */
export function searchLessons(query: string): LessonData[] {
  const lowerQuery = query.toLowerCase();
  return getAllLessons().filter(lesson =>
    lesson.title.toLowerCase().includes(lowerQuery) ||
    lesson.description.toLowerCase().includes(lowerQuery) ||
    lesson.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get lesson categories with lesson counts
 */
export function getCategoriesWithCounts(): Array<{ category: string; name: string; count: number }> {
  const index = getDataIndex();
  const lessons = getAllLessons();
  
  return index.categories.map(category => ({
    category: category.id,
    name: category.name,
    count: lessons.filter(lesson => lesson.category === category.id).length,
  }));
}

/**
 * Get lesson levels with lesson counts
 */
export function getLevelsWithCounts(): Array<{ level: string; name: string; count: number }> {
  const index = getDataIndex();
  const lessons = getAllLessons();
  
  return index.levels.map(level => ({
    level: level.id,
    name: level.name,
    count: lessons.filter(lesson => lesson.level === level.id).length,
  }));
} 