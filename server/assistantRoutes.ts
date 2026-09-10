import type { Express, NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import {
  assistantChatSchema,
  assistantFeedbackSchema,
  assistantLeadSchema,
  insertAssistantKnowledgeSchema,
} from "../shared/schema";
import {
  ASSISTANT_QUICK_PROMPTS,
  ASSISTANT_ROLE_OPTIONS,
  PRODUCT_FEATURES,
  SECTOR_PLAYBOOKS,
} from "../shared/assistantKnowledge";
import { isAdmin, isAuthenticated } from "./auth";
import { assistantStorage } from "./assistantStorage";
import { buildAssistantContext, streamAssistantReply, type AssistantHistoryMessage } from "./assistantService";
import { sendContactNotificationEmail } from "./email";
import { storage } from "./storage";

const requestBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 25;

function clientKey(req: Request): string {
  return String(req.ip || req.headers["x-forwarded-for"] || "anonymous").split(",")[0].trim();
}

function assistantRateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = clientKey(req);
  const current = requestBuckets.get(key);
  if (!current || current.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }
  if (current.count >= RATE_LIMIT) {
    res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
    return res.status(429).json({ message: "وصلت للحد المؤقت للمحادثة. جرّب مرة ثانية بعد دقائق بسيطة." });
  }
  current.count += 1;
  next();
}

