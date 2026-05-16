import React from 'react'

export default function Dashboard({ stats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <aside className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-lg p-4 shadow">
        <div className="text-sm text-slate-500">Resumen</div>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Horas estudiadas</div>
            <div className="text-lg font-bold">{stats.hoursStudied}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Prom. sueño</div>
            <div className="text-lg font-bold">{stats.avgSleep} h</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Cursos</div>
            <div className="text-lg font-bold">{stats.completedCourses}</div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-slate-500 mb-2">Progreso general</div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div className="h-3 bg-indigo-600" style={{ width: `${stats.progressPercent}%` }} />
            </div>
            <div className="text-xs text-slate-500 mt-1">{stats.progressPercent}% completado</div>
          </div>
        </div>
      </aside>

      <section className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
            <h4 className="font-semibold">Actividad reciente</h4>
            <div className="text-sm text-slate-500 mt-2">No hay actividades recientes (simulado)</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
            <h4 className="font-semibold">Tareas próximas</h4>
            <ul className="mt-2 text-sm text-slate-500">
              <li>Entrega tarea Matemáticas — Vie</li>
              <li>Repaso Física — Lun</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
          <h4 className="font-semibold mb-2">Gráfica de rendimiento (simulada)</h4>
          <div className="h-44 bg-slate-50 dark:bg-slate-800 rounded flex items-center justify-center text-slate-400">[Gráfica]</div>
        </div>
      </section>
    </div>
  )
}
