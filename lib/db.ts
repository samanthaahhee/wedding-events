import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | null = null;

function init(): Db {
  if (cached) return cached;
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  cached = drizzle(client, { schema });
  return cached;
}

// Lazy proxy — connection is established on first access, not at import time.
// This lets Next.js collect page data during build even when DATABASE_URL is
// absent (it only fails at request time, which is what we want for /api/submit).
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(init(), prop, receiver);
  },
});
