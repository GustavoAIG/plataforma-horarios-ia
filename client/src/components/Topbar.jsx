import React from 'react'

export default function Topbar({ user }) {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-white/60 dark:bg-slate-900/60">
      <div className="text-xl font-bold">Horarios IA</div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-300">{user.name}</div>
        <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">M</div>
      </div>
    </header>
  )
}
