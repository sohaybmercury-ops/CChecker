# إعداد التطبيق الجوال - حاسبة React مع Capacitor

## نظرة عامة
تم تحويل تطبيق الحاسبة بنجاح إلى تطبيق جوال باستخدام Capacitor مع إمكانيات العمل بدون إنترنت والبناء التلقائي عبر GitHub Actions.

## الميزات المطبقة
- ✅ تطبيق جوال لمنصات iOS و Android
- ✅ إمكانية العمل بدون إنترنت (PWA)
- ✅ ميزات جوالة متقدمة (اهتزاز، تحسينات تفاعلية)
- ✅ بناء تلقائي عبر GitHub Actions
- ✅ توقيع APK باستخدام keystore بدون GitHub secrets

## ملفات التكوين الرئيسية

### 1. Capacitor Config (`capacitor.config.ts`)
```typescript
{
  appId: 'com.example.calculator',
  appName: 'Calculator App',
  webDir: 'dist/public',
  // إعدادات إضافية للجوال
}
```

### 2. Android Build Config (`android/app/build.gradle`)
- إعدادات التوقيع مضمنة مباشرة في الملف
- يستخدم keystore محلي بدون GitHub secrets
- يبني نسختين: debug و release موقعة

### 3. GitHub Actions (`.github/workflows/mobile-build.yml`)
- بناء تلقائي لتطبيقات الويب والجوال
- رفع ملفات APK وملفات iOS

## الميزات الجوالة

### Service Worker للعمل بدون إنترنت
```javascript
// client/public/sw.js
- تخزين مؤقت للموارد الأساسية
- عمل بدون إنترنت للحاسبة
- تحديث تلقائي للمحتوى
```

### ميزات الاهتزاز والتفاعل
```typescript
// client/src/lib/mobile.ts
- اهتزاز عند الضغط على الأزرار
- تحسينات للمس والتفاعل
- دعم إيماءات الجوال
```

## إعدادات التوقيع

### Keystore المحلي
```
ملف: android/signing.keystore
- مضمن في المشروع مباشرة
- لا يتطلب GitHub secrets
- يعمل تلقائياً في CI/CD
```

### معلومات التوقيع
```
Key Alias: my-key-alias
Store Password: rOhg6wD9Z2Vv
Key Password: rOhg6wD9Z2Vv
```

## أوامر البناء

### بناء محلي
```bash
# بناء تطبيق الويب
npm run build

# نسخ للجوال
npx cap copy android
npx cap copy ios

# بناء Android (يتطلب Android SDK)
cd android
./gradlew assembleDebug
./gradlew assembleRelease
```

### بناء iOS
```bash
npx cap sync ios
cd ios/App
pod install
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug
```

## GitHub Actions - البناء التلقائي

### مراحل البناء
1. **بناء الويب**: بناء تطبيق React
2. **بناء Android**: إنشاء APK موقع
3. **بناء iOS**: إنشاء تطبيق iOS

### ملفات الإخراج
- `android-apk-debug`: نسخة تطوير
- `android-apk-release-signed`: نسخة إنتاج موقعة
- `ios-app`: تطبيق iOS

## الأمان والتوقيع

### استراتيجية الأمان
- Keystore مضمن في المشروع
- لا توجد أسرار في GitHub secrets
- التوقيع يتم تلقائياً في CI/CD

⚠️ **ملاحظة هامة**: في بيئة الإنتاج الحقيقية، يُنصح بتخزين keystore و كلمات المرور بشكل آمن منفصل عن الكود.

## نشر التطبيق

### Google Play Store
1. استخدم ملف APK من `android-apk-release-signed`
2. ارفع إلى Google Play Console
3. اتبع عملية المراجعة

### Apple App Store
1. استخدم ملف iOS المبني
2. ارفع عبر Xcode أو Application Loader
3. اتبع عملية مراجعة Apple

## استكشاف الأخطاء

### مشاكل شائعة
- **Java not found**: تأكد من تثبيت JDK 17
- **Android SDK missing**: قم بتثبيت Android Studio
- **Keystore errors**: تحقق من مسار وكلمات مرور keystore

### لوجز البناء
راجع GitHub Actions logs لتفاصيل أي أخطاء في البناء.

## التطوير المستقبلي

### تحسينات مقترحة
- إضافة إشعارات push
- تحسين الأداء
- ميزات إضافية خاصة بالجوال
- تحديث التصميم للجوال

---

تم إنجاز التحويل بنجاح! التطبيق الآن جاهز للنشر كتطبيق جوال على المتاجر الرسمية.