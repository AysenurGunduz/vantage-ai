import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";

export function GuestRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Yükleniyor...
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
