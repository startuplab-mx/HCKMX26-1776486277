import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet, Navigate, useLocation } from "react-router";
import { registerSW } from "virtual:pwa-register";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PairingPage from "./pages/PairingPage";
import "./index.css";
import React from "react";

type ErrorBoundaryProps = { children?: React.ReactNode };
type ErrorBoundaryState = { hasError: boolean; error: unknown };

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', fontFamily: 'monospace' }}>
          <h2>Algo salió mal en el renderizado:</h2>
          <pre>{String(this.state.error)}</pre>
          <pre>{this.state.error instanceof Error ? this.state.error.stack : ""}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Componente para proteger rutas que requieren sesión iniciada
const PrivateRoute = () => {
  const { user, authLoading, isNewUser } = useAuth();
  const location = useLocation();
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  if (isNewUser && location.pathname !== "/pairing") return <Navigate to="/pairing" replace />;
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "pairing",
        element: <PairingPage />,
      },
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      }
    ]
  }
]);

if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister().catch(() => {}));
  });
} else {
  registerSW({ immediate: true });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
