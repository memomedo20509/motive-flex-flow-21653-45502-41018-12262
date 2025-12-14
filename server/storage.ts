import {
  users,
  articles,
  contactSubmissions,
  settings,
  type User,
  type UpsertUser,
  type Article,
  type InsertArticle,
  type ContactSubmission,
  type InsertContact,
  type Setting,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, sql, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  getArticles(options?: {
    status?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ articles: Article[]; total: number }>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getArticleById(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  incrementViewCount(id: number): Promise<void>;
  getRelatedArticles(articleId: number, tags: string[], limit?: number): Promise<Article[]>;
  getAllTags(): Promise<string[]>;
  
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  getContactSubmissions(options?: {
    page?: number;
    limit?: number;
    isRead?: string;
  }): Promise<{ contacts: ContactSubmission[]; total: number; unreadCount: number }>;
  markContactAsRead(id: number): Promise<ContactSubmission | undefined>;
  deleteContact(id: number): Promise<boolean>;
  
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getArticles(options?: {
    status?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ articles: Article[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 9;
    const offset = (page - 1) * limit;

    let conditions = [];

    if (options?.status) {
      conditions.push(eq(articles.status, options.status));
    }

    if (options?.search) {
      conditions.push(
        or(
          ilike(articles.title, `%${options.search}%`),
          ilike(articles.excerpt, `%${options.search}%`)
        )
      );
    }

    if (options?.tag) {
      conditions.push(sql`${options.tag} = ANY(${articles.tags})`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [result, countResult] = await Promise.all([
      db
        .select()
        .from(articles)
        .where(whereClause)
        .orderBy(desc(articles.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(whereClause),
    ]);

    return {
      articles: result,
      total: Number(countResult[0]?.count || 0),
    };
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article;
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article as any).returning();
    return newArticle;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const updateData: any = { ...article, updatedAt: new Date() };
    const [updated] = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, id))
      .returning();
    return updated;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return true;
  }

  async incrementViewCount(id: number): Promise<void> {
    await db
      .update(articles)
      .set({ viewCount: sql`${articles.viewCount} + 1` })
      .where(eq(articles.id, id));
  }

  async getRelatedArticles(articleId: number, tags: string[], limit: number = 3): Promise<Article[]> {
    if (!tags || tags.length === 0) {
      return db
        .select()
        .from(articles)
        .where(and(
          eq(articles.status, "published"),
          sql`${articles.id} != ${articleId}`
        ))
        .orderBy(desc(articles.createdAt))
        .limit(limit);
    }

    return db
      .select()
      .from(articles)
      .where(and(
        eq(articles.status, "published"),
        sql`${articles.id} != ${articleId}`,
        sql`${articles.tags} && ARRAY[${sql.join(tags.map(t => sql`${t}`), sql`, `)}]::text[]`
      ))
      .orderBy(desc(articles.createdAt))
      .limit(limit);
  }

  async getAllTags(): Promise<string[]> {
    const result = await db
      .select({ tags: articles.tags })
      .from(articles)
      .where(eq(articles.status, "published"));

    const allTags = new Set<string>();
    result.forEach((row) => {
      if (row.tags) {
        row.tags.forEach((tag) => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  }

  async createContactSubmission(contact: InsertContact): Promise<ContactSubmission> {
    const [newContact] = await db.insert(contactSubmissions).values(contact).returning();
    return newContact;
  }

  async getContactSubmissions(options?: {
    page?: number;
    limit?: number;
    isRead?: string;
  }): Promise<{ contacts: ContactSubmission[]; total: number; unreadCount: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    let conditions = [];

    if (options?.isRead) {
      conditions.push(eq(contactSubmissions.isRead, options.isRead));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [result, countResult, unreadResult] = await Promise.all([
      db
        .select()
        .from(contactSubmissions)
        .where(whereClause)
        .orderBy(desc(contactSubmissions.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(contactSubmissions)
        .where(whereClause),
      db
        .select({ count: sql<number>`count(*)` })
        .from(contactSubmissions)
        .where(eq(contactSubmissions.isRead, "false")),
    ]);

    return {
      contacts: result,
      total: Number(countResult[0]?.count || 0),
      unreadCount: Number(unreadResult[0]?.count || 0),
    };
  }

  async markContactAsRead(id: number): Promise<ContactSubmission | undefined> {
    const [updated] = await db
      .update(contactSubmissions)
      .set({ isRead: "true" })
      .where(eq(contactSubmissions.id, id))
      .returning();
    return updated;
  }

  async deleteContact(id: number): Promise<boolean> {
    await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
    return true;
  }

  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const [setting] = await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return setting;
  }

  async getAllSettings(): Promise<Setting[]> {
    return db.select().from(settings);
  }
}

export const storage = new DatabaseStorage();
