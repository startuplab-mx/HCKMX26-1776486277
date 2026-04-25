import { Smartphone, Tablet, RefreshCw, ShieldCheck, Plus, BatteryMedium } from "lucide-react";
import { mockDevices } from "@/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DEVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Smartphone,
  tablet: Tablet,
};

function BatteryBar({ level }: { level: number }) {
  const colorClass = level > 50 ? "bg-safe" : level > 20 ? "bg-warn" : "bg-warn";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", colorClass)} style={{ width: `${level}%` }} />
      </div>
      <span className="text-[11px] text-muted-foreground font-medium w-7 text-right">{level}%</span>
    </div>
  );
}

export function DeviceManagement() {
  const onlineCount = mockDevices.filter((d) => d.status === "online").length;

  const handleSync = () => {
    toast.success("Sincronización completada", {
      description: "Todos los dispositivos están actualizados.",
    });
  };

  const handleAddDevice = () => {
    toast.info("Agregar dispositivo", {
      description: "Escanea el código QR desde la app del dispositivo.",
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-subtle flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">Dispositivos</h3>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-safe">{onlineCount}</span> de {mockDevices.length} activos
            </p>
          </div>
        </div>
        <button
          onClick={handleSync}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
          title="Sincronizar"
          type="button"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 space-y-3">
        {mockDevices.map((device) => {
          const DeviceIcon = DEVICE_ICONS[device.type] || Smartphone;
          const isOnline = device.status === "online";

          return (
            <div
              key={device.id}
              className="p-3.5 rounded-xl border border-border hover:border-primary/25 hover:bg-primary-subtle/20 transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center shrink-0">
                  <DeviceIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{device.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {device.model} · {device.os}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                    isOnline ? "bg-safe-subtle text-safe border-safe-border" : "bg-muted text-muted-foreground border-border",
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-safe" : "bg-muted-foreground")} />
                  {isOnline ? "En línea" : "Offline"}
                </span>
              </div>

              <div className="mb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <BatteryMedium className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Batería</span>
                  </div>
                </div>
                <BatteryBar level={device.battery} />
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-safe" />
                  <span className="text-[11px] text-safe font-medium">Protección activa</span>
                </div>
                <span className="text-[11px] text-muted-foreground">Sync {device.lastSync}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleAddDevice}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary-subtle/20 transition-all duration-150"
        type="button"
      >
        <Plus className="w-4 h-4" />
        Agregar Dispositivo
      </button>
    </div>
  );
}

export default DeviceManagement;

