import {
  useCallback,
  useState
} from 'react'

import {
  Outlet,
  useNavigate
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AppLayout() {
  const {
    user,
    logout
  } = useAuth()

  const navigate = useNavigate()

  const [sidebarOpen,
    setSidebarOpen] =
    useState(false)

  const toggleSidebar =
    useCallback(() => {
      setSidebarOpen((prev) => !prev)
    }, [])

  const closeSidebar =
    useCallback(() => {
      setSidebarOpen(false)
    }, [])

  const handleLogout =
    useCallback(async () => {
      try {
        await logout()

        navigate('/', {
          replace: true
        })
      } catch (error) {
        console.error(
          'Logout failed:',
          error
        )
      }
    }, [logout, navigate])

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        dark:bg-slate-950
      "
    >

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="
            fixed
            inset-0
            z-30
            bg-black/40
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* SIDEBAR */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onLogout={handleLogout}
      />

      {/* CONTENT */}
      <div
        className="
          flex
          min-h-screen
          flex-col
          lg:pl-72
        "
      >

        {/* TOPBAR */}
        <Topbar user={user} />

        {/* PAGE */}
        <main
          className="
            flex-1
            overflow-y-auto
            p-4
            sm:p-6
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-7xl
            "
          >
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  )
}