import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="app-loading-screen">Cargando Stressless...</div>
  }

  // Bypass temporal para visualizar el calendario localmente sin servidor/red
  return <Outlet />
}