import { useState, useEffect, useMemo, useCallback } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { GlobalStatus } from "@/components/dashboard/GlobalStatus";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";
import { ScreenTimeChart } from "@/components/dashboard/ScreenTimeChart";
import { RecentApps } from "@/components/dashboard/RecentApps";
import { AITransparency } from "@/components/dashboard/AITransparency";
import { DeviceManagement } from "@/components/dashboard/DeviceManagement";
import { ParentalAgreements } from "@/components/dashboard/ParentalAgreements";
import { ManualAlertForm } from "@/components/dashboard/ManualAlertForm";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { EducationalMissions } from "@/components/dashboard/EducationalMissions";
import { ParentalChat } from "@/components/dashboard/ParentalChat";
import { mockChildren, mockAlerts } from "@/mockData";
import { useAuth } from "@/context/AuthContext";
import { apiUrl } from "@/lib/api";
import type { AlertItem, ChildProfile } from "@/components/dashboard/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(s: unknown) {
  return typeof s === "string" && UUID_RE.test(s);
}

function hueFromString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

type ApiMinor = {
  minor_id: string;
  name?: string | null;
  age_mode?: "child" | "teen" | string | null;
  alertas_recientes?: any[];
};

function mapMinorToProfile(minor: ApiMinor): ChildProfile {
  const id = minor.minor_id;
  const hue = hueFromString(id);
  const age = minor.age_mode === "child" ? 12 : 16;
  return {
    id,
    name: minor.name || "Menor",
    age,
    initial: (minor.name || "?").charAt(0).toUpperCase(),
    grade: "—",
    school: "—",
    color: `hsl(${hue}, 55%, 48%)`,
  };
}

function mapApiAlert(row: any): AlertItem {
  const level: AlertItem["level"] =
    row.risk_level === 3 ? "high" : row.risk_level === 2 ? "medium" : "info";
  const fecha = row.fecha || row.created_at;
  let timestamp = "Reciente";
  try {
    const d = new Date(fecha);
    if (!Number.isNaN(d.getTime())) {
      timestamp = d.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
    }
  } catch {
    /* ignore */
  }
  const ap = row.asistente_parental;
  const summary = ap?.guia_contextual
    ? String(ap.guia_contextual).slice(0, 320)
    : `Alerta nivel ${row.risk_level} (${row.app_source || "App"})`;
  const intervention = Array.isArray(ap?.recursos)
    ? `Recursos: ${ap.recursos.join(", ")}`
    : row.sensitive_data_flag
      ? "Posible exposición de datos sensibles."
      : "";

  return {
    id: row.id,
    level,
    category: row.sensitive_data_flag ? "Datos sensibles" : `Nivel ${row.risk_level}`,
    platform: row.app_source || "Sistema",
    timestamp,
    summary,
    intervention,
    read: false,
    patternCount: 0,
    riskScore: row.risk_level === 3 ? 90 : row.risk_level === 2 ? 55 : 20,
  };
}

