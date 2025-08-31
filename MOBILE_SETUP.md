# دليل إعداد التطبيق الجوال

هذا الدليل يوضح كيفية تشغيل وبناء التطبيق كتطبيق جوال باستخدام Capacitor.

## متطلبات النظام

### لبناء تطبيقات Android:
- Node.js 18+ 
- Android Studio مع Android SDK
- Java JDK 17+

### لبناء تطبيقات iOS:
- macOS
- Xcode 14+
- CocoaPods

## الأوامر المتاحة

### بناء التطبيق للويب
```bash
npm run build
```

### بناء ونسخ الملفات لـ Capacitor
```bash
npm run build
npx cap copy
npx cap sync
```

### تشغيل التطبيق على الأجهزة المحاكية

#### Android:
```bash
npm run build
npx cap copy android
npx cap open android
```

#### iOS:
```bash
npm run build
npx cap copy ios
npx cap open ios
```

### تشغيل التطبيق على الأجهزة الفعلية

#### Android:
```bash
npm run build
npx cap copy android
npx cap run android
```

#### iOS:
```bash
npm run build
npx cap copy ios
npx cap run ios
```

## إعداد البيئة

### إعداد Android Studio:
1. تثبيت Android Studio من الموقع الرسمي
2. فتح Android SDK Manager وتثبيت:
   - Android SDK Platform 33+
   - Android SDK Build-Tools
   - Android Emulator

### إعداد Xcode (macOS فقط):
1. تثبيت Xcode من App Store
2. تثبيت أدوات سطر الأوامر:
   ```bash
   xcode-select --install
   ```
3. تثبيت CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

## GitHub Actions

تم إعداد GitHub Actions لبناء التطبيقات تلقائياً عند:
- دفع الكود إلى فرع main أو master
- إنشاء Pull Request
- تشغيل يدوي من واجهة GitHub

### المخرجات:
- **Web Build**: ملفات الويب المجمعة
- **Android APK**: ملف التطبيق لأندرويد
- **iOS IPA**: ملف التطبيق لآيفون (يتطلب شهادات المطور)

## الميزات الجوالة المتاحة

### الاهتزاز (Haptic Feedback):
- اهتزاز خفيف عند الضغط على الأرقام
- اهتزاز متوسط عند الضغط على العمليات الحسابية

### شريط الحالة:
- تحكم في لون وأسلوب شريط الحالة
- تطبيق الألوان حسب موضوع التطبيق

### شاشة البداية:
- شاشة بداية مخصصة مع إعدادات قابلة للتخصيص
- إخفاء تلقائي بعد تحميل التطبيق

### لوحة المفاتيح:
- تحكم في سلوك لوحة المفاتيح
- تكيف واجهة المستخدم عند ظهور لوحة المفاتيح

### التخزين المحلي:
- استخدام التخزين الأصلي للجوال
- تراجع إلى localStorage في المتصفح

## حل المشاكل الشائعة

### مشكلة: لا يمكن العثور على Android SDK
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### مشكلة: فشل في بناء iOS
تأكد من:
- تثبيت CocoaPods: `pod install` في مجلد `ios/App`
- تحديث Xcode للإصدار الأحدث
- توفر شهادات المطور المناسبة

### مشكلة: التطبيق لا يتحديث
```bash
npx cap copy
npx cap sync
```

## التخصيص

### تغيير أيقونة التطبيق:
1. إضافة الأيقونات في المجلدات المناسبة:
   - Android: `android/app/src/main/res/`
   - iOS: `ios/App/App/Assets.xcassets/`

### تغيير شاشة البداية:
تعديل الإعدادات في `capacitor.config.ts`

### إضافة مكونات إضافية:
```bash
npm install @capacitor/[plugin-name]
npx cap sync
```

## الدعم

لأي مشاكل أو استفسارات، يرجى:
1. مراجعة الوثائق الرسمية لـ Capacitor
2. التحقق من ملفات السجل (logs)
3. فتح issue في مستودع GitHub