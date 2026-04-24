import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
});

type EnvInput = Record<string, string | undefined>;

function getRawEnv(): EnvInput {
  return process.env as EnvInput;
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
