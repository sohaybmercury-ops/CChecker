#!/bin/bash

echo "🏗️  Building AAB (App Bundle) for Calculator App..."

# Build and prepare
./build-mobile.sh

if [ $? -ne 0 ]; then
    echo "❌ Mobile build preparation failed!"
    exit 1
fi

# Build AAB
echo "📦 Building Android App Bundle (AAB)..."
cd android
./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo "✅ AAB build successful!"
    echo "📂 AAB location: android/app/build/outputs/bundle/release/app-release.aab"
else
    echo "❌ AAB build failed!"
    exit 1
fi