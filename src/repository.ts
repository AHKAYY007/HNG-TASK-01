import { and, eq, sql } from "drizzle-orm";
import { getDb } from "./db/client";
import { profiles } from "./db/schema";
import type { AgeGroup } from "./utils";

type ProfileFilter = {
  gender?: string;
  countryId?: string;
  ageGroup?: AgeGroup;
};

export type ProfileRecord = typeof profiles.$inferSelect;
export type NewProfileRecord = typeof profiles.$inferInsert;

function ciEquals(column: unknown, value: string) {
  return sql<boolean>`lower(${column as never}) = ${value.trim().toLowerCase()}`;
}

export async function findProfileById(
  id: string,
): Promise<ProfileRecord | undefined> {
  const db = getDb();
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  return result[0];
}

export async function findProfileByName(
  name: string,
): Promise<ProfileRecord | undefined> {
  const db = getDb();
  const result = await db
    .select()
    .from(profiles)
    .where(ciEquals(profiles.name, name))
    .limit(1);
  return result[0];
}

export async function findProfiles(
  filters: ProfileFilter = {},
): Promise<ProfileRecord[]> {
  const db = getDb();
  const conditions = [];

  if (filters.gender) {
    conditions.push(ciEquals(profiles.gender, filters.gender));
  }

  if (filters.countryId) {
    conditions.push(ciEquals(profiles.countryId, filters.countryId));
  }

  if (filters.ageGroup) {
    conditions.push(ciEquals(profiles.ageGroup, filters.ageGroup));
  }

  if (conditions.length === 0) {
    return db.select().from(profiles);
  }

  return db
    .select()
    .from(profiles)
    .where(and(...conditions));
}

export async function createProfile(
  profile: NewProfileRecord,
): Promise<ProfileRecord> {
  const db = getDb();
  const result = await db.insert(profiles).values(profile).returning();
  return result[0];
}

export async function deleteProfileById(
  id: string,
): Promise<boolean> {
  const db = getDb();
  const result = await db
    .delete(profiles)
    .where(eq(profiles.id, id))
    .returning({
      id: profiles.id,
    });

  return result.length > 0;
}
