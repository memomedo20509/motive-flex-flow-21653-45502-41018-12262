import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";
import { BLOG_SEARCH_INDEX_VERSION, backfillBlogSearch, seedBlogTaxonomy } from "./blogSearch";

const { Pool } = pg;

export async function runMigrations() {
  console.log("Checking database env vars...");
  console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
  console.log("PGHOST present:", !!process.env.PGHOST);
  console.log("PGDATABASE present:", !!process.env.PGDATABASE);
  
  let databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl && process.env.PGHOST) {
    databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
  }
  
  if (!databaseUrl) {
    console.error("DATABASE_URL not set, skipping migrations");
    return;
  }

  console.log("Running database migrations...");
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire)
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email VARCHAR UNIQUE,
        password_hash VARCHAR,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        is_admin VARCHAR DEFAULT 'false',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR`);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        cover_image VARCHAR(500),
        cover_image_alt VARCHAR(255),
        tags TEXT[] DEFAULT '{}',
        author VARCHAR(100) DEFAULT 'فريق موتفلكس',
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        focus_keyword VARCHAR(100),
        canonical_url VARCHAR(500),
        og_title VARCHAR(255),
        og_description TEXT,
        og_image VARCHAR(500),
        robots_directive VARCHAR(50) DEFAULT 'index, follow',
        schema_markup TEXT,
        reading_time VARCHAR(20),
        view_count INTEGER DEFAULT 0,
        published_at TIMESTAMP,
        scheduled_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image_alt VARCHAR(255)`);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_keywords TEXT`);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS focus_keyword VARCHAR(100)`);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500)`);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_title VARCHAR(255)`);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_description TEXT`);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image VARCHAR(500)`);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS robots_directive VARCHAR(50) DEFAULT 'index, follow'`);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS schema_markup TEXT`);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS reading_time VARCHAR(20)`);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMP`);
    await db.execute(sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP`);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        message TEXT NOT NULL,
        is_read VARCHAR(10) DEFAULT 'false',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS trial_submissions (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        company VARCHAR(255) NOT NULL,
        industry VARCHAR(100) NOT NULL,
        is_read VARCHAR(10) DEFAULT 'false',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS short_urls (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) NOT NULL UNIQUE,
        slug VARCHAR(500) NOT NULL,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS blog_taxonomy (
        id SERIAL PRIMARY KEY,
        kind VARCHAR(30) NOT NULL,
        slug VARCHAR(120) NOT NULL UNIQUE,
        label VARCHAR(255) NOT NULL,
        description TEXT,
        aliases TEXT[] NOT NULL DEFAULT '{}',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS blog_taxonomy_kind_sort_idx
      ON blog_taxonomy (kind, is_active, sort_order)
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS article_taxonomy (
        article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        taxonomy_id INTEGER NOT NULL REFERENCES blog_taxonomy(id) ON DELETE CASCADE,
        score INTEGER NOT NULL DEFAULT 0,
        source VARCHAR(20) NOT NULL DEFAULT 'automatic',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (article_id, taxonomy_id)
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS article_taxonomy_lookup_idx
      ON article_taxonomy (taxonomy_id, article_id)
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS article_search (
        article_id INTEGER PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
        title_text TEXT NOT NULL DEFAULT '',
        keyword_text TEXT NOT NULL DEFAULT '',
        body_text TEXT NOT NULL DEFAULT '',
        normalized_text TEXT NOT NULL DEFAULT '',
        search_vector TSVECTOR GENERATED ALWAYS AS (
          setweight(to_tsvector('simple', coalesce(title_text, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(keyword_text, '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(body_text, '')), 'C')
        ) STORED,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS article_search_vector_idx
      ON article_search USING GIN (search_vector)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS article_search_trgm_idx
      ON article_search USING GIN (normalized_text gin_trgm_ops)
    `);

    await seedBlogTaxonomy(db);
    const versionResult: any = await db.execute(sql`
      SELECT value FROM settings WHERE key = 'blog_search_index_version' LIMIT 1
    `);
    const currentVersion = versionResult?.rows?.[0]?.value;
    const indexedArticles = await backfillBlogSearch(db, currentVersion !== BLOG_SEARCH_INDEX_VERSION);
    await db.execute(sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('blog_search_index_version', ${BLOG_SEARCH_INDEX_VERSION}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);
    await db.execute(sql`ANALYZE article_search`);
    await db.execute(sql`ANALYZE article_taxonomy`);

    console.log(`Database migrations completed successfully! Indexed ${indexedArticles} blog articles.`);
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}
