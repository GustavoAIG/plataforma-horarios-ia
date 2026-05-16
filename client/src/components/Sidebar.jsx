import React from 'react'

export default function Sidebar({ current, onSelect }) {
  const items = [
    { id: 'home', label: 'Inicio', icon: '🏠' },
    { id: 'onboarding', label: 'Onboarding', icon: '🧭' },
    { id: 'courses', label: 'Cursos', icon: '📚' },
    { id: 'dashboard', label: 'Panel', icon: '📊' },
  ]

  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 border-r">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">PH</div>
        <div>
          <div className="text-sm font-semibold">Plataforma</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Horarios IA</div>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map((it) => (
          <button
            key={it.id}
            className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              current === it.id
                ? 'bg-indigo-100 dark:bg-indigo-900/40 font-semibold text-indigo-700 dark:text-indigo-200'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => onSelect(it.id)}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-md bg-white/60 dark:bg-slate-800">{it.icon}</div>
            <div>{it.label}</div>
          </button>
        ))}
      </nav>

      <div className="mt-8">
        <div className="text-xs text-slate-500 mb-2">Cuenta</div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-between">
          <div>
            <div className="font-medium">María Pérez</div>
            <div className="text-xs text-slate-500">Estudiante</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">M</div>
        </div>
      </div>
    </aside>
  )
}
