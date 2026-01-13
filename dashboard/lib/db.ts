import { Pool } from "pg";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL (or DATABASE_URL) env variable");
}

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

export const pgPool: Pool = global.pgPool || new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

if (process.env.NODE_ENV !== "production") global.pgPool = pgPool;

export async function pgHealthcheck(): Promise<boolean> {
  const client = await pgPool.connect();
  try {
    await client.query("SELECT 1");
    return true;
  } finally {
    client.release();
  }
}


