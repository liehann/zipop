---
description: 
globs: mobile/**
alwaysApply: false
---
# NPX Commands with Java 17

## Environment Setup for NPX
When suggesting or running npx commands (especially for React Native, Gradle, or Android builds), **always** set both Java 17 and Android SDK environments:

```bash
export ANDROID_HOME=/Users/liehann/Library/Android/sdk
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home
npx [command]
```

Or use env command for single-line execution:

```bash
env ANDROID_HOME=/Users/liehann/Library/Android/sdk JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home npx [command]
```

This ensures compatibility with Gradle and Android tooling while allowing the system to use Java 24 for other tasks. 