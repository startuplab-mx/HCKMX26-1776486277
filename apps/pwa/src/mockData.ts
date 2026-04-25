export type ChildProfile = {
  id: string | number;
  name: string;
  age: number;
  initial: string;
  grade: string;
  school: string;
  color: string; // e.g. "hsl(213, 56%, 48%)"
};

export type AlertLevel = "high" | "medium" | "info";

export type AlertItem = {
  id: string | number;
  level: AlertLevel;
  category: string;
  platform: string;
  timestamp: string;
  summary: string;
  intervention: string;
  read: boolean;
  patternCount: number;
  riskScore: number;
};

export const mockChildren: ChildProfile[] = [
  {
    id: 1,
    name: "Mateo",
    age: 13,
    initial: "M",
    grade: "7° Grado",
    school: "Colegio San Ignacio",
    color: "hsl(213, 56%, 48%)",
  },
  {
    id: 2,
    name: "Sofía",
    age: 10,
    initial: "S",
    grade: "5° Grado",
    school: "Colegio San Ignacio",
    color: "hsl(280, 50%, 52%)",
  },
];

export const mockAlerts: AlertItem[] = [
  {
    id: 1,
    level: "high",
    category: "Posible Grooming",
    platform: "Instagram",
    timestamp: "Hace 23 min",
    summary:
      "El motor de IA ha detectado un perfil de adulto desconocido intentando obtener información de ubicación y fotografías privadas del menor en múltiples interacciones recientes.",
    intervention:
      "No confisques el dispositivo de inmediato. Acércate con calma y pregunta si alguna cuenta nueva le ha estado enviando mensajes que lo hagan sentir incómodo. Escucha activamente antes de actuar.",
    read: false,
    patternCount: 7,
    riskScore: 87,
  },
  {
    id: 2,
    level: "medium",
    category: "Cyberbullying Potencial",
    platform: "WhatsApp",
    timestamp: "Hace 2 horas",
    summary:
      "Se detectaron patrones de lenguaje hostil y presión social dirigidos al perfil del menor desde múltiples cuentas de un mismo grupo de contactos.",
    intervention:
      "Aborda el tema del cyberbullying con empatía. Pregúntale cómo se ha sentido con sus interacciones en línea últimamente. No menciones el monitoreo directamente.",
    read: false,
    patternCount: 3,
    riskScore: 54,
  },
  {
    id: 3,
    level: "info",
    category: "Nueva App con Chat Privado",
    platform: "Sistema",
    timestamp: "Ayer, 8:45 PM",
    summary:
      "TikTok fue instalada en el dispositivo. Esta aplicación incluye funciones de mensajería directa que quedarán bajo monitoreo de IA a partir de ahora.",
    intervention:
      "Establece reglas claras de uso para apps con chat. Revisa juntos la configuración de privacidad y considera activar el modo restringido desde los ajustes.",
    read: true,
    patternCount: 0,
    riskScore: 0,
  },
];

export const screenTimeCategoryData: Array<{ name: string; hours: number; key: string }> = [
  { name: "Juegos", hours: 3.0, key: "games" },
  { name: "Redes Soc.", hours: 2.5, key: "social" },
  { name: "Videos", hours: 1.5, key: "videos" },
  { name: "Educación", hours: 1.0, key: "education" },
  { name: "Comunic.", hours: 0.5, key: "communication" },
];

export const weeklyScreenTimeData: Array<{ day: string; hours: number }> = [
  { day: "Lun", hours: 4.5 },
  { day: "Mar", hours: 3.8 },
  { day: "Mié", hours: 5.2 },
  { day: "Jue", hours: 4.1 },
  { day: "Vie", hours: 6.0 },
  { day: "Sáb", hours: 7.5 },
  { day: "Dom", hours: 6.2 },
];

export const recentApps: Array<{
  id: number;
  name: string;
  action: string;
  time: string;
  initial: string;
  bgColor: string; // "213, 56%, 48%"
  risk: "low" | "medium" | "high";
  category: string;
}> = [
  {
    id: 1,
    name: "TikTok",
    action: "Instalada",
    time: "Hoy, 3:21 PM",
    initial: "T",
    bgColor: "213, 56%, 48%",
    risk: "medium",
    category: "Redes Sociales",
  },
  {
    id: 2,
    name: "Roblox",
    action: "Actualizada",
    time: "Ayer",
    initial: "R",
    bgColor: "157, 55%, 40%",
    risk: "low",
    category: "Juegos",
  },
  {
    id: 3,
    name: "Minecraft",
    action: "Actualizada",
    time: "Hace 3 días",
    initial: "M",
    bgColor: "38, 70%, 45%",
    risk: "low",
    category: "Juegos",
  },
  {
    id: 4,
    name: "YouTube",
    action: "Instalada",
    time: "Hace 4 días",
    initial: "Y",
    bgColor: "193, 60%, 38%",
    risk: "medium",
    category: "Videos",
  },
  {
    id: 5,
    name: "WhatsApp",
    action: "Instalada",
    time: "Hace 1 semana",
    initial: "W",
    bgColor: "270, 48%, 52%",
    risk: "medium",
    category: "Comunicación",
  },
];

export const mockDevices: Array<{
  id: number;
  name: string;
  model: string;
  os: string;
  status: "online" | "offline";
  battery: number;
  lastSync: string;
  childName: string;
  type: "phone" | "tablet";
  protectionActive: boolean;
}> = [
  {
    id: 1,
    name: "iPhone de Mateo",
    model: "iPhone 13",
    os: "iOS 17.4",
    status: "online",
    battery: 78,
    lastSync: "Hace 2 min",
    childName: "Mateo",
    type: "phone",
    protectionActive: true,
  },
  {
    id: 2,
    name: "iPad Familiar",
    model: "iPad Air (5ta Gen)",
    os: "iPadOS 17.4",
    status: "online",
    battery: 92,
    lastSync: "Hace 15 min",
    childName: "Sofía",
    type: "tablet",
    protectionActive: true,
  },
];

export const aiStats = {
  messagesAnalyzed: 1452,
  privacyBreaches: 0,
  threatsDetected: 2,
  lastAudit: "Hace 3 min",
  dataRetentionDays: 0,
  processingLocal: true,
  weeklyGrowthPercent: 12,
};

