import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AlertCard } from "./AlertCard";
import { cn } from "@/lib/utils";
import type { AlertItem } from "./types";

const FILTER_TABS = [
  { id: "all", label: "Todas" },
  { id: "unread", label: "Pendientes" },
  { id: "high", label: "Riesgo Alto" },
  { id: "read", label: "Revisadas" },
] as const;

type FilterId = (typeof FILTER_TABS)[number]["id"];

export function AlertsFeed({
  alerts,
  onMarkRead,
  onDismiss,
  minorId,
  analyzeDisabled = false,
}: {
  alerts: AlertItem[];
  onMarkRead: (id: AlertItem["id"]) => void;
  onDismiss: (id: AlertItem["id"]) => void;
  minorId: string | number | null | undefined;
  analyzeDisabled?: boolean;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === "unread") return !alert.read;
    if (activeFilter === "high") return alert.level === "high";
    if (activeFilter === "read") return alert.read;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display font-bold text-foreground text-base">Alertas Procesables</h2>
          {unreadCount > 0 && (
            <span className="w-5 h-5 bg-warn text-warn-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150",
              activeFilter === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center py-10 px-6 rounded-xl bg-card border border-border text-center">
            <div className="w-14 h-14 rounded-2xl bg-safe-subtle flex items-center justify-center mb-3">
              <ShieldCheck className="w-7 h-7 text-safe" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm mb-1">
              Sin alertas pendientes
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Tu hijo/a está navegando de forma segura. El motor de IA no detectó patrones de riesgo
              en esta categoría.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={String(alert.id)}
              className="transition-opacity"
            >
              <AlertCard
                alert={alert}
                onMarkRead={onMarkRead}
                onDismiss={onDismiss}
                minorId={minorId}
                analyzeDisabled={analyzeDisabled}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default AlertsFeed;

