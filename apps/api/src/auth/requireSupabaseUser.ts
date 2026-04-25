import type { Context } from "hono";
import { ApiErrorCode } from "@kipi/domain";
import { writeProblem } from "../http/problem-json.js";
import { getSupabaseAdmin } from "../supabase/client.js";

function parseBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const m = authHeader.match(/^\s*Bearer\s+(.+)\s*$/i);
  return m?.[1] ? m[1].trim() : null;
}

export async function requireSupabaseUser(c: Context): Promise<
  | { ok: true; user: { id: string; email?: string | null }; token: string }
  | { ok: false; response: Response }
> {
  const token = parseBearerToken(c.req.header("Authorization"));
  if (!token) {
    return {
      ok: false,
      response: writeProblem(c, ApiErrorCode.AUTH_REQUIRED, "Falta Authorization: Bearer <token>."),
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return {
      ok: false,
      response: writeProblem(c, ApiErrorCode.AUTH_REQUIRED, "Token inválido o expirado."),
    };
  }

  return {
    ok: true,
    token,
    user: { id: data.user.id, email: data.user.email ?? null },
  };
}

