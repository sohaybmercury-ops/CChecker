# تعليمات بناء ملف AAB

## المتطلبات:
1. Android Studio مثبت على جهازك
2. Java JDK 8 أو أحدث
3. Node.js و npm

## خطوات البناء:

### 1. تحضير المشروع:
```bash
npm install
npm run build
npx cap sync android
```

### 2. فتح المشروع في Android Studio:
```bash
npx cap open android
```

### 3. بناء AAB من Android Studio:
- اذهب إلى: Build → Generate Signed Bundle / APK
- اختر "Android App Bundle"
- أنشئ keystore جديد أو استخدم موجود
- اختر "release" build variant
- اضغط "Finish"

### 4. بناء من سطر الأوامر (بديل):
```bash
cd android
./gradlew bundleRelease
```

سيتم إنشاء ملف AAB في:
`android/app/build/outputs/bundle/release/app-release.aab`

## ملاحظات:
- تأكد من تعيين ANDROID_HOME في متغيرات البيئة
- قم بتوقيع التطبيق بـ keystore للنشر في Google Play
- التطبيق يحتوي على جميع الإصلاحات: أيقونات صحيحة، ألوان خضراء، شريط علوي أسود

## ملفات مهمة تم إصلاحها:
- `android/app/src/main/res/values/styles.xml` - إعدادات الشريط العلوي
- `android/app/src/main/res/values/colors.xml` - الألوان الخضراء
- `capacitor.config.ts` - إعدادات التطبيق
- `client/src/index.css` - ألوان الواجهة الخضراء