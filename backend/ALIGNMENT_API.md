# 11 Labs Forced Alignment API

This document describes the new API endpoint for integrating with 11 Labs forced alignment service.

## Overview

The alignment API allows you to process Chinese text content with 11 Labs' forced alignment technology to generate precise timing information for each character in the audio.

## Prerequisites

1. **11 Labs API Key**: You need a valid 11 Labs API key with access to their forced alignment service
2. **Audio Files**: The content must have associated audio files in the `backend/static/audio/` directory
3. **Database Setup**: Content must exist in the database with proper Chinese text and audio configuration

## Configuration

Add your 11 Labs API key to your environment:

```bash
# .env file
ELEVENLABS_API_KEY=your_actual_api_key_here
```

## API Endpoints

### POST `/api/v1/alignment/:content_id`

Process forced alignment for a specific content item.

**Parameters:**
- `content_id` (string): The ID of the content to process

**Request:**
- Method: POST
- URL: `http://localhost:3002/api/v1/alignment/{content_id}`
- Headers: None required (uses environment API key)

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": "beginner-greetings",
    "success": true,
    "message": "Alignment completed successfully",
    "alignment": {
      "alignment": {
        "char_start_times_ms": [0, 219, 439, ...],
        "char_end_times_ms": [219, 439, 680, ...],
        "chars": ["你", "好", "！", ...]
      }
    },
    "logFile": "beginner-greetings_2024-01-15T10-30-45-123Z.json"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Content not found"
}
```

### GET `/api/v1/alignment/logs`

Get a list of all alignment log files.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "filename": "beginner-greetings_2024-01-15T10-30-45-123Z.json",
      "created": "2024-01-15T10:30:45.123Z",
      "size": 15420
    }
  ]
}
```

### GET `/api/v1/alignment/logs/:filename`

Get the contents of a specific log file.

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": "beginner-greetings",
    "timestamp": "2024-01-15T10:30:45.123Z",
    "request": {
      "chineseText": "你好！你好吗？...",
      "audioFile": "beginner-greetings.mp3"
    },
    "response": {
      "success": true,
      "alignment": { ... }
    },
    "success": true
  }
}
```

## What Happens During Processing

1. **Content Retrieval**: The API fetches the content from the database using the provided `content_id`
2. **Text Extraction**: Extracts the Chinese text from the content data
3. **Audio File Validation**: Checks that the associated audio file exists
4. **11 Labs API Call**: Sends the Chinese text and audio file to 11 Labs for forced alignment
5. **Response Logging**: Saves the complete request/response to a timestamped log file in `backend/logs/alignment/`
6. **Database Update**: Updates the content in the database with the new timing information
7. **Metadata Update**: Updates the content metadata to indicate alignment processing has been completed

## Database Changes

The alignment process updates the following fields in the database:

- **`content.content`**: Updates sentences and words with precise timing information
- **`content.metadata`**: Adds alignment processing flags:
  - `timingsUpdated: true`
  - `timingsSource: "11labs"`
  - `alignmentProcessed: true`
  - `dateModified: <current timestamp>`
- **`content.audio`**: Sets `hasTimings: true`

## Data Structure Updates

The alignment process converts 11 Labs character-level timing data into the existing sentence and word structure:

**Before:**
```json
{
  "chinese": "你好！",
  "english": "Hello!",
  "timing": null,
  "words": null
}
```

**After:**
```json
{
  "chinese": "你好！",
  "english": "Hello!",
  "timing": {
    "start": 0.219,
    "end": 1.599,
    "duration": 1.38
  },
  "words": [
    {
      "word": "你",
      "start": 0.219,
      "end": 0.439,
      "duration": 0.22
    },
    {
      "word": "好",
      "start": 0.439,
      "end": 0.68,
      "duration": 0.241
    },
    {
      "word": "！",
      "start": 0.68,
      "end": 1.599,
      "duration": 0.919
    }
  ]
}
```

## Error Handling

The API handles several error conditions:

- **Content not found**: Returns 404 if the content_id doesn't exist
- **Missing Chinese text**: Returns 400 if no Chinese text is found in the content
- **Missing audio configuration**: Returns 400 if no audio file is configured
- **Audio file not found**: Returns 400 if the audio file doesn't exist on disk
- **11 Labs API errors**: Returns 500 with detailed error information
- **Network timeouts**: 60-second timeout for 11 Labs API calls

## Example Usage

```bash
# Process alignment for a specific content item
curl -X POST http://localhost:3002/api/v1/alignment/beginner-greetings

# Get all log files
curl http://localhost:3002/api/v1/alignment/logs

# Get specific log file
curl http://localhost:3002/api/v1/alignment/logs/beginner-greetings_2024-01-15T10-30-45-123Z.json
```

## Logging

All alignment requests and responses are logged to `backend/logs/alignment/` with the following naming convention:
- Format: `{content_id}_{timestamp}.json`
- Example: `beginner-greetings_2024-01-15T10-30-45-123Z.json`

Log files contain:
- Request details (content ID, Chinese text, audio file)
- Complete 11 Labs API response
- Success/failure status
- Timestamp information

## Dependencies

The alignment API requires these additional packages:
- `axios`: For HTTP requests to 11 Labs API
- `form-data`: For multipart form uploads
- `fs-extra`: For file system operations and logging

## Security Considerations

- The 11 Labs API key is stored as an environment variable
- Log files may contain sensitive content - ensure proper access controls
- Audio files are read from the local filesystem - validate file paths
- API responses are logged in full - consider data retention policies