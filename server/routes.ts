import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { insertArticleSchema, insertContactSchema } from "../shared/schema";
import path from "path";
import fs from "fs";
import multer from "multer";
import express from "express";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `cover-${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."));
    }
  },
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\u0621-\u064Aa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.use("/uploads", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  }, express.static(uploadDir));

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/articles", async (req, res) => {
    try {
      const { status, tag, search, page, limit } = req.query;
      const result = await storage.getArticles({
        status: status as string,
        tag: tag as string,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 9,
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/tags", async (req, res) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      await storage.incrementViewCount(article.id);
      
      const relatedArticles = await storage.getRelatedArticles(
        article.id,
        article.tags || [],
        3
      );
      
      res.json({ article, relatedArticles });
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/admin/articles", isAuthenticated, isAdmin, upload.single("coverImage"), async (req, res) => {
    try {
      const body = JSON.parse(req.body.data || "{}");
      
      let slug = body.slug || generateSlug(body.title);
      
      const existingArticle = await storage.getArticleBySlug(slug);
      if (existingArticle) {
        slug = `${slug}-${Date.now()}`;
      }
      
      const articleData = {
        ...body,
        slug,
        coverImage: req.file ? `/uploads/${req.file.filename}` : body.coverImage,
        tags: body.tags || [],
      };
      
      const validatedData = insertArticleSchema.parse(articleData);
      const article = await storage.createArticle(validatedData);
      res.status(201).json(article);
    } catch (error: any) {
      console.error("Error creating article:", error);
      res.status(400).json({ message: error.message || "Failed to create article" });
    }
  });

  app.get("/api/admin/articles", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { page, limit, status, search } = req.query;
      const result = await storage.getArticles({
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching admin articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/admin/articles/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const article = await storage.getArticleById(parseInt(req.params.id));
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.put("/api/admin/articles/:id", isAuthenticated, isAdmin, upload.single("coverImage"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const body = JSON.parse(req.body.data || "{}");
      
      const existingArticle = await storage.getArticleById(id);
      if (!existingArticle) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      const articleData: any = {
        ...body,
        tags: body.tags || [],
      };
      
      if (req.file) {
        articleData.coverImage = `/uploads/${req.file.filename}`;
      }
      
      const article = await storage.updateArticle(id, articleData);
      res.json(article);
    } catch (error: any) {
      console.error("Error updating article:", error);
      res.status(400).json({ message: error.message || "Failed to update article" });
    }
  });

  app.delete("/api/admin/articles/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteArticle(id);
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  app.post("/api/admin/upload", isAuthenticated, isAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      res.json({ url: `/uploads/${req.file.filename}` });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContactSubmission(validatedData);
      res.status(201).json({ message: "تم إرسال رسالتك بنجاح", contact });
    } catch (error: any) {
      console.error("Error creating contact submission:", error);
      res.status(400).json({ message: error.message || "فشل في إرسال الرسالة" });
    }
  });

  app.get("/api/admin/contacts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { page, limit, isRead } = req.query;
      const result = await storage.getContactSubmissions({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        isRead: isRead as string,
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.patch("/api/admin/contacts/:id/read", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.markContactAsRead(id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error marking contact as read:", error);
      res.status(500).json({ message: "Failed to mark contact as read" });
    }
  });

  app.delete("/api/admin/contacts/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContact(id);
      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
