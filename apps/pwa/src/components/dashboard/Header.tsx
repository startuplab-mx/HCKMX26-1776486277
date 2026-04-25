import { Bell, Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChildProfile } from "./types";

export function Header({
  onMenuClick,
  unreadAlerts,
  activeChildIndex,
  onChildChange,
  profiles,
}: {
  onMenuClick: () => void;
  unreadAlerts: number;
  activeChildIndex: number;
  onChildChange: (index: number) => void;
  profiles: ChildProfile[];
}) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 gap-3 shrink-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-primary">
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-semibold text-foreground text-base leading-none">
              Kipi Safe
            </span>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">by SafetyTech</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          {profiles.map((child, index) => (
            <button
              key={String(child.id)}
              onClick={() => onChildChange(index)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150",
                activeChildIndex === index
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              type="button"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  backgroundColor: `hsl(${child.color.replace("hsl(", "").replace(")", "")} / 0.15)`,
                  color: child.color,
                }}
              >
                {child.initial}
              </div>
              <span>{child.name}</span>
              <span className="text-xs text-muted-foreground hidden md:inline">{child.age} años</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Bell className="w-5 h-5" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-warn text-warn-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
              {unreadAlerts}
            </span>
          )}
        </Button>

        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold font-display">
            AN
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export default Header;

