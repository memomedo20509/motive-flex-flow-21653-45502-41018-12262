import {
  users,
  articles,
  type User,
  type UpsertUser,
  type Article,
  type InsertArticle,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, sql, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
}

export const storage = new DatabaseStorage();
