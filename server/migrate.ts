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
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        is_admin VARCHAR DEFAULT 'false',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        cover_image VARCHAR(500),
        tags TEXT[] DEFAULT '{}',
        author VARCHAR(100) DEFAULT 'فريق موتفلكس',
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        meta_title VARCHAR(255),
        meta_description TEXT,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log("Database migrations completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await pool.end();
  }
}
