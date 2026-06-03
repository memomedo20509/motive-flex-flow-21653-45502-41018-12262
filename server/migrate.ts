import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";

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

    console.log("Database migrations completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await pool.end();
  }
}
