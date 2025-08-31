#!/bin/bash

echo "🏗️  Building APK for Calculator App..."

# Build and prepare
./build-mobile.sh

if [ $? -ne 0 ]; then
    echo "❌ Mobile build preparation failed!"
    exit 1
fi

# Build APK
echo "📱 Building APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ APK build successful!"
    echo "📂 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ APK build failed!"
    exit 1
fi