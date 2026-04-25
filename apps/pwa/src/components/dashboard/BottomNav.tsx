import { LayoutDashboard, Bell, Clock, Smartphone, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasBadge?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
  { id: "alerts", label: "Alertas", icon: Bell, hasBadge: true },
  { id: "screentime", label: "Pantalla", icon: Clock },
  { id: "devices", label: "Devices", icon: Smartphone },
  { id: "settings", label: "Config.", icon: Settings },
];

export function BottomNav({
  unreadAlerts,
  activeSection,
  onSectionChange,
}: {
  unreadAlerts: number;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}) {
  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-card border-t border-border flex lg:hidden z-20 shadow-floating">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              onSectionChange(item.id);
              document.getElementById(`section-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors duration-150",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
            type="button"
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
            )}
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.hasBadge && unreadAlerts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-warn text-warn-foreground rounded-full text-[9px] flex items-center justify-center font-bold">
                  {unreadAlerts}
                </span>
              )}
            </div>
            <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;

