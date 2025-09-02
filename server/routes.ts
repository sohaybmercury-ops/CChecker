import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCalculatorHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Calculator History Routes
  
  // GET /api/calculator/history - Get all calculator history
  app.get("/api/calculator/history", async (req, res) => {
    try {
      const history = await storage.getCalculatorHistory();
      res.json(history);
    } catch (error) {
      console.error("Error getting calculator history:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST /api/calculator/history - Add calculation to history
  app.post("/api/calculator/history", async (req, res) => {
    try {
      const validatedData = insertCalculatorHistorySchema.parse(req.body);
      const history = await storage.addCalculatorHistory(validatedData);
      res.status(201).json(history);
    } catch (error) {
      console.error("Error adding calculator history:", error);
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid request data", details: (error as any).issues });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // DELETE /api/calculator/history - Clear all calculator history
  app.delete("/api/calculator/history", async (req, res) => {
    try {
      await storage.clearCalculatorHistory();
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing calculator history:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
