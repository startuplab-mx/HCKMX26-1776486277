import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, ShieldCheck, AlertTriangle } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  ts: string;
  isError?: boolean;
  meta?: unknown;
};

function nowTs() {
  try {
    return new Date().toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "Ahora";
  }
}

function normalizeError(e: unknown) {
  if (!e) return "Error inesperado.";
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === "string") return e;
  return "Error inesperado.";
}

function defaultWelcomeMessage(activeSection: string | undefined): ChatMessage {
  const section = typeof activeSection === "string" && activeSection ? activeSection : "dashboard";
  return {
    id: "welcome",
    role: "assistant",
    content:
      "Hola, soy tu Asistente Parental. Puedo ayudarte a entender alertas, niveles 1/2/3, acuerdos por edad y misiones educativas. " +
      "Cuéntame qué quieres lograr y en qué parte del dashboard estás.",
    ts: nowTs(),
    meta: { ui_context: { active_section: section } },
  };
}

export function ParentalChat({
  parentId,
  accessToken,
  enabled,
  activeSection,
}: {
  parentId: string | undefined | null;
  accessToken: string | undefined | null;
  enabled: boolean;
  activeSection: string;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [defaultWelcomeMessage(activeSection)]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => {
    if (!enabled || !parentId || !accessToken) return false;
    const trimmed = String(draft || "").trim();
    return trimmed.length >= 3 && !loading;
  }, [enabled, parentId, accessToken, draft, loading]);

  useEffect(() => {
    setMessages((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return [defaultWelcomeMessage(activeSection)];
      if (prev[0]?.id !== "welcome") return prev;
      return [defaultWelcomeMessage(activeSection), ...prev.slice(1)];
    });
  }, [activeSection]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    window.setTimeout(() => {
      try {
        el.scrollIntoView({ block: "end", behavior: "smooth" });
      } catch {
        /* ignore */
      }
    }, 0);
  }, [messages.length, loading]);

  const send = useCallback(async () => {
    if (!canSend) return;
    const content = String(draft || "").trim();
    setDraft("");
    setError(null);

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content,
      ts: nowTs(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/assistant/chat"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent_id: parentId,
          message: content,
          ui_context: { active_section: activeSection || "dashboard" },
        }),
      });
      const body = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) throw new Error(body.message || body.error || `HTTP ${res.status}`);
      const reply = typeof body.reply === "string" ? body.reply : null;
      if (!reply) throw new Error("Respuesta del asistente inesperada.");
      const botMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: reply,
        ts: nowTs(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setError(normalizeError(e));
      const botMsg: ChatMessage = {
        id: `a_err_${Date.now()}`,
        role: "assistant",
        content:
          "No pude responder en este momento. Intenta de nuevo en unos segundos. " +
          "Si estás en modo desarrollo, revisa si el backend está levantado y si tu sesión está conectada.",
        ts: nowTs(),
        isError: true,
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  }, [canSend, draft, accessToken, parentId, activeSection]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    e.preventDefault();
    send();
  };

  if (!enabled) {
    return (
      <section className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
        Conecta tu cuenta para usar el Asistente Parental (requiere sesión y token).
      </section>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-subtle flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" aria-hidden />
            </div>
            <div>
              <CardTitle className="font-display text-sm">Asistente Parental</CardTitle>
              <CardDescription className="text-xs">
                Respuestas prácticas sin invadir privacidad (Firewall Ciego).
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-safe-subtle border border-safe-border">
            <ShieldCheck className="w-3.5 h-3.5 text-safe" aria-hidden />
            <span className="text-[11px] font-semibold text-safe">Privacidad</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="rounded-xl border border-border bg-background/40">
          <ScrollArea className="h-64">
            <div className="p-4 space-y-3">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[92%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 border text-sm leading-relaxed",
                        isUser ? "bg-primary text-primary-foreground border-primary/20" : "bg-card text-foreground border-border",
                        m.isError && "border-destructive/40 bg-destructive/10",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p
                        className={cn(
                          "mt-2 text-[10px] opacity-80",
                          isUser ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {m.ts}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" aria-hidden />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Textarea
            value={draft}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escribe tu pregunta… (Enter para enviar · Shift+Enter para nueva línea)"
            disabled={loading}
            aria-label="Mensaje al asistente"
            className="min-h-[68px]"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">No compartas datos sensibles (dirección, teléfono, etc.).</p>
            <Button type="button" onClick={send} disabled={!canSend}>
              {loading ? "Enviando…" : "Enviar"}
              <Send className="w-4 h-4" aria-hidden />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ParentalChat;

