import { Document, Translation } from './types';

// Simple markdown-style format for easier content management
const sampleDataMarkdown = `
# 我的第一课
# wǒ de dì yī kè
# My First Lesson

## 问候语
## wèn hòu yǔ
## Greetings

你好
nǐ hǎo
Hello

你好吗？
nǐ hǎo ma?
How are you?

我很好
wǒ hěn hǎo
I am fine

## 自我介绍
## zì wǒ jiè shào
## Self Introduction

我叫李华
wǒ jiào lǐ huá
My name is Li Hua

我是学生
wǒ shì xué shēng
I am a student

很高兴认识你
hěn gāo xìng rèn shi nǐ
Nice to meet you

---

# 在餐厅
# zài cān tīng
# At the Restaurant

## 点菜
## diǎn cài
## Ordering Food

菜单在哪里？
cài dān zài nǎ lǐ?
Where is the menu?

我想要一份米饭
wǒ xiǎng yào yī fèn mǐ fàn
I want a bowl of rice

多少钱？
duō shǎo qián?
How much does it cost?

---

# 购物
# gòu wù
# Shopping

## 买衣服
## mǎi yī fú
## Buying Clothes

这件衣服多少钱？
zhè jiàn yī fú duō shǎo qián?
How much is this piece of clothing?

有没有小号的？
yǒu méi yǒu xiǎo hào de?
Do you have a small size?

我可以试穿吗？
wǒ kě yǐ shì chuān ma?
Can I try it on?
`;

// Parser function to convert markdown format to Document structure
function parseMarkdownToDocuments(markdown: string): Document[] {
  const documents: Document[] = [];
  const documentSections = markdown.trim().split('---').filter(section => section.trim());
  
  documentSections.forEach((docSection, docIndex) => {
    const lines = docSection.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return;
    
    // Parse document title (first 3 lines starting with #)
    const titleLines = lines.slice(0, 3);
    const documentTitle: Translation = {
      chinese: titleLines[0].replace(/^#\s*/, '').trim(),
      pinyin: titleLines[1].replace(/^#\s*/, '').trim(),
      english: titleLines[2].replace(/^#\s*/, '').trim()
    };
    
    const document: Document = {
      id: `doc${docIndex + 1}`,
      title: documentTitle,
      sections: []
    };
    
    // Parse sections and content
    let currentSection: any = null;
    let sectionIndex = 0;
    let lineIndex = 0;
    
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('##')) {
        // New section title (collect next 3 lines)
        if (currentSection) {
          document.sections.push(currentSection);
        }
        
        const sectionTitleLines = lines.slice(i, i + 3);
        const sectionTitle: Translation = {
          chinese: sectionTitleLines[0].replace(/^##\s*/, '').trim(),
          pinyin: sectionTitleLines[1].replace(/^##\s*/, '').trim(),
          english: sectionTitleLines[2].replace(/^##\s*/, '').trim()
        };
        
        currentSection = {
          id: `section${sectionIndex + 1}`,
          title: sectionTitle,
          lines: []
        };
        
        sectionIndex++;
        i += 2; // Skip the next 2 lines as they are part of the section title
      } else if (line && !line.startsWith('#') && currentSection) {
        // Translation line - collect in groups of 3
        const translationLines = lines.slice(i, i + 3);
        
        if (translationLines.length === 3) {
          const translation: Translation = {
            chinese: translationLines[0].trim(),
            pinyin: translationLines[1].trim(),
            english: translationLines[2].trim()
          };
          
          currentSection.lines.push({
            id: `line${lineIndex + 1}`,
            translation
          });
          
          lineIndex++;
          i += 2; // Skip the next 2 lines as they are part of this translation
        }
      }
    }
    
    // Add the last section
    if (currentSection) {
      document.sections.push(currentSection);
    }
    
    documents.push(document);
  });
  
  return documents;
}

// Export the parsed documents
export const sampleDocuments: Document[] = parseMarkdownToDocuments(sampleDataMarkdown); 