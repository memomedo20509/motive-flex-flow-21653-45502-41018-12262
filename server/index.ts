import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runMigrations } from "./migrate";

const app = express();
app.set("trust proxy", true);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    const canonicalHost = "mutflex.com";
    const host = (req.get("host") || "").toLowerCase();
    const forwardedProto = (req.get("x-forwarded-proto") || "")
      .split(",")[0]
      .trim()
      .toLowerCase();
    const isHttps = req.secure || forwardedProto === "https";

    if (host && (host !== canonicalHost || !isHttps)) {
      return res.redirect(301, `https://${canonicalHost}${req.originalUrl}`);
    }
    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await runMigrations();
  const server = await registerRoutes(app);
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    await serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  server.timeout = 120000;
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 70000;

  const PORT = Number(process.env.PORT) || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`);
  });
})();
