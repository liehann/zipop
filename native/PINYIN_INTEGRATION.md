# Pinyin Library Integration

This document explains how to use the integrated pinyin library for automatic Chinese-to-pinyin conversion in ZiPop.

## Overview

We've integrated the `pinyin` library by @hotoo, which provides robust Chinese character to pinyin conversion with proper tone marks, word segmentation, and multiple output formats.

## Available Functions

### Basic Pinyin Conversion

```typescript
import { toPinyin, sentenceToPinyin, toPinyinWithoutTones } from './utils/pinyinUtils';

// Single character conversion
toPinyin('你');           // → "nǐ"
toPinyin('好');           // → "hǎo"

// Sentence conversion with proper spacing
sentenceToPinyin('你好');     // → "nǐ hǎo"
sentenceToPinyin('你好吗');   // → "nǐ hǎo ma"
sentenceToPinyin('我是中国人'); // → "wǒ shì zhōng guó rén"

// Without tone marks (useful for input/search)
toPinyinWithoutTones('你好'); // → "ni hao"
```

### Advanced Features

```typescript
import { 
  toPinyinWithNumericTones, 
  isChineseText, 
  batchToPinyin 
} from './utils/pinyinUtils';

// Numeric tones
toPinyinWithNumericTones('你好'); // → "ni3 hao3"

// Check if text contains Chinese characters
isChineseText('你好');       // → true
isChineseText('hello');     // → false
isChineseText('你好world');  // → true

// Batch conversion
batchToPinyin(['你', '好', '世', '界']); // → ["nǐ", "hǎo", "shì", "jiè"]
```

## Integration with Existing Code

The library is already integrated into your existing text processing pipeline:

### In `textProcessing.ts`

```typescript
// These functions now use the real pinyin library instead of mock data
import { getPinyin, getSentencePinyin, getPinyinWithoutTones } from './utils/textProcessing';

const word = {
  hanzi: '你',
  pinyin: getPinyin('你'),    // Now returns "nǐ" from the real library
  english: 'you'
};
```

### Creating Words Automatically

```typescript
import { createWordFromChinese } from './utils/pinyinDemo';

// Automatically generate pinyin for new words
const word = createWordFromChinese('你', 'you');
// Result: { id: '...', hanzi: '你', pinyin: 'nǐ', english: 'you' }
```

## Usage in Components

You can now input Chinese text and automatically generate pinyin:

```typescript
// In your React Native components
import { sentenceToPinyin, isChineseText } from './utils/pinyinUtils';

function AddTextComponent() {
  const [inputText, setInputText] = useState('');
  
  const handleTextInput = (text: string) => {
    setInputText(text);
    
    if (isChineseText(text)) {
      const pinyin = sentenceToPinyin(text);
      console.log(`Chinese: ${text}`);
      console.log(`Pinyin: ${pinyin}`);
    }
  };
  
  return (
    <TextInput
      value={inputText}
      onChangeText={handleTextInput}
      placeholder="输入中文文本..."
    />
  );
}
```

## Benefits Over Mock Data

1. **Comprehensive Coverage**: Handles thousands of Chinese characters automatically
2. **Proper Tone Marks**: Accurate tone marks (nǐ, hǎo, etc.)
3. **Word Segmentation**: Intelligent spacing between words in sentences
4. **Multiple Formats**: Support for tone marks, numeric tones, or no tones
5. **Error Handling**: Graceful fallback for non-Chinese text
6. **Performance**: Optimized for production use

## Example Conversions

| Chinese | Pinyin (with tones) | Pinyin (no tones) | Numeric tones |
|---------|---------------------|-------------------|---------------|
| 你好 | nǐ hǎo | ni hao | ni3 hao3 |
| 谢谢你 | xiè xiè nǐ | xie xie ni | xie4 xie4 ni3 |
| 我爱你 | wǒ ài nǐ | wo ai ni | wo3 ai4 ni3 |
| 中国人 | zhōng guó rén | zhong guo ren | zhong1 guo2 ren2 |
| 再见 | zài jiàn | zai jian | zai4 jian4 |

## Testing the Integration

You can test the pinyin conversion by importing and using the demo functions:

```typescript
import { testPinyinConversion, pinyinExamples } from './utils/pinyinDemo';

// Run a comprehensive test
testPinyinConversion();

// Access pre-computed examples
console.log(pinyinExamples.sentences['你好吗']); // "nǐ hǎo ma"
```

## Library Configuration

The default configuration uses:
- `STYLE_TONE`: Pinyin with tone marks (nǐ, hǎo)
- `segment: true`: Enable word segmentation
- `group: false`: Don't group results

You can customize these settings in `utils/pinyinUtils.ts` if needed.

## Next Steps

1. **Auto-Generation**: Use `createWordFromChinese()` when users input Chinese text
2. **Search Enhancement**: Use `toPinyinWithoutTones()` for search functionality
3. **Input Assistance**: Show pinyin suggestions as users type Chinese
4. **Pronunciation**: Consider adding audio pronunciation using the pinyin output

The pinyin library is now fully integrated and ready to replace all mock pinyin data with accurate, real-time conversions! 