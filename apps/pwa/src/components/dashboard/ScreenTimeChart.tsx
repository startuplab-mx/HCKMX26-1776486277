import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import { Clock, TrendingUp } from "lucide-react";
import { screenTimeCategoryData, weeklyScreenTimeData } from "@/mockData";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS = [
  "hsl(213, 55%, 48%)",
  "hsl(38, 85%, 50%)",
  "hsl(270, 48%, 55%)",
  "hsl(157, 55%, 40%)",
  "hsl(193, 65%, 42%)",
];

function CategoryTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-elevated">
        <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-bold text-foreground">{payload[0].value}h hoy</p>
      </div>
    );
  }
  return null;
}

function WeeklyTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-elevated">
        <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-bold text-foreground">{payload[0].value}h de pantalla</p>
      </div>
    );
  }
  return null;
}

export function ScreenTimeChart() {
  const [activeTab, setActiveTab] = useState<"category" | "weekly">("category");

  const totalToday = screenTimeCategoryData.reduce((acc, item) => acc + item.hours, 0).toFixed(1);

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-subtle flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">Tiempo de Pantalla</h3>
            <p className="text-xs text-muted-foreground">
              Hoy · <span className="font-semibold text-foreground">{totalToday}h</span> en total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {[
            { id: "category", label: "Por App" },
            { id: "weekly", label: "Semana" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "category" | "weekly")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150",
                activeTab === tab.id ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              )}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-52">
        {activeTab === "category" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={screenTimeCategoryData} margin={{ top: 5, right: 10, left: -22, bottom: 5 }} barCategoryGap="32%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 18%, 90%)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(213, 16%, 50%)", fontSize: 11, fontFamily: "Inter" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(213, 16%, 50%)", fontSize: 11, fontFamily: "Inter" }} tickFormatter={(v) => `${v}h`} />
              <Tooltip content={<CategoryTooltip />} cursor={{ fill: "hsl(213, 28%, 96%)", radius: 4 }} />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {screenTimeCategoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyScreenTimeData} margin={{ top: 5, right: 10, left: -22, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(213, 55%, 48%)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="hsl(213, 55%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 18%, 90%)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(213, 16%, 50%)", fontSize: 11, fontFamily: "Inter" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(213, 16%, 50%)", fontSize: 11, fontFamily: "Inter" }} tickFormatter={(v) => `${v}h`} />
              <Tooltip content={<WeeklyTooltip />} />
              <ReferenceLine
                y={5.1}
                stroke="hsl(38, 85%, 50%)"
                strokeDasharray="4 3"
                strokeOpacity={0.6}
                label={{ value: "Promedio", fill: "hsl(38, 85%, 50%)", fontSize: 10, position: "insideTopRight" }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="hsl(213, 55%, 48%)"
                strokeWidth={2.5}
                fill="url(#areaGradient)"
                dot={{ fill: "hsl(213, 55%, 48%)", stroke: "hsl(0, 0%, 100%)", strokeWidth: 2, r: 3.5 }}
                activeDot={{ r: 5.5, fill: "hsl(213, 55%, 48%)", stroke: "hsl(0, 0%, 100%)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {activeTab === "category" && (
        <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-x-3 gap-y-1.5">
          {screenTimeCategoryData.map((item, index) => (
            <div key={item.key} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: CATEGORY_COLORS[index] }} />
              <span className="text-[11px] text-muted-foreground">
                {item.name} <span className="font-semibold text-foreground">{item.hours}h</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "weekly" && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-warn" />
          <span className="text-xs text-muted-foreground">
            Promedio semanal: <span className="font-semibold text-foreground">5.1h/día</span>
            {" ·  "}
            <span className="text-warn font-medium">+12% vs semana anterior</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default ScreenTimeChart;

