import React from 'react'
import logoSrc from '../assets/hero.png'

export default function SplashModal({ onClose, onStart }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-xl p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <img src={logoSrc} alt="logo" className="w-20 h-20 rounded-lg object-cover" />
          <h2 className="text-3xl font-bold">Stressless</h2>
          <p className="text-slate-600 dark:text-slate-300">Calendario Académico Inteligente</p>
          <div className="mt-2 px-4 py-2 bg-indigo-50 rounded-full text-sm">Reduce tu estrés académico hasta un 40%</div>
          <div className="mt-6 flex gap-3">
            <button onClick={onStart} className="px-6 py-3 bg-slate-800 text-white rounded-md shadow">COMENZAR</button>
            <button onClick={onClose} className="px-6 py-3 border rounded-md">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
