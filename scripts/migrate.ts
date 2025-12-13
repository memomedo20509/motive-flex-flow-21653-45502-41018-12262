import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";

const { Pool } = pg;

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  console.log("Creating sessions table...");
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

  console.log("Creating users table...");
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

  console.log("Creating articles table...");
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

  console.log("Migration completed!");
  await pool.end();
}

migrate().catch(console.error);
