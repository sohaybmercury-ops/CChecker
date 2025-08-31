const CACHE_NAME = 'calculator-app-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// الملفات التي نريد تخزينها مؤقتاً
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.log('Service Worker: Error caching static files', error);
      })
  );
  
  // فرض التفعيل الفوري للـ Service Worker
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // حذف التخزين المؤقت القديم
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // السيطرة على جميع العملاء فوراً
  self.clients.claim();
});

// التعامل مع طلبات الشبكة
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // تجاهل طلبات non-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // تجاهل طلبات Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // إذا وُجد في التخزين المؤقت، قم بإرجاعه
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', request.url);
          return cachedResponse;
        }
        
        // محاولة جلب من الشبكة وتخزين النتيجة
        return fetch(request)
          .then((response) => {
            // تحقق من صحة الاستجابة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // نسخ الاستجابة لأنها stream ولا يمكن استخدامها مرتين
            const responseToCache = response.clone();
            
            // تخزين الاستجابة في التخزين المؤقت الديناميكي
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                console.log('Service Worker: Caching new resource', request.url);
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.log('Service Worker: Fetch failed', error);
            
            // إذا كان طلب HTML، قم بإرجاع صفحة offline
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // للطلبات الأخرى، يمكن إرجاع استجابة افتراضية
            return new Response('Offline - البيانات غير متاحة حالياً', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain; charset=UTF-8'
              })
            });
          });
      })
  );
});

// التعامل مع رسائل من التطبيق الرئيسي
self.addEventListener('message', (event) => {
  if (event.data.action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
  
  if (event.data.action === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({
        success: true,
        message: 'تم مسح التخزين المؤقت بنجاح'
      });
    });
  }
});

// إشعار عند تحديث التطبيق
self.addEventListener('message', (event) => {
  if (event.data.action === 'CHECK_UPDATE') {
    // يمكن إضافة منطق فحص التحديثات هنا
    event.ports[0].postMessage({
      hasUpdate: false,
      version: CACHE_NAME
    });
  }
});