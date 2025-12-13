import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDatabaseUrl(): string {
  let databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl && process.env.PGHOST) {
    databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
  }
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }
  
  return databaseUrl;
}

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({ 
      connectionString: getDatabaseUrl(),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

export { getPool as pool };
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const realDb = getDb();
    const value = (realDb as any)[prop];
    if (typeof value === 'function') {
      return value.bind(realDb);
    }
    return value;
  }
});
