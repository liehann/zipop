#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config();

// Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const FORCED_ALIGNMENT_URL = 'https://api.elevenlabs.io/v1/forced-alignment';

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (const arg of args) {
    if (arg.startsWith('--audio=')) {
      options.audio = arg.split('=')[1];
    } else if (arg.startsWith('--lesson=')) {
      options.lesson = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }
  
  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
ElevenLabs Forced Alignment CLI Tool

Usage:
  node forcedAlignment.js --audio=<audio-file> --lesson=<lesson-file>

Options:
  --audio=<file>    Path to audio file (MP3, WAV, etc.)
  --lesson=<file>   Path to lesson JSON file containing Chinese text
  --help, -h        Show this help message

Examples:
  node forcedAlignment.js --audio=../audio/beginner-greetings.mp3 --lesson=../native/data/lessons/beginner-greetings.json
  node forcedAlignment.js --audio=lesson1.mp3 --lesson=lesson1.json

Environment:
  ELEVENLABS_API_KEY    Your ElevenLabs API key (required)
                        Set in .env file or as environment variable
`);
}

/**
 * Resolve file paths relative to current working directory
 */
function resolvePaths(audioFile, lessonFile) {
  // If paths are relative, resolve them from the current working directory
  const resolvedAudio = path.isAbsolute(audioFile) ? audioFile : path.resolve(process.cwd(), audioFile);
  const resolvedLesson = path.isAbsolute(lessonFile) ? lessonFile : path.resolve(process.cwd(), lessonFile);
  
  return { resolvedAudio, resolvedLesson };
}

/**
 * Generate output file names based on lesson file name
 */
function generateOutputPaths(lessonFile) {
  const baseName = path.basename(lessonFile, '.json');
  const outputDir = path.dirname(lessonFile);
  
  return {
    alignmentFile: path.join(outputDir, `${baseName}-alignment.json`),
    debugFile: path.join(outputDir, `${baseName}-debug.json`)
  };
}

/**
 * Extract Chinese text from the lesson data
 * @param {Object} lessonData - The lesson JSON data
 * @returns {string} - The concatenated Chinese text
 */
function extractChineseText(lessonData) {
  return lessonData.content.chinese;
}

/**
 * Call ElevenLabs Forced Alignment API
 * @param {string} audioFilePath - Path to the audio file
 * @param {string} text - The Chinese text to align
 * @param {string} debugFile - Path to save debug information
 * @returns {Promise<Object>} - The alignment response
 */
async function callForcedAlignmentAPI(audioFilePath, text, debugFile) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY environment variable is not set');
  }

  if (!fs.existsSync(audioFilePath)) {
    throw new Error(`Audio file not found: ${audioFilePath}`);
  }

  const audioStats = fs.statSync(audioFilePath);
  const formData = new FormData();
  formData.append('file', fs.createReadStream(audioFilePath));
  formData.append('text', text);

  // Prepare debug information
  const debugInfo = {
    timestamp: new Date().toISOString(),
    request: {
      url: FORCED_ALIGNMENT_URL,
      method: 'POST',
      headers: {
        'xi-api-key': '[REDACTED]',
        'content-type': 'multipart/form-data'
      },
      body: {
        text: text,
        file: {
          path: audioFilePath,
          size: audioStats.size,
          sizeMB: (audioStats.size / 1024 / 1024).toFixed(2)
        }
      }
    },
    response: null,
    error: null
  };

  console.log('Calling ElevenLabs Forced Alignment API...');
  console.log('Audio file:', audioFilePath);
  console.log('Audio file size:', `${debugInfo.request.body.file.sizeMB} MB`);
  console.log('Chinese text:', text);
  console.log('Text length:', text.length, 'characters');
  
  try {
    const startTime = Date.now();
    const response = await fetch(FORCED_ALIGNMENT_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        ...formData.getHeaders()
      },
      body: formData
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Log response details
    debugInfo.response = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      duration: `${duration}ms`
    };

    if (!response.ok) {
      const errorText = await response.text();
      debugInfo.error = {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      };
      
      // Save debug info before throwing error
      saveDebugInfo(debugInfo, debugFile);
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const result = await response.json();
    debugInfo.response.body = result;
    debugInfo.response.wordCount = result.words ? result.words.length : 0;
    
    // Save debug info
    saveDebugInfo(debugInfo, debugFile);
    
    console.log(`API call successful! Duration: ${duration}ms`);
    console.log(`Words aligned: ${debugInfo.response.wordCount}`);
    
    return result;
  } catch (error) {
    if (!debugInfo.error) {
      debugInfo.error = {
        message: error.message,
        stack: error.stack
      };
      saveDebugInfo(debugInfo, debugFile);
    }
    console.error('API call failed:', error.message);
    throw error;
  }
}

/**
 * Save debug information to file
 * @param {Object} debugInfo - The debug information including request/response details
 * @param {string} debugFile - Path to save debug information
 */
function saveDebugInfo(debugInfo, debugFile) {
  try {
    fs.writeFileSync(debugFile, JSON.stringify(debugInfo, null, 2));
    console.log(`Debug information saved to: ${debugFile}`);
  } catch (error) {
    console.error('Failed to save debug information:', error.message);
  }
}

/**
 * Save alignment results to file
 * @param {Object} alignmentData - The alignment response from API
 * @param {string} outputPath - Path to save the results
 */
function saveAlignmentResults(alignmentData, outputPath) {
  const lessonName = path.basename(outputPath, '-alignment.json');
  const outputData = {
    timestamp: new Date().toISOString(),
    source: 'elevenlabs-forced-alignment',
    lesson: lessonName,
    alignment: alignmentData
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`Alignment results saved to: ${outputPath}`);
}

/**
 * Main function to process forced alignment
 */
async function main() {
  try {
    // Parse command line arguments
    const options = parseArgs();
    
    // Validate required arguments
    if (!options.audio || !options.lesson) {
      console.error('Error: Both --audio and --lesson arguments are required\n');
      showHelp();
      process.exit(1);
    }

    // Check API key
    if (!ELEVENLABS_API_KEY) {
      console.error('Error: ELEVENLABS_API_KEY environment variable is not set');
      console.error('Please create a .env file with your API key or set the environment variable');
      process.exit(1);
    }

    // Resolve file paths
    const { resolvedAudio, resolvedLesson } = resolvePaths(options.audio, options.lesson);
    
    // Generate output file paths
    const { alignmentFile, debugFile } = generateOutputPaths(resolvedLesson);
    
    // Check if required files exist
    if (!fs.existsSync(resolvedLesson)) {
      throw new Error(`Lesson file not found: ${resolvedLesson}`);
    }

    if (!fs.existsSync(resolvedAudio)) {
      throw new Error(`Audio file not found: ${resolvedAudio}`);
    }

    // Read lesson data
    console.log('Reading lesson data...');
    console.log('Lesson file:', resolvedLesson);
    const lessonData = JSON.parse(fs.readFileSync(resolvedLesson, 'utf8'));
    
    // Extract Chinese text
    const chineseText = extractChineseText(lessonData);
    console.log('Extracted Chinese text:', chineseText);

    // Call Forced Alignment API
    const alignmentResult = await callForcedAlignmentAPI(resolvedAudio, chineseText, debugFile);
    
    // Save results
    saveAlignmentResults(alignmentResult, alignmentFile);
    
    console.log('\n✅ Forced alignment completed successfully!');
    console.log('📊 Word-level alignment count:', alignmentResult.words ? alignmentResult.words.length : 'N/A');
    console.log('📁 Results saved to:', alignmentFile);
    console.log('🐛 Debug info saved to:', debugFile);
    
  } catch (error) {
    console.error('\n❌ Error processing forced alignment:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  showHelp,
  resolvePaths,
  generateOutputPaths,
  extractChineseText,
  callForcedAlignmentAPI,
  saveDebugInfo,
  saveAlignmentResults,
  main
}; 