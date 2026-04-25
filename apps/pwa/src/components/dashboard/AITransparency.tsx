import { useEffect, useRef, useState } from "react";
import { Lock, Check, Cpu, ShieldCheck } from "lucide-react";
import { aiStats } from "@/mockData";

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const activeRef = useRef(false);

  const start = () => {
    if (activeRef.current) return;
    activeRef.current = true;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return { count, start };
}

function Guarantee({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-b-0">
      <div className="w-5 h-5 rounded-full bg-safe-subtle flex items-center justify-center shrink-0">
        <Check className="w-2.5 h-2.5 text-safe" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function AITransparency() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { count: msgCount, start: startMsg } = useCountUp(aiStats.messagesAnalyzed);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startMsg();
      },
      { threshold: 0.3 },
    );
    const el = containerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [startMsg]);

  return (
    <div ref={containerRef} className="bg-card rounded-xl border border-border p-5 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-subtle flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">Transparencia de IA</h3>
            <p className="text-xs text-muted-foreground">Auditado · {aiStats.lastAudit}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-safe-subtle border border-safe-border">
          <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
          <span className="text-[11px] font-semibold text-safe">Sistema Activo</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-4 rounded-xl bg-primary-subtle border border-primary/10">
          <p className="text-3xl font-bold font-display text-primary tabular-nums">
            {msgCount.toLocaleString("es-MX")}
          </p>
          <p className="text-[11px] text-primary/70 mt-1 font-medium leading-tight">
            mensajes analizados esta semana
          </p>
        </div>
        <div className="text-center p-4 rounded-xl bg-safe-subtle border border-safe-border">
          <p className="text-3xl font-bold font-display text-safe tabular-nums">{aiStats.privacyBreaches}</p>
          <p className="text-[11px] text-safe/80 mt-1 font-medium leading-tight">
            brechas de privacidad detectadas
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-muted/60 border border-border mb-4">
        <div className="flex items-start gap-2.5">
          <Cpu className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground mb-1 font-display">Tecnología Firewall Ciego™</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              La IA analiza patrones de riesgo directamente en el dispositivo de tu hijo/a. El contenido de los
              mensajes{" "}
              <strong className="text-foreground font-semibold">nunca se almacena ni se envía</strong> a nuestros
              servidores. Privacidad garantizada.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
          Garantías de Privacidad
        </p>
        <div className="rounded-xl border border-border overflow-hidden bg-background/40">
          <Guarantee text="Procesamiento 100% local en el dispositivo del menor" />
          <Guarantee text="Retención de datos: 0 días — purgado automático tras análisis" />
          <Guarantee text="Los padres NO pueden leer mensajes privados del menor" />
          <Guarantee text="Cifrado de extremo a extremo en todas las alertas generadas" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <ShieldCheck className="w-4 h-4 text-safe" />
        <p className="text-xs text-muted-foreground">
          Conforme con <span className="font-semibold text-foreground">COPPA, GDPR y LFPDPPP</span>
          {" ·  Certificado por terceros"}
        </p>
      </div>
    </div>
  );
}

export default AITransparency;

