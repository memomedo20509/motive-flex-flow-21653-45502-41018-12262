import { and, desc, eq, sql } from "drizzle-orm";
import {
  assistantFeedback,
  assistantKnowledge,
  assistantLeads,
  assistantMessages,
  assistantSessions,
  type AssistantKnowledge,
  type AssistantLead,
  type AssistantMessage,
  type InsertAssistantKnowledge,
} from "../shared/schema";
import { db } from "./db";

export interface AssistantSource {
  slug: string;
  title: string;
  type: string;
  sector?: string | null;
  sourceUrl?: string | null;
}

export interface AssistantAnalytics {
  sessions: number;
  messages: number;
  leads: number;
  positiveFeedback: number;
  negativeFeedback: number;
  unanswered: number;
  aiResponses: number;
  fallbackResponses: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalCostUsd: number;
  averageLatencyMs: number;
  topSectors: Array<{ sector: string; count: number }>;
  modelUsage: Array<{ model: string; messages: number; tokens: number; costUsd: number }>;
}

export class AssistantStorage {
  async getKnowledge(options?: { status?: string; type?: string; sector?: string }): Promise<AssistantKnowledge[]> {
    const filters = [];
    if (options?.status) filters.push(eq(assistantKnowledge.status, options.status));
    if (options?.type) filters.push(eq(assistantKnowledge.type, options.type));
    if (options?.sector) filters.push(eq(assistantKnowledge.sector, options.sector));
    return db
      .select()
      .from(assistantKnowledge)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(assistantKnowledge.priority), assistantKnowledge.title);
  }

  async createKnowledge(entry: InsertAssistantKnowledge): Promise<AssistantKnowledge> {
    const [created] = await db.insert(assistantKnowledge).values(entry).returning();
    return created;
  }

  async updateKnowledge(id: number, entry: Partial<InsertAssistantKnowledge>): Promise<AssistantKnowledge | undefined> {
    const [updated] = await db
      .update(assistantKnowledge)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(assistantKnowledge.id, id))
      .returning();
    return updated;
  }

  async deleteKnowledge(id: number): Promise<boolean> {
    const deleted = await db.delete(assistantKnowledge).where(eq(assistantKnowledge.id, id)).returning({ id: assistantKnowledge.id });
    return deleted.length > 0;
  }

  async ensureSession(id: string): Promise<void> {
    await db
      .insert(assistantSessions)
      .values({ id })
      .onConflictDoUpdate({ target: assistantSessions.id, set: { updatedAt: new Date() } });
  }

  async updateSessionContext(id: string, context: { sector?: string; customerRole?: string; companyName?: string; summary?: string }): Promise<void> {
    const clean = Object.fromEntries(Object.entries(context).filter(([, value]) => Boolean(value)));
    if (Object.keys(clean).length === 0) return;
    await db.update(assistantSessions).set({ ...clean, updatedAt: new Date() }).where(eq(assistantSessions.id, id));
  }

  async addMessage(data: {
    sessionId: string;
    role: "user" | "assistant";
    content: string;
    intent?: string;
    sources?: AssistantSource[];
    aiProvider?: string;
    aiModel?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    costUsdMicros?: number;
    latencyMs?: number;
    usedFallback?: boolean;
  }): Promise<AssistantMessage> {
    const [created] = await db.insert(assistantMessages).values({
      ...data,
      sources: data.sources || null,
    }).returning();
    await db.update(assistantSessions).set({ updatedAt: new Date() }).where(eq(assistantSessions.id, data.sessionId));
    return created;
  }

  async getHistory(sessionId: string, limit = 10): Promise<AssistantMessage[]> {
    const rows = await db
      .select()
      .from(assistantMessages)
      .where(eq(assistantMessages.sessionId, sessionId))
      .orderBy(desc(assistantMessages.createdAt))
      .limit(limit);
    return rows.reverse();
  }

  async saveFeedback(data: { sessionId: string; messageId: number; rating: "positive" | "negative"; comment?: string }): Promise<boolean> {
    const result = await db.execute(sql`
      INSERT INTO assistant_feedback (session_id, message_id, rating, comment)
      SELECT ${data.sessionId}, ${data.messageId}, ${data.rating}, ${data.comment || null}
      FROM assistant_messages
      WHERE id = ${data.messageId} AND session_id = ${data.sessionId}
      ON CONFLICT (message_id) DO UPDATE SET
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment
      RETURNING id
    `);
    return Boolean((result as unknown as { rows?: unknown[] }).rows?.length);
  }

  async createLead(data: {
    sessionId: string;
    name: string;
    phone: string;
    company?: string;
    sector?: string;
    customerRole?: string;
    painPoint?: string;
    consent: boolean;
  }) {
    const [lead] = await db.insert(assistantLeads).values(data).returning();
    await this.updateSessionContext(data.sessionId, {
      sector: data.sector,
      customerRole: data.customerRole,
      companyName: data.company,
      summary: data.painPoint,
    });
    return lead;
  }

  async getRecentLeads(limit = 50): Promise<AssistantLead[]> {
    return db
      .select()
      .from(assistantLeads)
      .orderBy(desc(assistantLeads.createdAt))
      .limit(Math.min(Math.max(limit, 1), 100));
  }

  async getAnalytics(): Promise<AssistantAnalytics> {
    const [countsResult, sectorResult, modelResult] = await Promise.all([
      db.execute(sql`
        SELECT
          (SELECT COUNT(*) FROM assistant_sessions) AS sessions,
          (SELECT COUNT(*) FROM assistant_messages) AS messages,
          (SELECT COUNT(*) FROM assistant_leads) AS leads,
          (SELECT COUNT(*) FROM assistant_feedback WHERE rating = 'positive') AS positive_feedback,
          (SELECT COUNT(*) FROM assistant_feedback WHERE rating = 'negative') AS negative_feedback,
          (SELECT COUNT(*) FROM assistant_messages WHERE role = 'assistant' AND intent = 'unanswered') AS unanswered,
          (SELECT COUNT(*) FROM assistant_messages WHERE role = 'assistant' AND ai_provider = 'openrouter') AS ai_responses,
          (SELECT COUNT(*) FROM assistant_messages WHERE role = 'assistant' AND used_fallback = TRUE) AS fallback_responses,
          (SELECT COALESCE(SUM(prompt_tokens), 0) FROM assistant_messages WHERE role = 'assistant') AS prompt_tokens,
          (SELECT COALESCE(SUM(completion_tokens), 0) FROM assistant_messages WHERE role = 'assistant') AS completion_tokens,
          (SELECT COALESCE(SUM(cost_usd_micros), 0) FROM assistant_messages WHERE role = 'assistant') AS cost_usd_micros,
          (SELECT COALESCE(AVG(latency_ms), 0) FROM assistant_messages WHERE role = 'assistant' AND latency_ms IS NOT NULL) AS average_latency_ms
      `),
      db.execute(sql`
        SELECT COALESCE(sector, 'غير محدد') AS sector, COUNT(*) AS count
        FROM assistant_sessions
        GROUP BY COALESCE(sector, 'غير محدد')
        ORDER BY count DESC
        LIMIT 6
      `),
      db.execute(sql`
        SELECT
          COALESCE(ai_model, 'غير محدد') AS model,
          COUNT(*) AS messages,
          COALESCE(SUM(total_tokens), 0) AS tokens,
          COALESCE(SUM(cost_usd_micros), 0) AS cost_usd_micros
        FROM assistant_messages
        WHERE role = 'assistant'
        GROUP BY COALESCE(ai_model, 'غير محدد')
        ORDER BY messages DESC
        LIMIT 6
      `),
    ]);
    const counts = ((countsResult as { rows?: Record<string, string>[] }).rows || [])[0] || {};
    const sectors = (sectorResult as unknown as { rows?: Array<{ sector: string; count: string }> }).rows || [];
    const models = (modelResult as unknown as { rows?: Array<{ model: string; messages: string; tokens: string; cost_usd_micros: string }> }).rows || [];
    return {
      sessions: Number(counts.sessions || 0),
      messages: Number(counts.messages || 0),
      leads: Number(counts.leads || 0),
      positiveFeedback: Number(counts.positive_feedback || 0),
      negativeFeedback: Number(counts.negative_feedback || 0),
      unanswered: Number(counts.unanswered || 0),
      aiResponses: Number(counts.ai_responses || 0),
      fallbackResponses: Number(counts.fallback_responses || 0),
      totalPromptTokens: Number(counts.prompt_tokens || 0),
      totalCompletionTokens: Number(counts.completion_tokens || 0),
      totalCostUsd: Number(counts.cost_usd_micros || 0) / 1_000_000,
      averageLatencyMs: Math.round(Number(counts.average_latency_ms || 0)),
      topSectors: sectors.map((row) => ({ sector: row.sector, count: Number(row.count) })),
      modelUsage: models.map((row) => ({
        model: row.model,
        messages: Number(row.messages),
        tokens: Number(row.tokens),
        costUsd: Number(row.cost_usd_micros) / 1_000_000,
      })),
    };
  }
}

export const assistantStorage = new AssistantStorage();
