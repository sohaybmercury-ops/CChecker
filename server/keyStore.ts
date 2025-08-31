import crypto from 'crypto';
import type { ApiKey, KeyStore, InsertApiKey, InsertKeyStore, AppSettings, InsertAppSettings } from '@shared/schema';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

export interface IKeyStoreService {
  // App Settings
  getAppSettings(): Promise<AppSettings | null>;
  setAppSettings(settings: InsertAppSettings): Promise<AppSettings>;
  updateAppSettings(id: string, updates: Partial<InsertAppSettings>): Promise<AppSettings | null>;
  
  // API Keys
  createApiKey(key: InsertApiKey): Promise<ApiKey>;
  getApiKey(keyName: string): Promise<string | null>;
  getAllApiKeys(): Promise<Omit<ApiKey, 'encryptedValue'>[]>;
  updateApiKey(id: string, updates: Partial<InsertApiKey>): Promise<ApiKey | null>;
  deleteApiKey(id: string): Promise<boolean>;
  
  // Key Store
  setSecret(namespace: string, key: string, value: any, valueType: string, metadata?: any): Promise<KeyStore>;
  getSecret(namespace: string, key: string): Promise<any>;
  deleteSecret(namespace: string, key: string): Promise<boolean>;
  listSecrets(namespace: string): Promise<Omit<KeyStore, 'encryptedValue'>[]>;
}

export class MemKeyStoreService implements IKeyStoreService {
  private appSettings: AppSettings | null = null;
  private apiKeys = new Map<string, ApiKey>();
  private keyStore = new Map<string, KeyStore>();

  constructor() {
    this.initializeApp();
  }

  private async initializeApp() {
    // Initialize with app ID from environment
    const replId = process.env.REPL_ID || crypto.randomUUID();
    const appName = process.env.APP_NAME || 'Calculator App';
    
    if (!this.appSettings) {
      this.appSettings = {
        id: crypto.randomUUID(),
        appId: replId,
        appName,
        description: 'A modern calculator application with key management',
        isActive: true,
        metadata: {
          environment: process.env.NODE_ENV || 'development',
          domain: process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  // Encryption utilities
  private encrypt(text: string): string {
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    try {
      const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      const decipher = crypto.createDecipher(ALGORITHM, key);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt value');
    }
  }

  // App Settings methods
  async getAppSettings(): Promise<AppSettings | null> {
    return this.appSettings;
  }

  async setAppSettings(settings: InsertAppSettings): Promise<AppSettings> {
    this.appSettings = {
      id: crypto.randomUUID(),
      ...settings,
      description: settings.description ?? null,
      isActive: settings.isActive ?? true,
      metadata: settings.metadata ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return this.appSettings;
  }

  async updateAppSettings(id: string, updates: Partial<InsertAppSettings>): Promise<AppSettings | null> {
    if (this.appSettings && this.appSettings.id === id) {
      this.appSettings = {
        ...this.appSettings,
        ...updates,
        description: updates.description !== undefined ? updates.description : this.appSettings.description,
        isActive: updates.isActive !== undefined ? updates.isActive : this.appSettings.isActive,
        metadata: updates.metadata !== undefined ? updates.metadata : this.appSettings.metadata,
        updatedAt: new Date()
      };
      return this.appSettings;
    }
    return null;
  }

  // API Keys methods
  async createApiKey(key: InsertApiKey): Promise<ApiKey> {
    const id = crypto.randomUUID();
    const encryptedValue = this.encrypt(key.encryptedValue);
    
    const apiKey: ApiKey = {
      id,
      ...key,
      description: key.description ?? null,
      isActive: key.isActive ?? true,
      expiresAt: key.expiresAt ?? null,
      encryptedValue,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async getApiKey(keyName: string): Promise<string | null> {
    const keys: ApiKey[] = [];
    this.apiKeys.forEach(apiKey => keys.push(apiKey));
    
    const foundKey = keys.find(apiKey => apiKey.keyName === keyName && apiKey.isActive);
    if (foundKey) {
      return this.decrypt(foundKey.encryptedValue);
    }
    return null;
  }

  async getAllApiKeys(): Promise<Omit<ApiKey, 'encryptedValue'>[]> {
    const keys: Omit<ApiKey, 'encryptedValue'>[] = [];
    this.apiKeys.forEach(({ encryptedValue, ...key }) => {
      keys.push(key);
    });
    return keys;
  }

  async updateApiKey(id: string, updates: Partial<InsertApiKey>): Promise<ApiKey | null> {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) return null;

    const updatedKey: ApiKey = {
      ...apiKey,
      ...updates,
      encryptedValue: updates.encryptedValue ? this.encrypt(updates.encryptedValue) : apiKey.encryptedValue,
      updatedAt: new Date()
    };

    this.apiKeys.set(id, updatedKey);
    return updatedKey;
  }

  async deleteApiKey(id: string): Promise<boolean> {
    return this.apiKeys.delete(id);
  }

  // Key Store methods
  async setSecret(namespace: string, key: string, value: any, valueType: string, metadata?: any): Promise<KeyStore> {
    const id = crypto.randomUUID();
    const storeKey = `${namespace}:${key}`;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const encryptedValue = this.encrypt(stringValue);

    const keyStoreEntry: KeyStore = {
      id,
      namespace,
      key,
      encryptedValue,
      valueType,
      metadata: metadata || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.keyStore.set(storeKey, keyStoreEntry);
    return keyStoreEntry;
  }

  async getSecret(namespace: string, key: string): Promise<any> {
    const storeKey = `${namespace}:${key}`;
    const entry = this.keyStore.get(storeKey);
    
    if (!entry) return null;

    const decryptedValue = this.decrypt(entry.encryptedValue);
    
    switch (entry.valueType) {
      case 'json':
        return JSON.parse(decryptedValue);
      case 'number':
        return parseFloat(decryptedValue);
      case 'string':
      default:
        return decryptedValue;
    }
  }

  async deleteSecret(namespace: string, key: string): Promise<boolean> {
    const storeKey = `${namespace}:${key}`;
    return this.keyStore.delete(storeKey);
  }

  async listSecrets(namespace: string): Promise<Omit<KeyStore, 'encryptedValue'>[]> {
    const secrets: Omit<KeyStore, 'encryptedValue'>[] = [];
    this.keyStore.forEach((entry) => {
      if (entry.namespace === namespace) {
        const { encryptedValue, ...secretEntry } = entry;
        secrets.push(secretEntry);
      }
    });
    return secrets;
  }
}

// Global instance
export const keyStoreService = new MemKeyStoreService();