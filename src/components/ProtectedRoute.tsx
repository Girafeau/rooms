// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export function ProtectedRoute() {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (location.pathname === "/consulter") {
    return <Outlet />
  }

  if (loading) {
    return <p>Chargement...</p>
  }

  return user ? <Outlet /> : <Navigate to="/connexion" replace />
}
