#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File paths for coffee and cake lesson
const TIMINGS_FILE = path.join(__dirname, '../native/data/lessons/coffee_and_cake-alignment.json');
const LESSON_FILE = path.join(__dirname, '../native/data/lessons/coffee_and_cake.json');
const BACKUP_FILE = path.join(__dirname, '../native/data/lessons/coffee_and_cake.json.backup');

/**
 * Map words from forced alignment to sentences in the lesson
 * @param {Array} characters - Array of character timing objects from API
 * @param {Array} sentences - Array of sentence objects from lesson
 * @param {string} fullText - The complete Chinese text from the lesson
 * @returns {Array} Updated sentences with word-level timings
 */
function mapWordsToSentences(characters, sentences, fullText) {
  const updatedSentences = [];
  let charIndex = 0;
  let textPosition = 0;
  
  console.log('Full text:', fullText);
  console.log('Processing', characters.length, 'characters');
  
  for (let sentenceIdx = 0; sentenceIdx < sentences.length; sentenceIdx++) {
    const sentence = sentences[sentenceIdx];
    const chineseText = sentence.chinese;
    const sentenceWords = [];
    let sentenceStart = null;
    let sentenceEnd = null;
    
    console.log(`Processing sentence ${sentenceIdx + 1}: "${chineseText}"`);
    
    // Process each character in the current sentence
    for (let charPos = 0; charPos < chineseText.length; charPos++) {
      const expectedChar = chineseText[charPos];
      
      // Find the corresponding character in the timings
      if (charIndex < characters.length) {
        const timingChar = characters[charIndex];
        const timingText = timingChar.text || timingChar.word;
        
        console.log(`  Char ${charPos}: expecting "${expectedChar}", got "${timingText}" at position ${textPosition}`);
        
        // Check if the timing character matches what we expect
        if (timingText === expectedChar) {
          // Add this character to sentence words
          sentenceWords.push({
            word: timingText,
            start: timingChar.start,
            end: timingChar.end,
            duration: timingChar.end - timingChar.start
          });
          
          // Update sentence boundaries
          if (sentenceStart === null || timingChar.start < sentenceStart) {
            sentenceStart = timingChar.start;
          }
          if (sentenceEnd === null || timingChar.end > sentenceEnd) {
            sentenceEnd = timingChar.end;
          }
          
          charIndex++;
          textPosition++;
        } else {
          console.log(`    Warning: Character mismatch! Expected "${expectedChar}" but got "${timingText}"`);
          // Skip this character in the sentence, but don't advance charIndex
          break;
        }
      } else {
        console.log(`    Warning: No more timing data available for character "${expectedChar}"`);
        break;
      }
    }
    
    // Update sentence with word-level timings
    const updatedSentence = {
      ...sentence,
      timing: {
        start: sentenceStart || sentence.timing?.start || 0,
        end: sentenceEnd || sentence.timing?.end || 0,
        duration: (sentenceEnd || 0) - (sentenceStart || 0)
      },
      words: sentenceWords
    };
    
    console.log(`  Sentence complete: ${sentenceWords.length} characters, ${updatedSentence.timing.duration.toFixed(3)}s`);
    updatedSentences.push(updatedSentence);
  }
  
  return updatedSentences;
}

/**
 * Create backup of original lesson file
 */
function createBackup() {
  if (fs.existsSync(LESSON_FILE)) {
    fs.copyFileSync(LESSON_FILE, BACKUP_FILE);
    console.log(`📋 Backup created: ${BACKUP_FILE}`);
  }
}

/**
 * Main function to update lesson with timing data
 */
function main() {
  try {
    // Check if timings file exists
    if (!fs.existsSync(TIMINGS_FILE)) {
      console.error(`❌ Error: Timings file not found: ${TIMINGS_FILE}`);
      console.log('Expected file structure:');
      console.log(`{
  "alignment": {
    "characters": [
      {
        "text": "今",
        "start": 0.0,
        "end": 0.5
      },
      ...
    ]
  }
}`);
      process.exit(1);
    }

    // Check if lesson file exists
    if (!fs.existsSync(LESSON_FILE)) {
      console.error(`❌ Error: Lesson file not found: ${LESSON_FILE}`);
      process.exit(1);
    }

    console.log('🚀 Starting timing update process for Coffee and Cake lesson...');
    console.log(`📁 Reading timings from: ${TIMINGS_FILE}`);
    console.log(`📁 Reading lesson from: ${LESSON_FILE}`);

    // Read timing data
    const timingsData = JSON.parse(fs.readFileSync(TIMINGS_FILE, 'utf8'));
    
    // Extract characters array (prefer characters over words for better accuracy)
    let characters = [];
    if (timingsData.characters) {
      characters = timingsData.characters;
      console.log(`📊 Found ${characters.length} character timings`);
    } else if (timingsData.words) {
      characters = timingsData.words;
      console.log(`📊 Found ${characters.length} word timings`);
    } else if (timingsData.alignment && timingsData.alignment.characters) {
      characters = timingsData.alignment.characters;
      console.log(`📊 Found ${characters.length} character timings`);
    } else if (timingsData.alignment && timingsData.alignment.words) {
      characters = timingsData.alignment.words;
      console.log(`📊 Found ${characters.length} word timings`);
    } else if (Array.isArray(timingsData)) {
      characters = timingsData;
      console.log(`📊 Found ${characters.length} timing entries`);
    } else {
      throw new Error('Unable to find characters or words array in timings data');
    }

    // Read lesson data
    const lessonData = JSON.parse(fs.readFileSync(LESSON_FILE, 'utf8'));
    
    if (!lessonData.content || !lessonData.content.sentences) {
      throw new Error('Invalid lesson file structure');
    }

    console.log(`📝 Found ${lessonData.content.sentences.length} sentences in lesson`);

    // Create backup
    createBackup();

    // Map characters to sentences
    const updatedSentences = mapWordsToSentences(characters, lessonData.content.sentences, lessonData.content.chinese);

    // Update lesson data
    const updatedLesson = {
      ...lessonData,
      content: {
        ...lessonData.content,
        sentences: updatedSentences
      },
      metadata: {
        ...lessonData.metadata,
        dateModified: new Date().toISOString(),
        timingsUpdated: true,
        timingsSource: 'elevenlabs-forced-alignment',
        audioProcessed: true
      },
      audio: {
        ...lessonData.audio,
        hasTimings: true,
        totalDuration: Math.max(...updatedSentences.map(s => s.timing.end))
      }
    };

    // Save updated lesson
    fs.writeFileSync(LESSON_FILE, JSON.stringify(updatedLesson, null, 2));

    console.log('');
    console.log('✅ Timing update completed successfully!');
    console.log(`📁 Updated lesson saved to: ${LESSON_FILE}`);
    console.log(`📋 Backup available at: ${BACKUP_FILE}`);
    console.log('');
    
    // Summary
    console.log('📊 Summary:');
    updatedSentences.forEach((sentence, index) => {
      const charCount = sentence.words ? sentence.words.length : 0;
      const duration = sentence.timing.duration.toFixed(3);
      console.log(`   ${index + 1}. "${sentence.chinese}" - ${charCount} chars, ${duration}s`);
    });

  } catch (error) {
    console.error('❌ Error updating timings:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  mapWordsToSentences,
  createBackup,
  main
}; 