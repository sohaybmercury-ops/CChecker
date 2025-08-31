import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { keyStoreService } from "./keyStore";
import { insertAppSettingsSchema, insertApiKeySchema, insertKeyStoreSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // App Settings routes
  app.get("/api/app/settings", async (req, res) => {
    try {
      const settings = await storage.getAppSettings();
      res.json(settings || null);
    } catch (error) {
      console.error("Error getting app settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/app/settings", async (req, res) => {
    try {
      const validatedData = insertAppSettingsSchema.parse(req.body);
      const settings = await storage.setAppSettings(validatedData);
      res.status(201).json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating app settings:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/app/settings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertAppSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateAppSettings(id, updates);
      
      if (!settings) {
        return res.status(404).json({ error: "App settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating app settings:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // API Keys routes
  app.get("/api/keys", async (req, res) => {
    try {
      const keys = await storage.getAllApiKeys();
      res.json(keys);
    } catch (error) {
      console.error("Error getting API keys:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/keys", async (req, res) => {
    try {
      const validatedData = insertApiKeySchema.parse(req.body);
      const apiKey = await storage.createApiKey(validatedData);
      const { encryptedValue, ...safeKey } = apiKey;
      res.status(201).json(safeKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error creating API key:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/keys/:keyName/value", async (req, res) => {
    try {
      const { keyName } = req.params;
      const value = await storage.getApiKey(keyName);
      
      if (!value) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.json({ value });
    } catch (error) {
      console.error("Error getting API key value:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/keys/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertApiKeySchema.partial().parse(req.body);
      const apiKey = await storage.updateApiKey(id, updates);
      
      if (!apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      const { encryptedValue, ...safeKey } = apiKey;
      res.json(safeKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("Error updating API key:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.delete("/api/keys/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteApiKey(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Key Store routes  
  app.get("/api/secrets/:namespace", async (req, res) => {
    try {
      const { namespace } = req.params;
      const secrets = await storage.listSecrets(namespace);
      res.json(secrets);
    } catch (error) {
      console.error("Error listing secrets:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/secrets/:namespace/:key", async (req, res) => {
    try {
      const { namespace, key } = req.params;
      const value = await storage.getSecret(namespace, key);
      
      if (value === null) {
        return res.status(404).json({ error: "Secret not found" });
      }
      
      res.json({ value });
    } catch (error) {
      console.error("Error getting secret:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/secrets", async (req, res) => {
    try {
      const { namespace, key, value, valueType, metadata } = req.body;
      
      if (!namespace || !key || value === undefined || !valueType) {
        return res.status(400).json({ 
          error: "Missing required fields: namespace, key, value, valueType" 
        });
      }

      const secret = await storage.setSecret(namespace, key, value, valueType, metadata);
      const { encryptedValue, ...safeSecret } = secret;
      res.status(201).json(safeSecret);
    } catch (error) {
      console.error("Error creating secret:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/secrets/:namespace/:key", async (req, res) => {
    try {
      const { namespace, key } = req.params;
      const deleted = await storage.deleteSecret(namespace, key);
      
      if (!deleted) {
        return res.status(404).json({ error: "Secret not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting secret:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Environment info endpoint
  app.get("/api/app/info", async (req, res) => {
    try {
      const appInfo = {
        appId: process.env.REPL_ID || 'local-dev',
        environment: process.env.NODE_ENV || 'development',
        domain: process.env.REPLIT_DEV_DOMAIN || 'localhost:5000',
        version: '1.0.0',
        features: {
          keyStore: true,
          apiKeys: true,
          encryption: true,
          calculator: true
        }
      };
      
      res.json(appInfo);
    } catch (error) {
      console.error("Error getting app info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
