import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.js";
import * as schema from "./schema.js";

const client = postgres(env.DATABASE_URL, {
  max: 10,
  // postgres-js infers SSL from connection string; flip here if you need to force it
});

export const db = drizzle(client, { schema });
export { schema };
export type DB = typeof db;
