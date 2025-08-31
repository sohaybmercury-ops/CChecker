# Building APK and AAB Files

Your calculator app is now configured for Android builds! Here's how to build APK and AAB files:

## Prerequisites

Since Android builds require the Android SDK, you have a few options:

### Option 1: Build Locally (Recommended)
1. **Download the project** to your local machine
2. **Install Android Studio** from https://developer.android.com/studio
3. **Install Node.js** if not already installed
4. **Run the build commands** below

### Option 2: Use GitHub Actions (Automated)
The project already includes GitHub Actions configuration that can build your app automatically when you push to GitHub.

## Build Commands

Once you have the prerequisites installed locally:

```bash
# Make scripts executable (if needed)
chmod +x build-mobile.sh build-apk.sh build-aab.sh

# Build APK (Debug)
./build-apk.sh

# Build AAB (Release)
./build-aab.sh

# Or run individual commands:
npm run build                    # Build web app
npx cap copy                     # Copy to native platforms
npx cap sync                     # Sync with native platforms
cd android && ./gradlew assembleDebug    # Build APK
cd android && ./gradlew bundleRelease    # Build AAB
```

## Build Outputs

After successful builds, you'll find:
- **APK files** in: `android/app/build/outputs/apk/debug/` or `android/app/build/outputs/apk/release/`
- **AAB files** in: `android/app/build/outputs/bundle/release/`

## App Configuration

Your app is configured with:
- **App ID**: com.calculator.app
- **App Name**: Calculator
- **Version**: 1.0.0
- **Features**: Calculator, Key Management, Dark Theme

## Publishing

### Google Play Store (AAB)
1. Build the AAB file: `./build-aab.sh`
2. Upload the AAB file to Google Play Console
3. Follow Google Play publishing guidelines

### Direct Installation (APK)
1. Build the APK file: `./build-apk.sh`
2. Install directly on Android devices
3. Enable "Install from unknown sources" on target devices

## Troubleshooting

If you encounter build issues:
1. Ensure Android Studio is properly installed
2. Set ANDROID_HOME environment variable
3. Accept Android SDK licenses: `sdkmanager --licenses`
4. Run `npx cap doctor` to check configuration

## Cloud Building Services

Consider using services like:
- **Expo Application Services (EAS)**
- **App Center** by Microsoft
- **Bitrise**
- **GitHub Actions** with Android build environment

These services can build your APK/AAB files without requiring local Android SDK installation.