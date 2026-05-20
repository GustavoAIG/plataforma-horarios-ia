import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div
      className="
        relative
        flex
        min-h-screen
        overflow-hidden
        bg-slate-100
        dark:bg-slate-950
      "
    >

      {/* BACKGROUND */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-indigo-100
          via-white
          to-slate-100
          dark:from-slate-950
          dark:via-slate-900
          dark:to-slate-950
        "
      />

      {/* DECORATION */}
      <div
        aria-hidden="true"
        className="
          absolute
          left-[-120px]
          top-[-120px]
          h-72
          w-72
          rounded-full
          bg-indigo-500/10
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          bottom-[-140px]
          right-[-100px]
          h-80
          w-80
          rounded-full
          bg-indigo-400/10
          blur-3xl
        "
      />

      {/* CONTENT */}
      <main
        className="
          relative
          z-10
          flex
          w-full
          flex-1
          items-start
          justify-center
          overflow-y-auto
          p-4
          sm:p-6
          lg:p-10
        "
      >

        <div
          className="
            my-auto
            w-full
            max-w-2xl
            rounded-3xl
            border
            border-white/40
            bg-white/80
            p-6
            shadow-2xl
            backdrop-blur-xl
            dark:border-slate-800
            dark:bg-slate-900/80
            sm:p-8
            lg:p-10
          "
        >
          <Outlet />
        </div>

      </main>

    </div>
  )
}