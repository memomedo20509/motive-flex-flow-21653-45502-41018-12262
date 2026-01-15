import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { storage } from "./storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SSR_ROUTES = [
  "/",
  "/features",
  "/industries",
  "/pricing",
  "/contact",
  "/about",
  "/free-trial",
  "/privacy-policy",
  "/blog",
];

function isSSRRoute(url: string): boolean {
  const pathname = url.split("?")[0];
  if (SSR_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/blog/") && !pathname.startsWith("/blog/admin")) return true;
  return false;
}

export function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

export async function setupVite(app: Express, server: any) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientPath = path.resolve(__dirname, "..", "client");
      let template = fs.readFileSync(path.resolve(clientPath, "index.html"), "utf-8");
      template = await vite.transformIndexHtml(url, template);

      if (isSSRRoute(url)) {
        try {
          const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
          const { html: appHtml, helmet } = render(url);
          
          let finalHtml = template;
          
          if (helmet.title) {
            finalHtml = finalHtml.replace(/<title>.*?<\/title>/s, helmet.title);
          }
          
          const headEnd = finalHtml.indexOf("</head>");
          if (headEnd !== -1) {
            const metaTags = `${helmet.meta}${helmet.link}`;
            finalHtml = finalHtml.slice(0, headEnd) + metaTags + finalHtml.slice(headEnd);
          }
          
          finalHtml = finalHtml.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
          
          res.status(200).set({ "Content-Type": "text/html" }).end(finalHtml);
        } catch (ssrError) {
          log(`SSR error for ${url}: ${(ssrError as Error).message}`);
          vite.ssrFixStacktrace(ssrError as Error);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        }
      } else {
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      }
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  return server;
}

export async function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  const ssrPath = path.resolve(__dirname, "ssr");

  if (!fs.existsSync(distPath)) {
    log(`ERROR: Could not find the build directory: ${distPath}`);
    log(`Current __dirname: ${__dirname}`);
    log(`Looking for static files at: ${distPath}`);
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  log(`Serving static files from: ${distPath}`);
  
  // Serve static files but skip index.html for SSR routes
  app.use((req, res, next) => {
    // Skip SSR routes - let them be handled by SSR handler
    if (isSSRRoute(req.path)) {
      return next();
    }
    express.static(distPath)(req, res, next);
  });

  // Try to load SSR module for production
  let ssrRender: ((url: string, initialData?: Record<string, unknown>) => { html: string; helmet: any }) | null = null;
  const ssrEntryPath = path.resolve(ssrPath, "entry-server.js");
  
  if (fs.existsSync(ssrEntryPath)) {
    try {
      // Use file:// URL for ESM dynamic imports
      const ssrModuleUrl = pathToFileURL(ssrEntryPath).href;
      const ssrModule = await import(ssrModuleUrl);
      ssrRender = ssrModule.render;
      log(`SSR enabled for production`);
    } catch (e) {
      log(`SSR module load failed: ${(e as Error).message}`);
      console.error('SSR load error details:', e);
    }
  } else {
    log(`SSR entry not found at ${ssrEntryPath}, falling back to CSR`);
  }

  // Read the template once
  const templatePath = path.resolve(distPath, "index.html");
  const template = fs.readFileSync(templatePath, "utf-8");

  app.use("*", async (req, res) => {
    const url = req.originalUrl;
    const pathname = url.split("?")[0];
    
    // Try SSR for SEO-critical routes
    if (ssrRender && isSSRRoute(url)) {
      try {
        log(`SSR rendering: ${url}`);
        
        // Fetch initial data for specific routes
        let initialData: Record<string, unknown> = {};
        
        // For /blog page, fetch published articles
        if (pathname === "/blog") {
          try {
            const { articles, total } = await storage.getArticles({ status: "published", page: 1, limit: 100 });
            initialData["/api/articles"] = { articles, total };
            log(`SSR pre-fetched ${articles.length} articles for /blog`);
          } catch (e) {
            log(`SSR data fetch error: ${(e as Error).message}`);
          }
        }
        
        // For individual blog posts, fetch the article
        if (pathname.startsWith("/blog/") && pathname !== "/blog") {
          const slug = pathname.replace("/blog/", "");
          try {
            const article = await storage.getArticleBySlug(slug);
            if (article) {
              initialData[`/api/articles/slug/${slug}`] = article;
              log(`SSR pre-fetched article: ${slug}`);
            }
          } catch (e) {
            log(`SSR article fetch error: ${(e as Error).message}`);
          }
        }
        
        const { html: appHtml, helmet } = ssrRender(url, initialData);
        log(`SSR rendered ${appHtml.length} chars for ${url}`);
        
        let finalHtml = template;
        
        // Replace title
        if (helmet.title) {
          finalHtml = finalHtml.replace(/<title>.*?<\/title>/s, helmet.title);
        }
        
        // Add meta tags
        const headEnd = finalHtml.indexOf("</head>");
        if (headEnd !== -1) {
          const metaTags = `${helmet.meta || ''}${helmet.link || ''}`;
          finalHtml = finalHtml.slice(0, headEnd) + metaTags + finalHtml.slice(headEnd);
        }
        
        // Inject SSR content
        finalHtml = finalHtml.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
        
        res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(finalHtml);
        return;
      } catch (ssrError) {
        log(`Production SSR error for ${url}: ${(ssrError as Error).message}`);
        // Fall through to CSR
      }
    }
    
    // Fallback to CSR
    res.sendFile(templatePath);
  });
}
