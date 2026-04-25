export function friendlyErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const msg = String(raw || "").trim();

  // Handle our common pattern: `HTTP ${status}`
  const m = msg.match(/\bHTTP\s+(\d{3})\b/);
  const status = m ? Number(m[1]) : null;

  if (status === 401 || status === 403) {
    return "Tu sesión expiró o no tienes permisos. Cierra sesión e inicia nuevamente.";
  }
  if (status === 404) {
    return "Este recurso aún no está disponible en el backend.";
  }
  if (status === 429) {
    return "Demasiadas solicitudes. Espera un momento e intenta de nuevo.";
  }
  if (status && status >= 500) {
    return "El servidor tuvo un problema temporal. Intenta de nuevo en unos segundos.";
  }

  // Generic fallbacks
  if (!msg) return "Ocurrió un error inesperado.";
  if (/failed to fetch/i.test(msg) || /network/i.test(msg)) {
    return "No se pudo conectar al servidor. Verifica que el backend esté levantado.";
  }

  return msg;
}

