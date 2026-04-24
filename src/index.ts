import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import {
  createProfileController,
  deleteProfileController,
  getProfileByIdController,
  listProfilesController,
} from "./controllers/profile.controller";
import { getEnv } from "./env";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  await next();
});

app.get("/", (c) => {
  return c.json({
    status: "success",
    data: { message: "API is running" },
  });
});

app.post("/api/profiles", createProfileController);
app.get("/api/profiles/:id", getProfileByIdController);
app.get("/api/profiles", listProfilesController);
app.delete("/api/profiles/:id", deleteProfileController);

app.onError((err, c) => {
  console.error(err);
  return c.json(
    {
      status: "error",
      message: "Internal server error",
    },
    500,
  );
});

const env = getEnv();
const port = env.PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`✅ Server running on port ${info.port}`);
  },
);

export type AppType = typeof app;
