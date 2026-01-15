import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, type ViteDevServer } from "vite";

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

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    log(`ERROR: Could not find the build directory: ${distPath}`);
    log(`Current __dirname: ${__dirname}`);
    log(`Looking for static files at: ${distPath}`);
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
