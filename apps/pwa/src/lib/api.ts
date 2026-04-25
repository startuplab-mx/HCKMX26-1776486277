export function apiUrl(path: string): string {
  // En la PWA usamos proxy de Vite a backend, así que mantenemos rutas relativas `/api/...`.
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

