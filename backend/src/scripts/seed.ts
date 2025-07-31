#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

// Import the existing data (we'll read from the native app's data directory)
const NATIVE_DATA_PATH = path.join(__dirname, '../../../native/data');
const LESSON_FILES_PATH = path.join(NATIVE_DATA_PATH, 'lessons');
const INDEX_FILE_PATH = path.join(NATIVE_DATA_PATH, 'index.json');

const prisma = new PrismaClient();

interface LessonFile {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  estimatedTime: number;
  content: any;
  vocabulary: any[];
  metadata: any;
  audio?: any;
}

interface IndexData {
  categories: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  levels: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  lessons: Array<{
    id: string;
    file: string;
    title: string;
    level: string;
    category: string;
    estimatedTime: number;
    featured: boolean;
    order: number;
  }>;
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Read the index file
    const indexContent = await fs.readFile(INDEX_FILE_PATH, 'utf-8');
    const indexData: IndexData = JSON.parse(indexContent);

    console.log('📂 Read index file with', indexData.lessons.length, 'lessons');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.content.deleteMany();
    await prisma.category.deleteMany();
    await prisma.level.deleteMany();

    // Seed categories
    console.log('📝 Seeding categories...');
    for (const category of indexData.categories) {
      await prisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          description: category.description,
        },
      });
    }

    // Seed levels
    console.log('📊 Seeding levels...');
    for (const level of indexData.levels) {
      await prisma.level.create({
        data: {
          id: level.id,
          name: level.name,
          description: level.description,
        },
      });
    }

    // Seed content
    console.log('📚 Seeding content...');
    for (const lessonRef of indexData.lessons) {
      try {
        // Read the lesson file
        const lessonFilePath = path.join(LESSON_FILES_PATH, path.basename(lessonRef.file));
        const lessonContent = await fs.readFile(lessonFilePath, 'utf-8');
        const lessonData: LessonFile = JSON.parse(lessonContent);

        console.log(`  📖 Processing content: ${lessonData.title}`);

        await prisma.content.create({
          data: {
            id: lessonData.id,
            title: lessonData.title,
            description: lessonData.description,
            levelId: lessonData.level,
            categoryId: lessonData.category,
            tags: lessonData.tags,
            estimatedTime: lessonData.estimatedTime,
            featured: lessonRef.featured,
            order: lessonRef.order,
            content: lessonData.content,
            vocabulary: lessonData.vocabulary,
            metadata: lessonData.metadata,
            audio: lessonData.audio || null,
          },
        });
      } catch (error) {
        console.error(`❌ Failed to process content ${lessonRef.id}:`, error);
        // Continue with other content items
      }
    }

    console.log('✅ Database seeding completed successfully!');

    // Print summary
    const [categoryCount, levelCount, contentCount] = await Promise.all([
      prisma.category.count(),
      prisma.level.count(),
      prisma.content.count(),
    ]);

    console.log('\n📊 Seeding Summary:');
    console.log(`  Categories: ${categoryCount}`);
    console.log(`  Levels: ${levelCount}`);
    console.log(`  Content: ${contentCount}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Also copy audio files to the backend
async function copyAudioFiles() {
  console.log('🎵 Copying audio files...');

  const sourceAudioPath = path.join(__dirname, '../../../native/assets/audio');
  const targetAudioPath = path.join(__dirname, '../../audio');

  try {
    // Create target directory if it doesn't exist
    await fs.mkdir(targetAudioPath, { recursive: true });

    // Read source directory
    const files = await fs.readdir(sourceAudioPath);
    
    for (const file of files) {
      if (file.endsWith('.mp3')) {
        const sourcePath = path.join(sourceAudioPath, file);
        const targetPath = path.join(targetAudioPath, file);
        
        await fs.copyFile(sourcePath, targetPath);
        console.log(`  🎵 Copied: ${file}`);
      }
    }

    console.log('✅ Audio files copied successfully!');
  } catch (error) {
    console.error('❌ Failed to copy audio files:', error);
    // Don't exit - this is not critical for basic functionality
  }
}

async function main() {
  await copyAudioFiles();
  await seedDatabase();
}

if (require.main === module) {
  main();
}