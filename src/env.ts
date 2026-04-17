import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

type EnvInput = Record<string, string | undefined>;

const isCloudflareEnv = (
  value: unknown,
): value is { DATABASE_URL?: string; NODE_ENV?: string } => {
  return typeof value === "object" && value !== null;
};

function getRawEnv(): EnvInput {
  if (typeof Bun !== "undefined" && Bun.env) {
    return Bun.env as EnvInput;
  }

  if (typeof process !== "undefined" && process.env) {
    return process.env as EnvInput;
  }

  if (typeof globalThis !== "undefined") {
    const globalEnv = (
      globalThis as typeof globalThis & {
        env?: unknown;
      }
    ).env;

    if (isCloudflareEnv(globalEnv)) {
      return {
        DATABASE_URL: globalEnv.DATABASE_URL,
        NODE_ENV: globalEnv.NODE_ENV,
      };
    }
  }

  return {};
}

export function getEnv() {
  const parsed = envSchema.safeParse(getRawEnv());

  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.format());
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export type Env = ReturnType<typeof getEnv>;
