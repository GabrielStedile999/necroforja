/**
 * Drizzle + Postgres client (postgres-js).
 * Single reused connection (avoids exhausting connections in serverless).
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined. Copy .env.example to .env.");
}

// Reuses the connection in dev (hot reload) and in serverless.
const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.client ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
export { schema };

/**
 * Either the root Drizzle client or a transaction handle (issue #62).
 * Helpers that write in multiple steps accept a `dbc` so callers can run
 * them inside an enclosing `db.transaction` and keep the whole mutation
 * atomic; when omitted, helpers fall back to `db` (or open their own
 * transaction where atomicity is required).
 */
export type DbOrTx =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];
