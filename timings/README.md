# ElevenLabs Forced Alignment CLI Tool

A simple command line utility for processing audio files with the ElevenLabs Forced Alignment API to generate precise word-level timing data for Chinese language lessons.

## Setup

1. **Install Dependencies**
   ```bash
   cd timings
   npm install
   ```

2. **Set ElevenLabs API Key**
   
   **Option A: Using .env file (recommended)**
   ```bash
   # Copy the example file and edit it
   cp env.example .env
   # Then edit .env and replace with your actual API key
   ```
   
   **Option B: Using environment variable**
   ```bash
   export ELEVENLABS_API_KEY="your_api_key_here"
   ```

3. **Optional: Install globally**
   ```bash
   npm link
   # Now you can use '11labs_force_alignment' command anywhere
   ```

## Usage

### Basic Usage

```bash
node forcedAlignment.js --audio=<audio-file> --lesson=<lesson-file>
```

### Examples

```bash
# Process beginner greetings lesson
node forcedAlignment.js --audio=../audio/beginner-greetings.mp3 --lesson=../native/data/lessons/beginner-greetings.json

# Or use the npm script
npm run align:beginner-greetings

# If installed globally
11labs_force_alignment --audio=lesson1.mp3 --lesson=lesson1.json
```

### Command Line Options

- `--audio=<file>` - Path to audio file (MP3, WAV, etc.)
- `--lesson=<file>` - Path to lesson JSON file containing Chinese text
- `--help`, `-h` - Show help message

### How it works

The tool will:
1. Read the Chinese text from your lesson JSON file
2. Extract the Chinese characters from the `content.chinese` field
3. Send the audio file and Chinese text to ElevenLabs Forced Alignment API
4. Save word-level timing results to `<lesson-name>-alignment.json`
5. Save detailed debug information to `<lesson-name>-debug.json`

## Output Format

The script generates two output files:

### 1. Alignment Results (`beginner-greetings-alignment.json`)

```json
{
  "timestamp": "2024-01-15T10:00:00.000Z",
  "source": "elevenlabs-forced-alignment",
  "lesson": "beginner-greetings",
  "alignment": {
    "words": [
      {
        "word": "你好",
        "start": 0.0,
        "end": 0.5
      },
      // ... more word alignments
    ]
  }
}
```

### 2. Debug Information (`beginner-greetings-debug.json`)

Contains detailed request/response information for troubleshooting:

```json
{
  "timestamp": "2024-01-15T10:00:00.000Z",
  "request": {
    "url": "https://api.elevenlabs.io/v1/audio-to-text/alignment",
    "method": "POST",
    "headers": {
      "xi-api-key": "[REDACTED]",
      "content-type": "multipart/form-data; boundary=..."
    },
    "body": {
      "text": "你好！你好吗？...",
      "model": "eleven_multilingual_v2",
      "audioFile": {
        "path": "../audio/beginner-greetings.mp3",
        "size": 1234567,
        "sizeMB": "1.23"
      }
    }
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "headers": {...},
    "duration": "5432ms",
    "body": {...},
    "wordCount": 15
  },
  "error": null
}
```

## API Information

- **API Endpoint**: `https://api.elevenlabs.io/v1/audio-to-text/alignment`
- **Model**: `eleven_multilingual_v2` (supports Chinese)
- **Supported Languages**: 29 languages including Chinese
- **Maximum File Size**: 1GB
- **Maximum Duration**: 4.5 hours
- **Maximum Text Length**: 675k characters
- **Pricing**: Same as Speech to Text API

For more details, see the [ElevenLabs Forced Alignment documentation](https://elevenlabs.io/docs/capabilities/forced-alignment).

## Files

- `forcedAlignment.js` - Main script for processing forced alignment
- `package.json` - Node.js dependencies and scripts
- `README.md` - This documentation file
- `env.example` - Example environment file (copy to `.env`)
- `.env` - Your actual API key (create from env.example, not committed to git)
- `.gitignore` - Git ignore rules for sensitive files
- `beginner-greetings-alignment.json` - Generated alignment results (after running script)
- `beginner-greetings-debug.json` - Generated debug information (after running script)

## Requirements

- Node.js 14+ 
- ElevenLabs API key with Forced Alignment access
- Audio file in `../audio/beginner-greetings.mp3`
- Lesson data in `../native/data/lessons/beginner-greetings.json`
- Create `.env` file with your API key (copy from `env.example`)

## Security Note

The `.env` file containing your API key is automatically excluded from git commits via `.gitignore`. Never commit your actual API key to version control. 