import {
  Navigate,
  Outlet
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function OnboardingRoute() {
  const {
    user,
    isLoading
  } = useAuth()

  if (isLoading) {
    return (
      <div>
        Verificando sesión...
      </div>
    )
  }

  // NO LOGEADO
  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    )
  }

  // YA COMPLETÓ ONBOARDING
  if (user.hasCompletedOnboarding) {
    return (
      <Navigate
        to="/app/calendar"
        replace
      />
    )
  }

  // PUEDE ENTRAR
  return <Outlet />
}