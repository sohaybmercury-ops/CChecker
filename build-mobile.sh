#!/bin/bash

echo "🚀 Building Calculator App for Android..."

# Build the web app
echo "📦 Building web application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed!"
    exit 1
fi

# Copy web assets to native platforms
echo "📋 Copying web assets to Capacitor..."
npx cap copy

# Sync with native platforms
echo "🔄 Syncing with native platforms..."
npx cap sync

echo "✅ Mobile build preparation complete!"
echo ""
echo "📱 To build APK (Debug):"
echo "   cd android && ./gradlew assembleDebug"
echo ""
echo "📱 To build APK (Release):"
echo "   cd android && ./gradlew assembleRelease"
echo ""
echo "📦 To build AAB (App Bundle):"
echo "   cd android && ./gradlew bundleRelease"
echo ""
echo "🔧 To open Android Studio:"
echo "   npx cap open android"
echo ""
echo "⚠️  Note: Android builds require Android SDK to be installed."
echo "📖 See BUILD_INSTRUCTIONS.md for detailed setup guide."
echo ""
echo "💡 For Replit users: Consider downloading the project"
echo "   and building locally with Android Studio installed."