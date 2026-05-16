import React from 'react'
import heroImg from '../assets/study.webp'

export default function HeroCard({ onStart }) {
  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-r from-white to-indigo-50 dark:from-slate-900 dark:to-slate-900 rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
      <div className="p-6 flex flex-col justify-center bg-white dark:bg-slate-900">
        <h1 className="text-3xl font-bold mb-2">Stressless</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-4">Reduce tu estrés académico con rutinas inteligentes y una planificación clara.</p>
        <div className="flex gap-3">
          <button onClick={() => onStart()} className="px-5 py-2 bg-indigo-600 text-white rounded-md shadow">Comenzar</button>
          <button className="px-5 py-2 border rounded-md" type="button" onClick={() => alert('Stressless organiza tu estudio, tus cursos y tu calendario de forma simulada.')} >Más información</button>
        </div>
      </div>
      <div className="p-6 flex items-center justify-center bg-indigo-50 dark:bg-slate-800">
        <img src={heroImg} alt="hero" className="w-56 h-auto" />
      </div>
    </div>
  )
}
