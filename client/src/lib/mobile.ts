import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';

export class MobileUtils {
  static isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  static getPlatform(): string {
    return Capacitor.getPlatform();
  }

  static getApiBaseUrl(): string {
    // In development mode for Capacitor, use the Replit URL
    if (this.isNativePlatform()) {
      const replitHost = window.location.hostname;
      return `https://${replitHost}`;
    }
    // For web, use relative URLs
    return '';
  }

  static getApiUrl(endpoint: string): string {
    const baseUrl = this.getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }

  static async initializeApp(): Promise<void> {
    if (!this.isNativePlatform()) return;

    try {
      // Initialize status bar
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#1a1a1a' });

      // Hide splash screen
      await SplashScreen.hide();

      // Configure keyboard
      Keyboard.addListener('keyboardWillShow', () => {
        document.body.classList.add('keyboard-open');
      });

      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-open');
      });

    } catch (error) {
      console.error('Error initializing mobile app:', error);
    }
  }

  static async triggerHaptic(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
    if (!this.isNativePlatform()) return;

    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }

  static async hideKeyboard(): Promise<void> {
    if (!this.isNativePlatform()) return;

    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Error hiding keyboard:', error);
    }
  }

  static async setStatusBarStyle(isDark: boolean): Promise<void> {
    if (!this.isNativePlatform()) return;

    try {
      await StatusBar.setStyle({ 
        style: isDark ? Style.Light : Style.Dark 
      });
      await StatusBar.setBackgroundColor({ 
        color: isDark ? '#1a1a1a' : '#ffffff' 
      });
    } catch (error) {
      console.error('Error setting status bar style:', error);
    }
  }
}

// Utility for checking screen mode
export const useViewport = () => {
  const getViewport = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
  });

  return getViewport();
};

// Functions for handling local storage
export class MobileStorage {
  static async set(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  }

  static async get(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      const result = await Preferences.get({ key });
      return result.value;
    } else {
      return localStorage.getItem(key);
    }
  }

  static async remove(key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  static async clear(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  }
}