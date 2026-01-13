import { Pool } from "pg";

const connectionString = process.env.UNION_POSTGRES_URL;

if (!connectionString) {
  throw new Error("Missing UNION_POSTGRES_URL env variable");
}

declare global {
  // eslint-disable-next-line no-var
  var pgUnionPool: Pool | undefined;
}

export const pgUnionPool: Pool = global.pgUnionPool || new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

if (process.env.NODE_ENV !== "production") global.pgUnionPool = pgUnionPool;


