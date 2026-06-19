import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

import AppLayout from '../layouts/AppLayout'
import PublicLayout from '../layouts/PublicLayout'

import PrivateRoute from './PrivateRoute'
import OnboardingRoute from './OnboardingRoute'

import LandingPage from '../pages/LandingPage'
import AuthPage from '../components/AuthPage'

import SplashPage from '../pages/SplashPage'
import TestPage from '../pages/TestPage'
import CoursesPage from '../pages/CoursesPage'

import CalendarPage from '../pages/CalendarPage'

export default function AppRouter() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="app-loading-screen">
        Cargando Stressless...
      </div>
    )
  }

  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}
        <Route element={<PublicLayout />}>

          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/auth"
            element={<AuthPage />}
          />

        </Route>

        {/* ONBOARDING */}
        <Route
          element={<OnboardingRoute />}
        >

          <Route path="/onboarding">

            <Route
              index
              element={<SplashPage />}
            />

            <Route
              path="test"
              element={<TestPage />}
            />

            <Route
              path="cursos"
              element={<CoursesPage />}
            />

          </Route>

        </Route>

        {/* APP */}
        <Route element={<PrivateRoute />}>

          <Route
            path="/app/calendar"
            element={<CalendarPage />}
          />

        </Route>

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  )
}