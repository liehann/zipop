#!/usr/bin/env tsx

import { cedictService } from '../services/cedictService';

async function testCedictService() {
  console.log('🧪 Testing CEDICT Service...\n');

  try {
    // Load the dictionary
    await cedictService.loadDictionary();
    
    // Get stats
    const stats = cedictService.getStats();
    console.log(`📚 Dictionary loaded: ${stats.loaded}`);
    console.log(`📊 Total entries: ${stats.totalEntries}\n`);

    // Test some common words and characters
    const testWords = ['你好', '我', '好', '谢谢', '什么', '名字', '中国', '学生', '老师'];
    
    console.log('🔍 Testing translations for common words and characters:');
    testWords.forEach(word => {
      const translation = cedictService.getTranslation(word);
      const pinyin = cedictService.getPinyin(word);
      console.log(`  ${word}: ${translation || 'NOT FOUND'} (${pinyin || 'no pinyin'})`);
    });

    // Test vocabulary enhancement
    console.log('\n🔧 Testing vocabulary enhancement:');
    const sampleVocabulary = [
      { chinese: '你好', english: 'hello' },
      { chinese: '我', english: 'I/me' },
      { chinese: '好', english: 'good/well' },
      { chinese: '谢谢', english: 'thank you' },
      { chinese: '不存在的词', english: 'non-existent word' }
    ];

    const enhancedVocab = cedictService.enhanceVocabulary(sampleVocabulary);
    
    console.log('Original → Enhanced:');
    sampleVocabulary.forEach((original, index) => {
      const enhanced = enhancedVocab[index];
      const changed = original.english !== enhanced.english ? ' ✨' : '';
      console.log(`  ${original.chinese}: "${original.english}" → "${enhanced.english}"${changed}`);
    });

    // Test comprehensive vocabulary extraction (characters + words)
    console.log('\n🎯 Testing comprehensive vocabulary extraction from content:');
    const sampleContent = {
      chinese: '你好！我很好，谢谢你。我是中国人。',
      sentences: [
        { chinese: '你好！' },
        { chinese: '我很好，谢谢你。' },
        { chinese: '我是中国人。' }
      ]
    };

    const extractedVocab = cedictService.extractVocabularyFromContent(sampleContent);
    console.log('Extracted vocabulary (Characters + Words):');
    console.log('Characters:');
    extractedVocab.filter(v => v.type === 'character').forEach(item => {
      console.log(`  ${item.chinese}: ${item.english}`);
    });
    console.log('Words:');
    extractedVocab.filter(v => v.type === 'word').forEach(item => {
      console.log(`  ${item.chinese}: ${item.english}`);
    });

    // Test expanded lesson vocabulary
    console.log('\n📚 Testing expanded lesson vocabulary:');
    const expandedVocab = cedictService.expandLessonVocabulary(sampleContent, sampleVocabulary);
    console.log(`Original: ${sampleVocabulary.length}, Expanded: ${expandedVocab.length} items`);
    console.log('Expanded vocabulary:');
    expandedVocab.forEach(item => {
      const typeLabel = item.type ? `(${item.type})` : '(original)';
      console.log(`  ${item.chinese}: ${item.english} ${typeLabel}`);
    });

    console.log('\n✅ CEDICT Service test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testCedictService();