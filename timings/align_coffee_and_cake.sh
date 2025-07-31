#!/bin/bash

# Coffee and Cake Lesson - Forced Alignment Script
# This script runs ElevenLabs forced alignment on the coffee and cake lesson

echo "🚀 Starting forced alignment for Coffee and Cake lesson..."
echo "📁 Audio file: ../native/data/lessons/coffee_and_cake.mp3"
echo "📁 Lesson file: ../native/data/lessons/coffee_and_cake.json"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with your ELEVENLABS_API_KEY"
    echo "Example:"
    echo "ELEVENLABS_API_KEY=your_api_key_here"
    exit 1
fi

# Check if audio file exists
if [ ! -f "../native/data/lessons/coffee_and_cake.mp3" ]; then
    echo "❌ Error: Audio file not found at ../native/data/lessons/coffee_and_cake.mp3"
    exit 1
fi

# Check if lesson file exists
if [ ! -f "../native/data/lessons/coffee_and_cake.json" ]; then
    echo "❌ Error: Lesson file not found at ../native/data/lessons/coffee_and_cake.json"
    exit 1
fi

# Run forced alignment
echo "🔄 Calling ElevenLabs API for forced alignment..."
node forcedAlignment.js \
    --audio="../native/data/lessons/coffee_and_cake.mp3" \
    --lesson="../native/data/lessons/coffee_and_cake.json"

# Check if alignment was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Forced alignment completed successfully!"
    echo "📊 Results saved to: ../native/data/lessons/coffee_and_cake-alignment.json"
    echo "🐛 Debug info saved to: ../native/data/lessons/coffee_and_cake-debug.json"
    echo ""
    echo "🔄 Now updating lesson file with timing data..."
    
    # Run the update timings script
    node updateTimings_coffee_and_cake.js
    
    # Check if timing update was successful
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Complete! Coffee and Cake lesson is now ready with audio timings!"
        echo "📁 Final lesson file: ../native/data/lessons/coffee_and_cake.json"
        echo "📋 Backup available at: ../native/data/lessons/coffee_and_cake.json.backup"
        echo ""
        echo "🚀 You can now use this lesson in the ZiPop app with synchronized audio!"
    else
        echo ""
        echo "❌ Timing update failed. Check the lesson file manually."
        exit 1
    fi
else
    echo ""
    echo "❌ Forced alignment failed. Check the debug file for details."
    exit 1
fi 