import { useState, useEffect } from 'react';

// إدارة Service Worker
export class OfflineManager {
  private static instance: OfflineManager;
  private serviceWorker: ServiceWorker | null = null;
  private updateAvailable = false;

  private constructor() {}

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  // تسجيل Service Worker
  public async register(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration.scope);

        // فحص التحديثات
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Update available');
                this.updateAvailable = true;
                // يمكن إظهار إشعار للمستخدم هنا
                this.notifyUpdateAvailable();
              }
            });
          }
        });

        // التعامل مع التحكم في الصفحة
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker controller changed');
          window.location.reload();
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    } else {
      console.log('Service Worker not supported');
    }
  }

  // تطبيق التحديث
  public async applyUpdate(): Promise<void> {
    if (this.updateAvailable && this.serviceWorker) {
      this.serviceWorker.postMessage({ action: 'SKIP_WAITING' });
    }
  }

  // إشعار بوجود تحديث
  private notifyUpdateAvailable(): void {
    // يمكن إضافة منطق إظهار Toast أو Modal هنا
    console.log('إشعار: يتوفر تحديث جديد للتطبيق');
  }

  // مسح التخزين المؤقت
  public async clearCache(): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          console.log('Cache cleared:', event.data);
          resolve();
        };
        navigator.serviceWorker.controller!.postMessage(
          { action: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });
    }
  }
}

// Hook لحالة الاتصال
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    function updateOnlineStatus() {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setWasOffline(true);
      }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return { isOnline, wasOffline };
}

// Hook لإدارة Service Worker
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      OfflineManager.getInstance().register().then(() => {
        setIsRegistered(true);
      });
    }
  }, []);

  const applyUpdate = async () => {
    await OfflineManager.getInstance().applyUpdate();
  };

  const clearCache = async () => {
    await OfflineManager.getInstance().clearCache();
  };

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    applyUpdate,
    clearCache
  };
}

// تخزين البيانات محلياً
export class OfflineStorage {
  private static DB_NAME = 'CalculatorDB';
  private static DB_VERSION = 1;
  private static STORE_NAME = 'calculations';

  // حفظ البيانات في IndexedDB
  public static async saveCalculation(calculation: {
    expression: string;
    result: string;
    timestamp: number;
  }): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      await store.add(calculation);
    } catch (error) {
      console.error('Error saving calculation:', error);
      // التراجع إلى localStorage
      const calculations = this.getCalculationsFromLocalStorage();
      calculations.push(calculation);
      localStorage.setItem('calculations', JSON.stringify(calculations.slice(-50))); // احتفظ بآخر 50 عملية
    }
  }

  // استرداد البيانات من IndexedDB
  public static async getCalculations(): Promise<any[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting calculations:', error);
      // التراجع إلى localStorage
      return this.getCalculationsFromLocalStorage();
    }
  }

  // فتح قاعدة البيانات
  private static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // التراجع إلى localStorage
  private static getCalculationsFromLocalStorage(): any[] {
    try {
      const stored = localStorage.getItem('calculations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // مسح البيانات المحفوظة
  public static async clearAllData(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      await store.clear();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
    
    // مسح localStorage أيضاً
    localStorage.removeItem('calculations');
  }
}