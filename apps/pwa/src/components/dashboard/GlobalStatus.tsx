import { ShieldCheck, AlertCircle, Smartphone, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalStatus({
  status,
  unreadAlerts,
  childName,
}: {
  status: "safe" | "alert";
  unreadAlerts: number;
  childName: string;
}) {
  const isSafe = status === "safe";

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all duration-300",
        isSafe ? "bg-safe-subtle border-safe-border" : "bg-warn-subtle border-warn-border",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0 mt-0.5">
          <div
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center",
              isSafe ? "bg-safe/15" : "bg-warn/15",
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center",
                isSafe ? "bg-safe" : "bg-warn",
              )}
            >
              {isSafe ? (
                <ShieldCheck className="w-4 h-4 text-safe-foreground" />
              ) : (
                <AlertCircle className="w-4 h-4 text-warn-foreground" />
              )}
            </div>
          </div>
          <span className={cn("absolute inset-0 rounded-full animate-ping opacity-20", isSafe ? "bg-safe" : "bg-warn")} />
        </div>

        <div className="flex-1 min-w-0">
          <h2
            className={cn(
              "text-base font-bold font-display leading-tight",
              isSafe ? "text-safe" : "text-warn",
            )}
          >
            {isSafe
              ? "Entorno Seguro · Monitoreo Activo"
              : `${unreadAlerts} Alerta${unreadAlerts > 1 ? "s" : ""} Pendiente${
                  unreadAlerts > 1 ? "s" : ""
                } de Revisión`}
          </h2>
          <p className={cn("text-sm mt-0.5 leading-relaxed", isSafe ? "text-safe/80" : "text-warn/80")}>
            {isSafe
              ? `Todos los dispositivos de ${childName} operan con normalidad. Sin riesgos detectados.`
              : "El motor de IA identificó situaciones que requieren tu atención. Revisa las alertas a continuación."}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 pt-4 border-t grid grid-cols-3 gap-2",
          isSafe ? "border-safe-border" : "border-warn-border",
        )}
      >
        {[
          { icon: Smartphone, label: "Dispositivos", value: "2 / 2", sub: "activos" },
          { icon: Zap, label: "Analizados Hoy", value: "348", sub: "mensajes" },
          { icon: Clock, label: "Pantalla Hoy", value: "8.5h", sub: "tiempo total" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center mb-1">
                <Icon className={cn("w-4 h-4", isSafe ? "text-safe/60" : "text-warn/60")} />
              </div>
              <p className={cn("text-lg font-bold font-display leading-none", isSafe ? "text-safe" : "text-warn")}>
                {stat.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{stat.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GlobalStatus;

