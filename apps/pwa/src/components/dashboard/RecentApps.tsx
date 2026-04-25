import { Package, ArrowRight } from "lucide-react";
import { recentApps } from "@/mockData";
import { cn } from "@/lib/utils";

const RISK_CONFIG = {
  low: {
    label: "Bajo Riesgo",
    className: "bg-safe-subtle text-safe border-safe-border",
  },
  medium: {
    label: "Monitoreo",
    className: "bg-warn-subtle text-warn border-warn-border",
  },
  high: {
    label: "Alto Riesgo",
    className: "bg-warn-subtle text-warn border-warn-border",
  },
} as const;

const ACTION_CONFIG: Record<string, string> = {
  Instalada: "bg-warn/10 text-warn",
  Actualizada: "bg-muted text-muted-foreground",
};

export function RecentApps() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-subtle flex items-center justify-center">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">Instalaciones Recientes</h3>
            <p className="text-xs text-muted-foreground">Últimos 7 días</p>
          </div>
        </div>
        <button
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light transition-colors duration-150 group"
          type="button"
        >
          Ver todo
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-150" />
        </button>
      </div>

      <div className="flex-1 space-y-1">
        {recentApps.map((app) => {
          const riskConfig = RISK_CONFIG[app.risk];
          const actionClass = ACTION_CONFIG[app.action] || ACTION_CONFIG.Actualizada;

          return (
            <div
              key={app.id}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors duration-150 group cursor-pointer"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  backgroundColor: `hsl(${app.bgColor} / 0.15)`,
                  color: `hsl(${app.bgColor})`,
                }}
              >
                {app.initial}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{app.name}</p>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0",
                      actionClass,
                    )}
                  >
                    {app.action}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">{app.time}</span>
                  <span className="text-muted-foreground/30 text-xs">·</span>
                  <span className="text-[11px] text-muted-foreground">{app.category}</span>
                </div>
              </div>

              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0",
                  riskConfig.className,
                )}
              >
                {riskConfig.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentApps;

