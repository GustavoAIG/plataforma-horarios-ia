import {
  NavLink,
  useNavigate
} from 'react-router-dom'

import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  {
    path: '/app/calendar',
    label: 'Calendario',
    icon: '📅'
  }
]

export default function Sidebar({
  sidebarOpen,
  onToggle,
  onLogout
}) {
  const { user } = useAuth()

  const navigate = useNavigate()

  const initials = useMemo(() => {
    if (!user?.Name_User) return 'E'

    return user.Name_User.charAt(0)
      .toUpperCase()
  }, [user])

  const fullName = useMemo(() => {
    if (!user) return 'Estudiante'

    return [
      user.Name_User,
      user.Last_Name_User_1
    ]
      .filter(Boolean)
      .join(' ')
  }, [user])

  return (
    <aside
      className={`
        fixed
        left-0
        top-0
        z-40
        flex
        min-h-screen
        w-72
        flex-col
        border-r
        border-slate-200
        bg-gradient-to-b
        from-indigo-50
        to-white
        p-6
        transition-transform
        duration-300
        dark:border-slate-800
        dark:from-slate-900
        dark:to-slate-950

        ${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }

        lg:translate-x-0
      `}
    >

      {/* HEADER */}
      <div
        className="
          mb-8
          flex
          items-center
          justify-between
        "
      >

        <button
          type="button"
          onClick={() =>
            navigate('/app/calendar')
          }
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-indigo-600
              text-sm
              font-bold
              text-white
            "
          >
            SL
          </div>

          <div className="text-left">
            <div
              className="
                text-sm
                font-semibold
                text-slate-800
                dark:text-slate-100
              "
            >
              Stressless
            </div>

            <div
              className="
                text-xs
                text-slate-500
                dark:text-slate-400
              "
            >
              Horarios IA
            </div>
          </div>

        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="
            rounded-lg
            p-2
            text-slate-400
            transition-colors
            hover:bg-slate-100
            hover:text-slate-600
            dark:hover:bg-slate-800
            dark:hover:text-slate-200
            lg:hidden
          "
        >
          ⚙️
        </button>

      </div>

      {/* NAVIGATION */}
      <nav
        className="
          flex-1
          space-y-2
        "
        aria-label="Sidebar navigation"
      >

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-medium
              transition-all

              ${
                isActive
                  ? `
                    bg-indigo-100
                    text-indigo-700
                    dark:bg-indigo-900/40
                    dark:text-indigo-200
                  `
                  : `
                    text-slate-700
                    hover:bg-slate-100
                    dark:text-slate-300
                    dark:hover:bg-slate-800
                  `
              }
            `}
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-white/70
                dark:bg-slate-800
              "
              aria-hidden="true"
            >
              {item.icon}
            </div>

            <span>{item.label}</span>

          </NavLink>
        ))}

      </nav>

      {/* USER */}
      <footer
        className="
          mt-8
          border-t
          border-slate-200
          pt-5
          dark:border-slate-800
        "
      >

        <div
          className="
            mb-2
            text-xs
            font-medium
            uppercase
            tracking-wide
            text-slate-500
          "
        >
          Cuenta
        </div>

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            rounded-xl
            bg-white
            p-3
            shadow-sm
            dark:bg-slate-900
          "
        >

          <div className="min-w-0">

            <div
              className="
                truncate
                text-sm
                font-semibold
                text-slate-800
                dark:text-slate-100
              "
            >
              {fullName}
            </div>

            <div
              className="
                truncate
                text-xs
                text-slate-500
              "
            >
              {user?.Email_User || ''}
            </div>

          </div>

          <div
            className="
              flex
              h-10
              w-10
              flex-shrink-0
              items-center
              justify-center
              rounded-full
              bg-indigo-600
              text-sm
              font-semibold
              text-white
            "
          >
            {initials}
          </div>

        </div>

        <button
          type="button"
          onClick={onLogout}
          className="
            mt-4
            w-full
            rounded-lg
            px-3
            py-2
            text-left
            text-sm
            text-slate-500
            transition-colors
            hover:bg-red-50
            hover:text-red-500
            dark:hover:bg-red-950/30
            dark:hover:text-red-400
          "
        >
          Cerrar sesión
        </button>

      </footer>

    </aside>
  )
}