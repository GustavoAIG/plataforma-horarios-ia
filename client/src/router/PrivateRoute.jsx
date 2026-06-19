import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="app-loading-screen">Cargando Stressless...</div>
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!user.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}