import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, hashPassword } from "./auth";
import { insertArticleSchema, insertContactSchema, insertUserSchema, insertTrialSchema } from "../shared/schema";
import { sendContactNotificationEmail } from "./email";
import path from "path";
import fs from "fs";
import multer from "multer";
import express from "express";
import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";

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

const htmlUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/html" || file.originalname.endsWith(".html") || file.originalname.endsWith(".htm")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only HTML files are allowed."));
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
      const { passwordHash: _, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const { password, ...userData } = validatedData;
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
      }
      
      const passwordHash = await hashPassword(password);
      const user = await storage.upsertUser({
        ...userData,
        passwordHash,
      });
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: error.message || "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { password, email, firstName, lastName, isAdmin: isAdminFlag } = req.body;
      
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userData: any = {};
      if (email !== undefined) userData.email = String(email).toLowerCase().trim();
      if (firstName !== undefined) userData.firstName = firstName;
      if (lastName !== undefined) userData.lastName = lastName;
      if (isAdminFlag !== undefined) userData.isAdmin = isAdminFlag === true || isAdminFlag === "true" ? "true" : "false";
      if (password && password.length >= 6) {
        userData.passwordHash = await hashPassword(password);
      }
      
      const updated = await storage.updateUser(id, userData);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { passwordHash: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: error.message || "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const currentUser = (req as any).user;
      if (currentUser.id === id) {
        return res.status(400).json({ message: "لا يمكنك حذف حسابك الخاص" });
      }
      
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
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

  app.post("/api/admin/articles/parse-html", isAuthenticated, isAdmin, htmlUpload.single("htmlFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "يرجى رفع ملف HTML" });
      }

      const htmlContent = req.file.buffer.toString("utf-8");
      const $ = cheerio.load(htmlContent);

      // Extract meta information BEFORE removing elements
      const title = $("title").text().trim() || $("h1").first().text().trim() || "";
      const h1Text = $("h1").first().text().trim();
      const metaDescription = $('meta[name="description"]').attr("content") || "";
      const metaKeywords = $('meta[name="keywords"]').attr("content") || "";
      const ogTitle = $('meta[property="og:title"]').attr("content") || "";
      const ogDescription = $('meta[property="og:description"]').attr("content") || "";
      const ogImage = $('meta[property="og:image"]').attr("content") || "";
      const canonicalUrl = $('link[rel="canonical"]').attr("href") || "";
      const robotsMeta = $('meta[name="robots"]').attr("content") || "";
      
      // Get first image before removing elements
      let firstImage = ogImage || "";
      if (!firstImage) {
        const imgSrc = $("img").first().attr("src") || "";
        if (imgSrc) {
          firstImage = imgSrc;
        }
      }
      
      // ======== HYBRID APPROACH: Find content area, then clean within it ========
      
      // 1. Remove dangerous elements GLOBALLY (never content)
      $("script, style, noscript, object, embed, iframe").remove();
      $("link, meta, base, head, title").remove();
      
      // 2. Remove event handlers from all elements
      $("*").each((_, el) => {
        const element = $(el);
        const attribs = element.attr();
        if (attribs) {
          Object.keys(attribs).forEach(attr => {
            if (attr.startsWith("on") || (attr === "href" && (element.attr("href") || "").startsWith("javascript:"))) {
              element.removeAttr(attr);
            }
          });
        }
      });
      
      // 3. Try to find content area using extended selector list
      const contentSelectors = [
        "article", "main", "[role='main']",
        ".content", ".article-content", ".post-content", ".entry-content",
        ".blog-content", ".article-body", ".post-body", ".main-content",
        ".page-content", ".single-content", ".story-content", ".text-content",
        ".hentry", ".post", ".entry",
        "#content", "#main", "#article", "#post", "#main-content", "#page-content"
      ];
      
      let contentArea = $(contentSelectors.join(", ")).first();
      
      // If no content area found, use body WITHOUT deleting headers (they may contain title)
      if (contentArea.length === 0) {
        // Only remove navigation-specific elements, NOT headers/footers (which may be article content)
        $("body > nav, body > .nav, body > .navbar, body > .navigation").remove();
        $("body > aside, body > .sidebar").remove();
        contentArea = $("body");
      }
      
      // 4. Remove chrome WITHIN the content area (safe - doesn't affect article headers)
      contentArea.find("nav, .nav, .navbar, .navigation, .menu").remove();
      contentArea.find(".sidebar, .widget, .widgets").remove();
      contentArea.find(".comments, .comment-section, .comment-list, #comments").remove();
      contentArea.find(".share-buttons, .social-share, .sharing, .share-this").remove();
      contentArea.find(".related-posts, .related, .author-box, .bio").remove();
      contentArea.find(".advertisement, .ad, .ads, .advert, .sponsor, .banner").remove();
      contentArea.find(".pagination, .pager, .page-links, .post-navigation").remove();
      contentArea.find(".cookie, .popup, .modal, .overlay, .newsletter, .subscribe").remove();
      contentArea.find("form, input, button, select, textarea").remove();
      
      // 5. Get the content (includes all remaining HTML with images)
      let content = contentArea.html() || "";
      
      // Minimal cleanup - only normalize whitespace
      content = content.trim();
      
      // Extract first paragraph text for excerpt
      const firstParagraphText = $("p").first().text().trim().replace(/\s+/g, " ");
      const excerpt = firstParagraphText.substring(0, 200);
      
      // Parse robots directive
      let robotsDirective = "index, follow";
      if (robotsMeta) {
        const lower = robotsMeta.toLowerCase();
        if (lower.includes("noindex") && lower.includes("nofollow")) {
          robotsDirective = "noindex, nofollow";
        } else if (lower.includes("noindex")) {
          robotsDirective = "noindex, follow";
        } else if (lower.includes("nofollow")) {
          robotsDirective = "index, nofollow";
        }
      }
      
      // Extract plain text from content for word count and keyword analysis
      const plainText = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
      const readingTime = Math.ceil(wordCount / 200);
      
      const words = plainText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const wordFreq: Record<string, number> = {};
      words.forEach(w => {
        const clean = w.replace(/[^\u0621-\u064Aa-z]/g, "");
        if (clean.length > 3) {
          wordFreq[clean] = (wordFreq[clean] || 0) + 1;
        }
      });
      const sortedWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
      const suggestedKeywords = sortedWords.slice(0, 5).map(([word]) => word).join(", ");

      res.json({
        title: h1Text || title,
        metaTitle: title,
        content,
        excerpt,
        metaDescription: metaDescription || excerpt.substring(0, 160),
        metaKeywords: metaKeywords || suggestedKeywords,
        ogTitle,
        ogDescription,
        ogImage: firstImage,
        canonicalUrl,
        robotsDirective,
        readingTime: `${readingTime} دقيقة`,
        focusKeyword: sortedWords.length > 0 ? sortedWords[0][0] : "",
      });
    } catch (error: any) {
      console.error("Error parsing HTML:", error);
      res.status(400).json({ message: error.message || "فشل في تحليل ملف HTML" });
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
      
      let finalStatus = body.status || "draft";
      let scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
      let publishedAt = null;
      
      const now = new Date();
      
      if (finalStatus === "draft") {
        scheduledAt = null;
        publishedAt = null;
      } else if (scheduledAt && scheduledAt > now) {
        finalStatus = "scheduled";
        publishedAt = null;
      } else if (finalStatus === "published" || finalStatus === "scheduled" || (scheduledAt && scheduledAt <= now)) {
        finalStatus = "published";
        publishedAt = now;
        scheduledAt = null;
      }
      
      const articleData = {
        ...body,
        slug,
        status: finalStatus,
        scheduledAt,
        publishedAt,
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
      
      let finalStatus = body.status || existingArticle.status;
      let scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
      let existingPublishedAt = (existingArticle as any).publishedAt || null;
      let publishedAt = null;
      
      const now = new Date();
      
      if (finalStatus === "draft") {
        finalStatus = "draft";
        scheduledAt = null;
        publishedAt = null;
      } else if (scheduledAt && scheduledAt > now) {
        finalStatus = "scheduled";
        publishedAt = null;
      } else if (finalStatus === "published" || finalStatus === "scheduled" || (scheduledAt && scheduledAt <= now)) {
        finalStatus = "published";
        publishedAt = existingPublishedAt || now;
        scheduledAt = null;
      }
      
      const articleData: any = {
        ...body,
        status: finalStatus,
        scheduledAt,
        publishedAt,
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
      
      const notificationEmail = await storage.getSetting("notification_email") || "admin@mutflex.com";
      sendContactNotificationEmail(notificationEmail, {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company,
        message: validatedData.message,
      }).catch(err => console.error("Failed to send email notification:", err));
      
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

  app.get("/api/admin/settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allSettings = await storage.getAllSettings();
      const settingsObj: Record<string, string> = {};
      allSettings.forEach((s) => {
        if (s.value) settingsObj[s.key] = s.value;
      });
      res.json(settingsObj);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settingsToSave = [
        "notification_email",
        "site_name",
        "site_url",
        "default_meta_description",
        "default_og_image",
        "ga_id",
        "gtm_id",
        "google_verification",
        "bing_verification",
        "robots_txt"
      ];
      
      for (const key of settingsToSave) {
        if (key in req.body) {
          const value = req.body[key];
          
          // Validate site_url if provided
          if (key === "site_url" && value) {
            try {
              const url = new URL(value);
              if (!["http:", "https:"].includes(url.protocol)) {
                return res.status(400).json({ message: "رابط الموقع يجب أن يبدأ بـ http:// أو https://" });
              }
            } catch {
              return res.status(400).json({ message: "رابط الموقع غير صالح" });
            }
          }
          
          // Allow empty string to clear value
          await storage.setSetting(key, value || "");
        }
      }
      
      res.json({ message: "تم حفظ الإعدادات بنجاح" });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // Helper function to escape XML special characters
  function escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  // Generate sitemap.xml dynamically
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const storedSiteUrl = await storage.getSetting("site_url");
      // Default to a safe fallback domain
      const siteUrl = storedSiteUrl || `https://${process.env.REPLIT_DEV_DOMAIN || "mutflex.com"}`;
      
      // Get ALL published articles (no limit)
      const { articles: publishedArticles } = await storage.getArticles({ status: "published", limit: 10000 });
      
      // Static pages
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/features", priority: "0.8", changefreq: "weekly" },
        { url: "/industries", priority: "0.8", changefreq: "weekly" },
        { url: "/pricing", priority: "0.8", changefreq: "weekly" },
        { url: "/about", priority: "0.7", changefreq: "monthly" },
        { url: "/contact", priority: "0.7", changefreq: "monthly" },
        { url: "/free-trial", priority: "0.9", changefreq: "weekly" },
        { url: "/blog", priority: "0.8", changefreq: "daily" },
        { url: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
      ];
      
      const now = new Date().toISOString().split("T")[0];
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
      
      // Add static pages
      for (const page of staticPages) {
        xml += `  <url>
    <loc>${escapeXml(siteUrl)}${escapeXml(page.url)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      }
      
      // Add articles
      for (const article of publishedArticles) {
        const lastmod = article.updatedAt ? new Date(article.updatedAt).toISOString().split("T")[0] : now;
        xml += `  <url>
    <loc>${escapeXml(siteUrl)}/blog/${escapeXml(article.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
      
      xml += `</urlset>`;
      
      // Update last generated timestamp
      await storage.setSetting("sitemap_last_updated", new Date().toISOString());
      
      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Generate robots.txt dynamically
  app.get("/robots.txt", async (req, res) => {
    try {
      const customRobots = await storage.getSetting("robots_txt");
      const siteUrl = await storage.getSetting("site_url") || `https://${process.env.REPLIT_DEV_DOMAIN || "mutflex.com"}`;
      
      let robotsTxt: string;
      
      if (customRobots) {
        robotsTxt = customRobots;
      } else {
        // Default robots.txt
        robotsTxt = `User-agent: *
Allow: /

# Disallow admin and API paths
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /login

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml
`;
      }
      
      res.set("Content-Type", "text/plain");
      res.send(robotsTxt);
    } catch (error) {
      console.error("Error generating robots.txt:", error);
      res.status(500).send("Error generating robots.txt");
    }
  });

  // Trigger sitemap regeneration (admin endpoint)
  app.post("/api/admin/regenerate-sitemap", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Just update the timestamp - the sitemap is generated dynamically
      await storage.setSetting("sitemap_last_updated", new Date().toISOString());
      res.json({ 
        message: "تم تحديث خريطة الموقع بنجاح",
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error regenerating sitemap:", error);
      res.status(500).json({ message: "فشل في تحديث خريطة الموقع" });
    }
  });

  app.post("/api/trial", async (req, res) => {
    try {
      const validatedData = insertTrialSchema.parse(req.body);
      const trial = await storage.createTrialSubmission(validatedData);
      
      const notificationEmail = await storage.getSetting("notification_email") || "admin@mutflex.com";
      sendContactNotificationEmail(notificationEmail, {
        name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company,
        message: `طلب تجربة مجانية - القطاع: ${validatedData.industry}`,
      }).catch(err => console.error("Failed to send trial email notification:", err));
      
      res.status(201).json({ message: "تم تسجيل طلبك بنجاح", trial });
    } catch (error: any) {
      console.error("Error creating trial submission:", error);
      res.status(400).json({ message: error.message || "فشل في تسجيل الطلب" });
    }
  });

  app.get("/api/admin/trials", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { page, limit, isRead } = req.query;
      const result = await storage.getTrialSubmissions({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        isRead: isRead as string,
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching trials:", error);
      res.status(500).json({ message: "Failed to fetch trials" });
    }
  });

  app.patch("/api/admin/trials/:id/read", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trial = await storage.markTrialAsRead(id);
      if (!trial) {
        return res.status(404).json({ message: "Trial not found" });
      }
      res.json(trial);
    } catch (error) {
      console.error("Error marking trial as read:", error);
      res.status(500).json({ message: "Failed to mark trial as read" });
    }
  });

  app.delete("/api/admin/trials/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTrial(id);
      res.json({ message: "Trial deleted successfully" });
    } catch (error) {
      console.error("Error deleting trial:", error);
      res.status(500).json({ message: "Failed to delete trial" });
    }
  });

  // AI-powered SEO generation endpoint
  app.post("/api/admin/articles/generate-seo", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { title, content, excerpt } = req.body;

      if (!content) {
        return res.status(400).json({ message: "المحتوى مطلوب لإنشاء SEO" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
        httpOptions: {
          apiVersion: "",
          baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
        },
      });

      const prompt = `أنت خبير SEO. قم بتحليل المقال التالي وإنشاء بيانات SEO محسّنة.

العنوان: ${title || "غير متوفر"}
الملخص: ${excerpt || "غير متوفر"}
المحتوى: ${content.substring(0, 3000)}

قم بإرجاع JSON فقط بالتنسيق التالي (بدون أي نص إضافي):
{
  "metaDescription": "وصف ميتا محسّن (120-160 حرف)",
  "metaKeywords": "كلمة1, كلمة2, كلمة3, كلمة4, كلمة5",
  "focusKeyword": "الكلمة المفتاحية الرئيسية",
  "ogTitle": "عنوان مناسب للمشاركة على السوشيال ميديا",
  "ogDescription": "وصف جذاب للمشاركة (60-90 حرف)"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text || "";
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("لم يتم استلام بيانات SEO صالحة");
      }

      const seoData = JSON.parse(jsonMatch[0]);
      res.json(seoData);
    } catch (error: any) {
      console.error("Error generating SEO:", error);
      res.status(500).json({ message: error.message || "فشل في إنشاء بيانات SEO" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
