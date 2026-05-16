import React, { useState } from 'react'
import { courses as mockCourses } from '../data/mock'

export default function CoursesEnroll({ onGenerate, onAddManual, onImport }) {
  const [selected, setSelected] = useState([])

  function toggle(id) {
    setSelected(s => s.includes(id)? s.filter(x=>x!==id): [...s, id])
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-lg p-6 shadow">
      <h3 className="text-xl font-semibold mb-3">Cursos Matriculados</h3>
      <div className="mb-4 p-4 bg-indigo-50 dark:bg-slate-800 rounded">La IA generará un horario personalizado para cada curso.</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockCourses.map(c=> (
          <div key={c.id} className={`p-4 rounded-lg border flex items-center justify-between ${selected.includes(c.id)? 'border-indigo-300 bg-indigo-50':'border-slate-100 dark:border-slate-800'}`}>
            <div>
              <div className="font-semibold">{c.title}</div>
              <div className="text-sm text-slate-500">{c.teacher} • 3 créditos</div>
            </div>
            <div>
              <input type="checkbox" checked={selected.includes(c.id)} onChange={()=>toggle(c.id)} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button className="px-4 py-2 bg-violet-100 rounded" type="button" onClick={() => onAddManual ? onAddManual() : alert('Abrir formulario manual')}>+ Agregar curso manualmente</button>
        <button className="px-4 py-2 bg-violet-100 rounded" type="button" onClick={() => onImport ? onImport(selected) : alert('Importación simulada')}>+ Importar desde sistema universitario</button>
      </div>

      <div className="mt-6">
        <button onClick={()=>onGenerate(selected)} type="button" className="w-full py-3 bg-slate-800 text-white rounded-lg shadow">GENERAR MI HORARIO</button>
      </div>
    </div>
  )
}
