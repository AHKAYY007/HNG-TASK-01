import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "../env";
import { profiles } from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const { DATABASE_URL } = getEnv();

  const client = postgres(DATABASE_URL, {
    prepare: false,
  });

  dbInstance = drizzle(client, {
    schema: {
      profiles,
    },
  });

  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof typeof instance];
    return typeof value === "function" ? value.bind(instance) : value;
  },
}) as ReturnType<typeof drizzle>;

export type Database = ReturnType<typeof drizzle>;
