# Data System Documentation

This directory contains the structured data system for ZiPop Chinese learning content. All lessons are loaded at build time and made available as built-in text selection options.

## Directory Structure

```
data/
├── README.md                           # This documentation
├── index.json                          # Data index with lesson metadata
├── types.ts                           # TypeScript type definitions
├── dataLoader.ts                      # Data loading utilities
└── lessons/                           # Individual lesson files
    ├── beginner-greetings.json
    ├── restaurant-ordering.json
    ├── shopping-basics.json
    └── time-and-dates.json
```

## How It Works

1. **Build-Time Loading**: All JSON files are imported at build time using TypeScript's `resolveJsonModule` feature
2. **Type Safety**: Full TypeScript support with proper interfaces for all data structures
3. **Automatic Integration**: Lessons appear automatically in the app's text selection UI
4. **Pinyin Generation**: Chinese text is automatically converted to pinyin using the integrated pinyin library
5. **Processing Pipeline**: Raw lesson data is converted to the app's internal `WordListData` format

## Adding New Lessons

### 1. Create a Lesson File

Create a new JSON file in the `lessons/` directory following this structure:

```json
{
  "id": "unique-lesson-id",
  "title": "Lesson Title",
  "description": "Brief description of the lesson content",
  "level": "beginner|intermediate|advanced",
  "category": "category-name",
  "tags": ["tag1", "tag2", "tag3"],
  "estimatedTime": 20,
  "content": {
    "chinese": "完整的中文文本。可以包含多个句子。",
    "sentences": [
      {
        "chinese": "第一个句子。",
        "english": "First sentence."
      },
      {
        "chinese": "第二个句子。",
        "english": "Second sentence."
      }
    ]
  },
  "vocabulary": [
    {
      "chinese": "词汇",
      "english": "vocabulary"
    }
  ],
  "metadata": {
    "dateCreated": "2024-01-15T10:00:00Z",
    "dateModified": "2024-01-15T10:00:00Z",
    "author": "Author Name",
    "version": "1.0"
  }
}
```

### 2. Update the Data Index

Add your lesson to `index.json` in the `lessons` array:

```json
{
  "id": "unique-lesson-id",
  "file": "lessons/your-lesson-file.json",
  "title": "Lesson Title",
  "level": "beginner",
  "category": "category-name",
  "estimatedTime": 20,
  "featured": false,
  "order": 5
}
```

Also update:
- `totalLessons`: Increment by 1
- `categories`: Add new category if needed
- `lastUpdated`: Update to current timestamp

### 3. Update the Data Loader

Add the import statement in `dataLoader.ts`:

```typescript
import yourLessonFile from './lessons/your-lesson-file.json';
```

Add to the `lessonRegistry`:

```typescript
const lessonRegistry: Record<string, LessonData> = {
  // ... existing lessons
  'unique-lesson-id': yourLessonFile as LessonData,
};
```

### 4. Build and Test

The lesson will automatically appear in the app after rebuilding. No additional configuration needed!

## Data Schema

### Lesson Data Structure

- **id**: Unique identifier (kebab-case recommended)
- **title**: Display name for the lesson
- **description**: Brief explanation of lesson content
- **level**: Difficulty level (`beginner`, `intermediate`, `advanced`)
- **category**: Content category (e.g., `greetings`, `food`, `shopping`)
- **tags**: Array of searchable tags
- **estimatedTime**: Approximate study time in minutes
- **content**: The actual lesson content
  - **chinese**: Full Chinese text (used for processing)
  - **sentences**: Array of sentence pairs with translations
- **vocabulary**: Key vocabulary items with translations
- **metadata**: Creation info, author, version

### Categories

Current categories include:
- `greetings`: Basic greetings and politeness
- `food`: Restaurant and dining vocabulary
- `shopping`: Commerce and shopping interactions
- `time`: Time expressions and scheduling

### Levels

- **beginner**: Basic vocabulary, simple sentences
- **intermediate**: More complex grammar, practical conversations
- **advanced**: Sophisticated language, complex topics

## Content Guidelines

### Chinese Text
- Use simplified Chinese characters
- Include proper punctuation (。！？)
- Keep sentences conversational and practical
- Focus on common, useful phrases

### English Translations
- Provide natural, contextual translations
- Use American English conventions
- Include cultural context when needed
- Keep translations concise but clear

### Vocabulary Selection
- Include key words that appear in the lesson
- Focus on high-frequency, useful vocabulary
- Provide literal meanings for particles and function words
- Use consistent translation patterns

## Technical Features

### Automatic Processing
- **Pinyin Generation**: All Chinese text automatically gets pinyin using the @hotoo/pinyin library
- **Word Segmentation**: Smart word boundaries for better reading experience
- **Error Handling**: Graceful fallback for processing errors

### Build Integration
- **Metro Support**: Works with React Native's Metro bundler
- **Webpack Support**: Compatible with web builds
- **TypeScript**: Full type checking and IntelliSense support
- **Hot Reload**: Changes reflected immediately during development

### Performance
- **Bundle Size**: Only active lessons are included in the final bundle
- **Loading Speed**: All data is available synchronously after initial load
- **Memory Efficient**: Data is loaded once and cached

## Best Practices

1. **File Naming**: Use kebab-case for lesson files (`my-lesson.json`)
2. **IDs**: Match the filename without extension (`my-lesson`)
3. **Order**: Use the `order` field in index.json to control display sequence
4. **Featured**: Mark important beginner lessons as `featured: true`
5. **Testing**: Test lessons in both mobile and web builds
6. **Validation**: Use TypeScript to catch schema errors early

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure the lesson is added to `dataLoader.ts`
2. **Type Errors**: Validate JSON structure against the TypeScript interfaces
3. **Missing Lessons**: Check that the lesson is listed in `index.json`
4. **Build Failures**: Ensure all JSON files are valid (no trailing commas, proper quotes)

### Development Tips

1. Use a JSON validator to check file structure
2. Test pinyin conversion with Chinese characters
3. Verify translations are contextually appropriate
4. Check lesson display in both light and dark modes
5. Test on different screen sizes

## Future Enhancements

The data system is designed to support:
- Audio files for pronunciation
- Images and illustrations
- Interactive exercises
- Progress tracking
- Difficulty progression
- Personalized recommendations

Additional lesson types and content formats can be easily added by extending the type definitions and processing pipeline. 