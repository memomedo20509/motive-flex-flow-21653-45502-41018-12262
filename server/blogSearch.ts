import { sql } from "drizzle-orm";
import {
  BLOG_TAXONOMY,
  buildArticleSearchFields,
  classifyBlogArticle,
  type BlogSearchableArticle,
} from "../shared/blogTaxonomy";

export const BLOG_SEARCH_INDEX_VERSION = "2026-08-23-2";

type SqlDatabase = any;

function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === "object" && "rows" in result) {
    return ((result as { rows?: T[] }).rows || []);
  }
  return [];
}

function toSearchableArticle(article: any): BlogSearchableArticle {
  return {
    title: article.title || "",
    content: article.content || "",
    excerpt: article.excerpt,
    tags: article.tags || [],
    metaTitle: article.metaTitle ?? article.meta_title,
    metaDescription: article.metaDescription ?? article.meta_description,
    metaKeywords: article.metaKeywords ?? article.meta_keywords,
    focusKeyword: article.focusKeyword ?? article.focus_keyword,
  };
}

export async function seedBlogTaxonomy(database: SqlDatabase): Promise<void> {
  for (const entry of BLOG_TAXONOMY) {
    await database.execute(sql`
      INSERT INTO blog_taxonomy (kind, slug, label, description, aliases, sort_order, is_active, updated_at)
      VALUES (
        ${entry.kind},
        ${entry.slug},
        ${entry.label},
        ${entry.description},
        ARRAY(
          SELECT jsonb_array_elements_text(${JSON.stringify(entry.aliases)}::jsonb)
        ),
        ${entry.sortOrder},
        true,
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        kind = EXCLUDED.kind,
        label = EXCLUDED.label,
        description = EXCLUDED.description,
        aliases = EXCLUDED.aliases,
        sort_order = EXCLUDED.sort_order,
        is_active = true,
        updated_at = NOW()
    `);
  }
}

export async function getArticleTaxonomySlugs(
  database: SqlDatabase,
  articleId: number,
  source?: "manual" | "automatic",
): Promise<string[]> {
  const sourceFilter = source ? sql`AND article_map.source = ${source}` : sql``;
  const result = await database.execute(sql`
    SELECT bt.slug
    FROM article_taxonomy article_map
    INNER JOIN blog_taxonomy bt ON bt.id = article_map.taxonomy_id
    WHERE article_map.article_id = ${articleId} ${sourceFilter}
    ORDER BY bt.sort_order, bt.label
  `);
  return rowsOf<{ slug: string }>(result).map((row) => row.slug);
}

export async function syncArticleSearchRecord(
  database: SqlDatabase,
  article: any,
  manualSlugs?: string[],
): Promise<void> {
  const articleId = Number(article.id);
  if (!Number.isFinite(articleId)) return;

  const searchable = toSearchableArticle(article);
  const automaticMatches = classifyBlogArticle(searchable);
  const allowedSlugs = new Set(BLOG_TAXONOMY.map((entry) => entry.slug));
  const preservedManual = manualSlugs === undefined
    ? await getArticleTaxonomySlugs(database, articleId, "manual")
    : manualSlugs.filter((slug) => allowedSlugs.has(slug));
  const manualSet = new Set(preservedManual);

  await database.execute(sql`DELETE FROM article_taxonomy WHERE article_id = ${articleId}`);

  for (const slug of manualSet) {
    await database.execute(sql`
      INSERT INTO article_taxonomy (article_id, taxonomy_id, score, source)
      SELECT ${articleId}, id, 1000, 'manual'
      FROM blog_taxonomy
      WHERE slug = ${slug} AND is_active = true
      ON CONFLICT (article_id, taxonomy_id) DO UPDATE SET score = 1000, source = 'manual'
    `);
  }

  for (const match of automaticMatches) {
    if (manualSet.has(match.slug)) continue;
    await database.execute(sql`
      INSERT INTO article_taxonomy (article_id, taxonomy_id, score, source)
      SELECT ${articleId}, id, ${match.score}, 'automatic'
      FROM blog_taxonomy
      WHERE slug = ${match.slug} AND is_active = true
      ON CONFLICT (article_id, taxonomy_id) DO UPDATE SET
        score = EXCLUDED.score,
        source = CASE WHEN article_taxonomy.source = 'manual' THEN 'manual' ELSE 'automatic' END
    `);
  }

  const allSlugs = Array.from(new Set([
    ...manualSet,
    ...automaticMatches.map((match) => match.slug),
  ]));
  const searchFields = buildArticleSearchFields(searchable, allSlugs);

  await database.execute(sql`
    INSERT INTO article_search (
      article_id,
      title_text,
      keyword_text,
      body_text,
      normalized_text,
      updated_at
    ) VALUES (
      ${articleId},
      ${searchFields.titleText},
      ${searchFields.keywordText},
      ${searchFields.bodyText},
      ${searchFields.normalizedText},
      NOW()
    )
    ON CONFLICT (article_id) DO UPDATE SET
      title_text = EXCLUDED.title_text,
      keyword_text = EXCLUDED.keyword_text,
      body_text = EXCLUDED.body_text,
      normalized_text = EXCLUDED.normalized_text,
      updated_at = NOW()
  `);
}

export async function backfillBlogSearch(database: SqlDatabase, force = false): Promise<number> {
  const freshnessFilter = force
    ? sql``
    : sql`WHERE article_index.article_id IS NULL OR article_index.updated_at < a.updated_at`;
  const result = await database.execute(sql`
    SELECT
      a.id,
      a.title,
      a.content,
      a.excerpt,
      a.tags,
      a.meta_title,
      a.meta_description,
      a.meta_keywords,
      a.focus_keyword
    FROM articles a
    LEFT JOIN article_search article_index ON article_index.article_id = a.id
    ${freshnessFilter}
  `);
  const articleRows = rowsOf<any>(result);
  for (const article of articleRows) {
    await syncArticleSearchRecord(database, article);
  }
  return articleRows.length;
}
