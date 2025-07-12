import { Document } from './types';

export const sampleDocuments: Document[] = [
  {
    id: 'doc1',
    title: {
      chinese: '我的第一课',
      pinyin: 'wǒ de dì yī kè',
      english: 'My First Lesson'
    },
    sections: [
      {
        id: 'section1',
        title: {
          chinese: '问候语',
          pinyin: 'wèn hòu yǔ',
          english: 'Greetings'
        },
        lines: [
          {
            id: 'line1',
            translation: {
              chinese: '你好',
              pinyin: 'nǐ hǎo',
              english: 'Hello'
            }
          },
          {
            id: 'line2',
            translation: {
              chinese: '你好吗？',
              pinyin: 'nǐ hǎo ma?',
              english: 'How are you?'
            }
          },
          {
            id: 'line3',
            translation: {
              chinese: '我很好',
              pinyin: 'wǒ hěn hǎo',
              english: 'I am fine'
            }
          }
        ]
      },
      {
        id: 'section2',
        title: {
          chinese: '自我介绍',
          pinyin: 'zì wǒ jiè shào',
          english: 'Self Introduction'
        },
        lines: [
          {
            id: 'line4',
            translation: {
              chinese: '我叫李华',
              pinyin: 'wǒ jiào lǐ huá',
              english: 'My name is Li Hua'
            }
          },
          {
            id: 'line5',
            translation: {
              chinese: '我是学生',
              pinyin: 'wǒ shì xué shēng',
              english: 'I am a student'
            }
          },
          {
            id: 'line6',
            translation: {
              chinese: '很高兴认识你',
              pinyin: 'hěn gāo xìng rèn shi nǐ',
              english: 'Nice to meet you'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'doc2',
    title: {
      chinese: '在餐厅',
      pinyin: 'zài cān tīng',
      english: 'At the Restaurant'
    },
    sections: [
      {
        id: 'section3',
        title: {
          chinese: '点菜',
          pinyin: 'diǎn cài',
          english: 'Ordering Food'
        },
        lines: [
          {
            id: 'line7',
            translation: {
              chinese: '菜单在哪里？',
              pinyin: 'cài dān zài nǎ lǐ?',
              english: 'Where is the menu?'
            }
          },
          {
            id: 'line8',
            translation: {
              chinese: '我想要一份米饭',
              pinyin: 'wǒ xiǎng yào yī fèn mǐ fàn',
              english: 'I want a bowl of rice'
            }
          },
          {
            id: 'line9',
            translation: {
              chinese: '多少钱？',
              pinyin: 'duō shǎo qián?',
              english: 'How much does it cost?'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'doc3',
    title: {
      chinese: '购物',
      pinyin: 'gòu wù',
      english: 'Shopping'
    },
    sections: [
      {
        id: 'section4',
        title: {
          chinese: '买衣服',
          pinyin: 'mǎi yī fú',
          english: 'Buying Clothes'
        },
        lines: [
          {
            id: 'line10',
            translation: {
              chinese: '这件衣服多少钱？',
              pinyin: 'zhè jiàn yī fú duō shǎo qián?',
              english: 'How much is this piece of clothing?'
            }
          },
          {
            id: 'line11',
            translation: {
              chinese: '有没有小号的？',
              pinyin: 'yǒu méi yǒu xiǎo hào de?',
              english: 'Do you have a small size?'
            }
          },
          {
            id: 'line12',
            translation: {
              chinese: '我可以试穿吗？',
              pinyin: 'wǒ kě yǐ shì chuān ma?',
              english: 'Can I try it on?'
            }
          }
        ]
      }
    ]
  }
]; 