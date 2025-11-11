import type { Express } from "express";
import { storage } from "./storage.js";
import { insertExampleSchema } from "../shared/schema.js";

export function registerRoutes(app: Express) {
  app.get("/api/examples", async (req, res) => {
    const examples = await storage.getExamples();
    res.json(examples);
  });

  app.post("/api/examples", async (req, res) => {
    try {
      const data = insertExampleSchema.parse(req.body);
      const example = await storage.createExample(data);
      res.json(example);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });
}