function writeEvent(res: Response, event: Record<string, unknown>) {
  if (res.writableEnded || res.destroyed) return;
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function registerAssistantRoutes(app: Express) {
  app.get("/api/assistant/bootstrap", (_req, res) => {
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    res.json({
      quickPrompts: ASSISTANT_QUICK_PROMPTS,
      roles: ASSISTANT_ROLE_OPTIONS,
      sectors: SECTOR_PLAYBOOKS.map(({ slug, title, aliases }) => ({ slug, title, aliases })),
      features: PRODUCT_FEATURES.map(({ slug, title, summary }) => ({ slug, title, summary })),
    });
  });

  app.post("/api/assistant/chat", assistantRateLimit, async (req, res) => {
    const parsed = assistantChatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "اكتب سؤالك في حدود 2000 حرف." });
    }

    const sessionId = parsed.data.sessionId || randomUUID().replace(/-/g, "");
    const message = parsed.data.message;

    try {
      let history: AssistantHistoryMessage[] = [];
      let persistenceAvailable = true;
      try {
        await assistantStorage.ensureSession(sessionId);
        history = (await assistantStorage.getHistory(sessionId, 10))
          .filter((item) => item.role === "user" || item.role === "assistant")
          .map((item) => ({ role: item.role as "user" | "assistant", content: item.content }));
      } catch (persistenceError) {
        persistenceAvailable = false;
        history = parsed.data.history;
        console.warn("Assistant persistence unavailable; continuing without history:", persistenceError);
      }
      const context = await buildAssistantContext(message, history);

      if (persistenceAvailable) {
        try {
          await Promise.all([
            assistantStorage.addMessage({ sessionId, role: "user", content: message, intent: context.intent }),
            assistantStorage.updateSessionContext(sessionId, { sector: context.sector }),
          ]);
        } catch (persistenceError) {
          persistenceAvailable = false;
          console.warn("Assistant user message was not persisted:", persistenceError);
        }
      }

      res.status(200);
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();
      writeEvent(res, { type: "meta", sessionId, intent: context.intent, sector: context.sector, sources: context.sources });

      const abortController = new AbortController();
      const abortGeneration = () => {
        if (!res.writableEnded) abortController.abort();
      };
      res.once("close", abortGeneration);
      const generated = await streamAssistantReply(
        message,
        history,
        context,
        (text) => writeEvent(res, { type: "chunk", text }),
        abortController.signal,
      );
      res.off("close", abortGeneration);

      const saved = persistenceAvailable ? await assistantStorage.addMessage({
        sessionId,
        role: "assistant",
        content: generated.text,
        intent: context.sources.length ? context.intent : "unanswered",
        sources: context.sources,
        aiProvider: generated.provider,
        aiModel: generated.model,
        promptTokens: generated.usage?.promptTokens,
        completionTokens: generated.usage?.completionTokens,
        totalTokens: generated.usage?.totalTokens,
        costUsdMicros: generated.usage?.costUsdMicros,
        latencyMs: generated.latencyMs,
        usedFallback: generated.usedFallback,
      }).catch((persistenceError) => {
        console.warn("Assistant response was not persisted:", persistenceError);
        return undefined;
      }) : undefined;
      writeEvent(res, {
        type: "done",
        sessionId,
        messageId: saved?.id,
        suggestions: context.suggestions,
        sources: context.sources,
        usedFallback: generated.usedFallback,
      });
      res.end();
    } catch (error) {
      console.error("Assistant chat error:", error);
      if (res.headersSent) {
        writeEvent(res, { type: "error", message: "صار خلل بسيط. جرّب ترسل سؤالك مرة ثانية." });
        return res.end();
      }
      return res.status(500).json({ message: "صار خلل بسيط. جرّب ترسل سؤالك مرة ثانية." });
    }
  });

  app.post("/api/assistant/feedback", assistantRateLimit, async (req, res) => {
    const parsed = assistantFeedbackSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "بيانات التقييم غير صحيحة." });
    try {
      const saved = await assistantStorage.saveFeedback(parsed.data);
      if (!saved) return res.status(404).json({ message: "الرسالة غير موجودة في هذه المحادثة." });
      res.json({ message: "يعطيك العافية، تم حفظ تقييمك." });
    } catch (error) {
      console.error("Assistant feedback error:", error);
      res.status(500).json({ message: "تعذر حفظ التقييم." });
    }
  });

  app.post("/api/assistant/lead", assistantRateLimit, async (req, res) => {
    const parsed = assistantLeadSchema.safeParse(req.body);
    if (!parsed.success || parsed.data.consent !== true) {
      return res.status(400).json({ message: "تأكد من الاسم ورقم الجوال السعودي والموافقة على التواصل." });
    }
    try {
      await assistantStorage.ensureSession(parsed.data.sessionId);
      const lead = await assistantStorage.createLead({ ...parsed.data, consent: true });
      const notificationEmail = await storage.getSetting("notification_email") || "admin@mutflex.com";
      void sendContactNotificationEmail(notificationEmail, {
        name: parsed.data.name,
        email: "assistant-lead@mutflex.com",
        phone: parsed.data.phone,
        company: parsed.data.company,
        message: `طلب تواصل من المستشار الذكي\nالقطاع: ${parsed.data.sector || "غير محدد"}\nالدور: ${parsed.data.customerRole || "غير محدد"}\nالاحتياج: ${parsed.data.painPoint || "غير محدد"}`,
      });
      res.status(201).json({ message: "تم تسجيل طلبك، وبيتواصل معك فريق موتفلكس.", leadId: lead.id });
    } catch (error) {
      console.error("Assistant lead error:", error);
      res.status(500).json({ message: "تعذر تسجيل الطلب حاليًا. تقدر تكمل معنا على واتساب." });
    }
  });

  app.get("/api/admin/assistant/analytics", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      res.json(await assistantStorage.getAnalytics());
    } catch (error) {
      console.error("Assistant analytics error:", error);
      res.status(500).json({ message: "تعذر تحميل إحصائيات المساعد." });
    }
  });

  app.get("/api/admin/assistant/leads", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const requestedLimit = Number(req.query.limit || 50);
      res.json(await assistantStorage.getRecentLeads(Number.isFinite(requestedLimit) ? requestedLimit : 50));
    } catch (error) {
      console.error("Assistant leads list error:", error);
      res.status(500).json({ message: "تعذر تحميل طلبات التواصل." });
    }
  });

  app.get("/api/admin/assistant/knowledge", isAuthenticated, isAdmin, async (req, res) => {
    try {
      res.json(await assistantStorage.getKnowledge({
        type: typeof req.query.type === "string" && req.query.type !== "all" ? req.query.type : undefined,
      }));
    } catch (error) {
      console.error("Assistant knowledge list error:", error);
      res.status(500).json({ message: "تعذر تحميل قاعدة المعرفة." });
    }
  });

  app.post("/api/admin/assistant/knowledge", isAuthenticated, isAdmin, async (req, res) => {
    const parsed = insertAssistantKnowledgeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "راجع بيانات عنصر المعرفة." });
    try {
      res.status(201).json(await assistantStorage.createKnowledge(parsed.data));
    } catch (error) {
      console.error("Assistant knowledge create error:", error);
      res.status(400).json({ message: "تعذر إنشاء عنصر المعرفة. تأكد أن المعرّف غير مستخدم." });
    }
  });

  app.patch("/api/admin/assistant/knowledge/:id", isAuthenticated, isAdmin, async (req, res) => {
    const parsed = insertAssistantKnowledgeSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "راجع بيانات عنصر المعرفة." });
    try {
      const updated = await assistantStorage.updateKnowledge(Number(req.params.id), parsed.data);
      if (!updated) return res.status(404).json({ message: "العنصر غير موجود." });
      res.json(updated);
    } catch (error) {
      console.error("Assistant knowledge update error:", error);
      res.status(400).json({ message: "تعذر تحديث عنصر المعرفة." });
    }
  });

  app.delete("/api/admin/assistant/knowledge/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await assistantStorage.deleteKnowledge(Number(req.params.id));
      if (!deleted) return res.status(404).json({ message: "العنصر غير موجود." });
      res.json({ message: "تم حذف عنصر المعرفة." });
    } catch (error) {
      console.error("Assistant knowledge delete error:", error);
      res.status(500).json({ message: "تعذر حذف عنصر المعرفة." });
    }
  });
}
