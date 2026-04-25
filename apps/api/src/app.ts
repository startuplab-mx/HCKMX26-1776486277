import { Hono } from "hono";
import { ApiErrorCode } from "@kipi/domain";
import { apiRouter } from "./routes/api.js";
import { applyCorsHeaders } from "./http/cors.js";
import { writeProblem } from "./http/problem-json.js";

export function createApp(): Hono {
  const app = new Hono();

  app.onError((err, c) => {
    // Never leak secrets; return stable problem+json and log details server-side.
    console.error("[kipi/api] Unhandled error:", err);
    return writeProblem(
      c,
      ApiErrorCode.INTERNAL_ERROR,
      err instanceof Error ? err.message : "Error interno del servidor.",
    );
  });

  app.use("*", async (c, next) => {
    applyCorsHeaders(c, c.req.header("Origin"));
    if (c.req.method === "OPTIONS") {
      return c.body(null, 204);
    }
    await next();
  });

  app.get("/health", (c) =>
    c.json({
      ok: true as const,
      service: "kipi-api",
      time: new Date().toISOString(),
      supabase: (() => {
        const raw = process.env["SUPABASE_URL"];
        if (!raw) return { configured: false as const };
        try {
          const u = new URL(raw);
          return { configured: true as const, host: u.host };
        } catch {
          return { configured: true as const, host: raw };
        }
      })(),
    }),
  );

  app.route("/api", apiRouter);

  return app;
}
