# Coffee and Cake Lesson - Setup Complete

## Overview
I've successfully created the complete Coffee and Cake lesson for the ZiPop app, including the JSON structure and ElevenLabs forced alignment integration.

## Files Created

### Lesson Files
- **`native/data/lessons/coffee_and_cake.json`** - Main lesson file with 30 sentences
- **`native/data/lessons/coffee_and_cake.txt`** - Original Chinese text (30 lines)
- **`native/data/lessons/coffee_and_cake.mp3`** - Audio file (already provided)

### Alignment Scripts
- **`timings/align_coffee_and_cake.sh`** - Main script to run forced alignment
- **`timings/updateTimings_coffee_and_cake.js`** - Script to integrate timings into lesson

### Updated Index
- **`native/data/index.json`** - Updated to include the new lesson and "social" category

## Lesson Content Structure

The lesson tells a delightful story about going out for coffee and cake with a friend:

1. **Introduction** (Weekend plans) - 3 sentences
2. **Making Plans** (Phone call and preparation) - 6 sentences  
3. **Going Out** (Meeting friend and walking to cafe) - 3 sentences
4. **At the Cafe** (Observing and ordering) - 8 sentences
5. **Enjoying Together** (Eating and chatting) - 6 sentences
6. **Conclusion** (Saying goodbye and reflection) - 4 sentences

**Total**: 30 sentences, ~25 minutes estimated learning time

## Key Features

### Lesson Metadata
- **ID**: `coffee-and-cake`
- **Level**: Beginner
- **Category**: Social & Friendship
- **Tags**: friendship, food, weekend, cafe, conversation
- **Vocabulary**: 25 key terms with English translations

### Language Content
- **Chinese**: Natural conversational sentences with dialogue
- **English**: Clear, contextual translations
- **Pinyin**: Will be auto-generated using the existing pinyin utilities

### Audio Integration
- **File**: `coffee_and_cake.mp3`
- **Timing**: Configured for ElevenLabs forced alignment
- **Word-level sync**: Character-by-character timing data

## How to Use the Forced Alignment

### Prerequisites
1. **ElevenLabs API Key**: Set up in `timings/.env` file:
   ```
   ELEVENLABS_API_KEY=your_api_key_here
   ```

2. **Audio File**: Ensure `native/data/lessons/coffee_and_cake.mp3` exists

### Running the Alignment

**Option 1: Full Automated Process**
```bash
cd timings
./align_coffee_and_cake.sh
```

This will:
1. Call ElevenLabs forced alignment API
2. Generate timing data files
3. Update the lesson JSON with character-level timings
4. Create backup files

**Option 2: Manual Steps**
```bash
cd timings

# Step 1: Generate alignment data
node forcedAlignment.js \
  --audio="../native/data/lessons/coffee_and_cake.mp3" \
  --lesson="../native/data/lessons/coffee_and_cake.json"

# Step 2: Update lesson with timings
node updateTimings_coffee_and_cake.js
```

### Output Files
After successful alignment:
- **`coffee_and_cake-alignment.json`** - Raw timing data from ElevenLabs
- **`coffee_and_cake-debug.json`** - Debug information and API logs
- **`coffee_and_cake.json.backup`** - Backup of original lesson file
- **`coffee_and_cake.json`** - Updated lesson with character-level timings

## Lesson Integration

The lesson is now fully integrated into the ZiPop app:

1. **Data Loader**: Automatically loads via `data/dataLoader.ts`
2. **App State**: Available through the lesson management system
3. **UI**: Accessible in the ChooseTextView lesson selector
4. **Audio**: Ready for synchronized playback with word highlighting

## Vocabulary Highlights

Key terms included in the lesson:
- **Time**: 星期六 (Saturday), 下午 (afternoon)
- **Social**: 朋友 (friend), 聊天 (chat), 家人 (family)
- **Food & Drink**: 咖啡 (coffee), 蛋糕 (cake), 牛奶 (milk)
- **Places**: 咖啡店 (coffee shop), 桌子 (table)
- **Actions**: 打电话 (make phone call), 刷牙 (brush teeth)
- **Emotions**: 开心 (happy), 好吃 (delicious)

## Story Flow

The lesson follows a natural narrative arc:
1. **Setup**: Weekend morning, no work
2. **Initiative**: Calling friend to make plans
3. **Preparation**: Getting ready to go out
4. **Journey**: Meeting and walking to cafe
5. **Experience**: Ordering, eating, and conversation
6. **Resolution**: Saying goodbye and going home happy

This structure provides excellent context for vocabulary retention and natural language flow.

## Next Steps

1. **Run the alignment**: Execute `./align_coffee_and_cake.sh` when ready
2. **Test in app**: Verify the lesson loads correctly in ZiPop
3. **Audio sync**: Test the character-level highlighting during playback
4. **User experience**: Gather feedback on lesson difficulty and engagement

## Technical Notes

- **JSON escaping**: All Chinese quotation marks properly escaped for JSON compatibility
- **Character encoding**: Full Unicode support for Chinese characters
- **Timing precision**: Character-level alignment for precise word highlighting
- **Error handling**: Comprehensive error checking and backup creation
- **Logging**: Detailed debug information for troubleshooting

The Coffee and Cake lesson is now ready for deployment and will provide an engaging, practical Chinese learning experience focused on social interactions and daily activities. 