export default function Dashboard() {
  const { user, accessToken, supabaseMode } = useAuth() as any;
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts as any);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showManualAlertModal, setShowManualAlertModal] = useState(false);

  const [remoteMinors, setRemoteMinors] = useState<ApiMinor[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  const useLiveApi = supabaseMode && !!accessToken && user?.id && isUuid(user.id);

  const loadDashboard = useCallback(async () => {
    if (!useLiveApi) return;
    setRemoteLoading(true);
    setRemoteError(null);
    try {
      const res = await fetch(`${apiUrl("/api/dashboard")}?parent_id=${encodeURIComponent(user.id)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) throw new Error(body.message || body.error || `HTTP ${res.status}`);
      if (!body.ok || !Array.isArray(body.minors)) throw new Error("Respuesta del servidor inesperada.");
      setRemoteMinors(body.minors as ApiMinor[]);
    } catch (e) {
      setRemoteError(e instanceof Error ? e.message : "Error al cargar datos.");
      setRemoteMinors([]);
    } finally {
      setRemoteLoading(false);
    }
  }, [useLiveApi, accessToken, user?.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const profiles: ChildProfile[] = useMemo(() => {
    if (useLiveApi) return remoteMinors.map(mapMinorToProfile);
    return mockChildren as any;
  }, [useLiveApi, remoteMinors]);

  useEffect(() => {
    if (activeChildIndex >= profiles.length) setActiveChildIndex(0);
  }, [activeChildIndex, profiles.length]);

  const activeChild = profiles[activeChildIndex] || profiles[0];
  const activeMinorId = activeChild?.id != null ? String(activeChild.id) : null;
  const minorIdIsApiReady = activeMinorId != null && isUuid(activeMinorId);

  useEffect(() => {
    if (!useLiveApi || !remoteMinors.length) {
      setAlerts(mockAlerts as any);
      return;
    }
    const minor = remoteMinors[activeChildIndex] || remoteMinors[0];
    const raw = minor?.alertas_recientes || [];
    setAlerts(raw.map(mapApiAlert));
  }, [useLiveApi, remoteMinors, activeChildIndex]);

  const unreadAlerts = alerts.filter((a) => !a.read).length;
  const globalStatus: "safe" | "alert" = unreadAlerts > 0 ? "alert" : "safe";

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const hourStr = now.getHours();
  const greeting = hourStr < 12 ? "Buenos días" : hourStr < 18 ? "Buenas tardes" : "Buenas noches";

  const parentName = user?.name?.split?.(" ")?.[0] || "Padre/madre";

  const handleMarkRead = (id: AlertItem["id"]) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const handleDismiss = (id: AlertItem["id"]) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        onMenuClick={() => setMobileSidebarOpen(true)}
        unreadAlerts={unreadAlerts}
        activeChildIndex={activeChildIndex}
        onChildChange={setActiveChildIndex}
        profiles={profiles}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="hidden lg:flex" activeSection={activeSection} onSectionChange={setActiveSection} />

        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 border-r border-border">
            <Sidebar
              isMobile
              activeSection={activeSection}
              onSectionChange={(s) => {
                setActiveSection(s);
                setMobileSidebarOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-auto scrollbar-thin p-4 md:p-5 lg:p-6 pb-24 lg:pb-8">
          {remoteLoading && useLiveApi && (
            <p className="text-sm text-muted-foreground mb-2">Cargando datos reales…</p>
          )}
          {remoteError && useLiveApi && <p className="text-sm text-destructive mb-2">{remoteError}</p>}

          <div className="mb-4">
            <h1 className="text-xl font-display font-bold text-foreground">
              {greeting}, {parentName}
            </h1>
            <p className="text-sm text-muted-foreground capitalize">{dateStr}</p>
            {useLiveApi && (
              <p className="text-xs text-muted-foreground mt-1">
                Modo conectado al backend (menores y alertas desde Supabase).
              </p>
            )}
          </div>

          <GlobalStatus status={globalStatus} unreadAlerts={unreadAlerts} childName={activeChild?.name || "tu hijo/a"} />

          <div className="mt-5 max-w-3xl">
            <StreakCounter
              parentId={user?.id}
              accessToken={accessToken}
              enabled={!!useLiveApi}
              childName={activeChild?.name || "tu hijo"}
            />
          </div>

          <div className="mt-5">
            <EducationalMissions parentId={user?.id} accessToken={accessToken} enabled={!!useLiveApi} />
          </div>

          <div className="mt-5 max-w-3xl">
            <ParentalChat
              parentId={user?.id}
              accessToken={accessToken}
              enabled={!!useLiveApi}
              activeSection={activeSection}
            />
          </div>

          {useLiveApi && !remoteLoading && profiles.length === 0 && !remoteError && (
            <p className="text-sm text-muted-foreground mb-3">
              No hay menores asociados a tu cuenta en la base de datos. Crea o vincula un menor en Supabase para usar
              alertas manuales y análisis con IA.
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setShowManualAlertModal(true)}
              disabled={supabaseMode && !!accessToken && !minorIdIsApiReady}
              title={
                supabaseMode && accessToken && !minorIdIsApiReady
                  ? "Selecciona un menor con UUID válido (datos cargados desde el servidor)"
                  : undefined
              }
              className="px-4 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-light transition disabled:opacity-50 disabled:pointer-events-none"
            >
              + Alerta Manual
            </button>
          </div>

          <div className="mt-5">
            <AlertsFeed
              alerts={alerts}
              onMarkRead={handleMarkRead}
              onDismiss={handleDismiss}
              minorId={minorIdIsApiReady ? activeMinorId : (activeChild?.id as any)}
              analyzeDisabled={supabaseMode && !!accessToken && !minorIdIsApiReady}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
            <ScreenTimeChart />
            <RecentApps />
          </div>

          <div className="mt-4 lg:mt-5 grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5">
            <div className="xl:col-span-2">
              <AITransparency />
            </div>
            <div className="flex flex-col gap-4">
              <DeviceManagement />
              <ParentalAgreements
                minorId={minorIdIsApiReady ? activeMinorId : (activeChild?.id as any)}
                switchesDisabled={supabaseMode && !!accessToken && !minorIdIsApiReady}
              />
            </div>
          </div>
        </main>
      </div>

      <ManualAlertForm
        open={showManualAlertModal}
        onOpenChange={setShowManualAlertModal}
        minorId={minorIdIsApiReady ? activeMinorId : (activeChild?.id as any)}
        onSuccess={loadDashboard}
      />

      <BottomNav unreadAlerts={unreadAlerts} activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}

