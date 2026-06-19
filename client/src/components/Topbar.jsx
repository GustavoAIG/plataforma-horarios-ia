import { useMemo } from 'react'

export default function Topbar({
  user
}) {
  const userName = useMemo(() => {
    if (!user) return 'Estudiante'

    return (
      user.name ||
      user.Name_User ||
      'Estudiante'
    )
  }, [user])

  const initials = useMemo(() => {
    const source =
      user?.name ||
      user?.Name_User ||
      'E'

    return source
      .charAt(0)
      .toUpperCase()
  }, [user])

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        items-center
        justify-between
        border-b
        border-slate-200
        bg-white/80
        px-5
        py-4
        backdrop-blur-md
        dark:border-slate-800
        dark:bg-slate-900/80
      "
    >

      {/* LEFT */}
      <div>

        <h1
          className="
            text-xl
            font-bold
            tracking-tight
            text-slate-900
            dark:text-white
          "
        >
          Horarios IA
        </h1>

        <p
          className="
            mt-1
            hidden
            text-sm
            text-slate-500
            dark:text-slate-400
            sm:block
          "
        >
          Organiza tus horarios y
          sesiones de estudio.
        </p>

      </div>

      {/* RIGHT */}
      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <div
          className="
            hidden
            text-right
            sm:block
          "
        >

          <div
            className="
              max-w-[180px]
              truncate
              text-sm
              font-medium
              text-slate-700
              dark:text-slate-200
            "
          >
            {userName}
          </div>

          <div
            className="
              text-xs
              text-slate-500
              dark:text-slate-400
            "
          >
            Usuario activo
          </div>

        </div>

        {/* AVATAR */}
        <button
          type="button"
          aria-label="Perfil de usuario"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-indigo-600
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:scale-105
            focus:outline-none
            focus:ring-2
            focus:ring-indigo-400
          "
        >
          {initials}
        </button>

      </div>

    </header>
  )
}