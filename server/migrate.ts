import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";
import { BLOG_SEARCH_INDEX_VERSION, backfillBlogSearch, seedBlogTaxonomy } from "./blogSearch";
import { ASSISTANT_KNOWLEDGE_SEED } from "../shared/assistantKnowledge";

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

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS assistant_knowledge (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(160) NOT NULL UNIQUE,
        type VARCHAR(30) NOT NULL,
        sector VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        tags TEXT[] NOT NULL DEFAULT '{}',
        source_url VARCHAR(500),
        priority INTEGER NOT NULL DEFAULT 50,
        status VARCHAR(20) NOT NULL DEFAULT 'published',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS assistant_knowledge_lookup_idx
      ON assistant_knowledge (status, type, sector, priority DESC)
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS assistant_sessions (
        id VARCHAR(64) PRIMARY KEY,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        sector VARCHAR(100),
        customer_role VARCHAR(100),
        company_name VARCHAR(255),
        summary TEXT,
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS assistant_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL REFERENCES assistant_sessions(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        intent VARCHAR(50),
        sources JSONB,
        ai_provider VARCHAR(40),
        ai_model VARCHAR(160),
        prompt_tokens INTEGER,
        completion_tokens INTEGER,
        total_tokens INTEGER,
        cost_usd_micros INTEGER,
        latency_ms INTEGER,
        used_fallback BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      ALTER TABLE assistant_messages
        ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(40),
        ADD COLUMN IF NOT EXISTS ai_model VARCHAR(160),
        ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER,
        ADD COLUMN IF NOT EXISTS completion_tokens INTEGER,
        ADD COLUMN IF NOT EXISTS total_tokens INTEGER,
        ADD COLUMN IF NOT EXISTS cost_usd_micros INTEGER,
        ADD COLUMN IF NOT EXISTS latency_ms INTEGER,
        ADD COLUMN IF NOT EXISTS used_fallback BOOLEAN NOT NULL DEFAULT FALSE
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS assistant_messages_session_idx
      ON assistant_messages (session_id, created_at)
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS assistant_feedback (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL REFERENCES assistant_sessions(id) ON DELETE CASCADE,
        message_id INTEGER NOT NULL REFERENCES assistant_messages(id) ON DELETE CASCADE,
        rating VARCHAR(20) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE (message_id)
      )
    `);
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS assistant_feedback_message_unique_idx
      ON assistant_feedback (message_id)
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS assistant_leads (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL REFERENCES assistant_sessions(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        company VARCHAR(255),
        sector VARCHAR(100),
        customer_role VARCHAR(100),
        pain_point TEXT,
        consent BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS assistant_leads_created_idx
      ON assistant_leads (created_at DESC)
    `);

    for (const entry of ASSISTANT_KNOWLEDGE_SEED) {
      await db.execute(sql`
        INSERT INTO assistant_knowledge (
          slug, type, sector, title, content, tags, source_url, priority, status, updated_at
        ) VALUES (
          ${entry.slug}, ${entry.type}, ${entry.sector || null}, ${entry.title}, ${entry.content},
          ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(entry.tags)}::jsonb)),
          ${entry.sourceUrl || null}, ${entry.priority}, 'published', NOW()
        )
        ON CONFLICT (slug) DO NOTHING
      `);
    }

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
