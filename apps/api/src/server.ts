import dotenv from "dotenv";
import { serve } from "@hono/node-server";
import { createApp } from "./app.js";

dotenv.config({
  // Load repo-root .env (monorepo), not apps/api/.env
  // src/server.ts -> repo root is three levels up.
  path: new URL("../../../.env", import.meta.url),
});

const port = Number(process.env["PORT"] ?? "8788");
const app = createApp();

serve({ fetch: app.fetch, port });
console.log(`kipi api listening on http://localhost:${String(port)}`);
