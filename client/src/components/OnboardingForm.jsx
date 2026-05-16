import React, { useState } from 'react'

export default function OnboardingForm({ onComplete }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ faculty: '', year: '', preferences: '' })

  function next() {
    if (step < 3) setStep((s) => s + 1)
    else {
      setTimeout(() => onComplete(form), 500)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-lg shadow grid grid-cols-1 md:grid-cols-3 overflow-hidden">
      <div className="md:col-span-1 p-6 bg-indigo-50 dark:bg-slate-800 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Onboarding</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Completa tu información para optimizar sugerencias y horarios.</p>
        <div className="mt-auto">
          <ol className="text-sm space-y-2">
            <li className={`px-3 py-2 rounded ${step===1? 'bg-indigo-100 dark:bg-indigo-900/40 font-semibold':''}`}>1. Datos básicos</li>
            <li className={`px-3 py-2 rounded ${step===2? 'bg-indigo-100 dark:bg-indigo-900/40 font-semibold':''}`}>2. Preferencias</li>
            <li className={`px-3 py-2 rounded ${step===3? 'bg-indigo-100 dark:bg-indigo-900/40 font-semibold':''}`}>3. Resumen</li>
          </ol>
        </div>
      </div>

      <div className="md:col-span-2 p-6">
        {step === 1 && (
          <div>
            <label className="block mb-2">Facultad</label>
            <input className="w-full p-3 border rounded mb-4" value={form.faculty} onChange={(e)=>setForm({...form, faculty:e.target.value})} />
            <label className="block mb-2">Año</label>
            <input className="w-full p-3 border rounded" value={form.year} onChange={(e)=>setForm({...form, year:e.target.value})} />
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block mb-2">Preferencias de estudio</label>
            <textarea className="w-full p-3 border rounded h-40" value={form.preferences} onChange={(e)=>setForm({...form, preferences:e.target.value})} />
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-medium mb-2">Resumen</h3>
            <pre className="bg-slate-50 dark:bg-slate-800 p-4 rounded">{JSON.stringify(form, null, 2)}</pre>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <div>
            {step>1 && <button onClick={()=>setStep(s=>s-1)} className="px-4 py-2 border rounded mr-2">Atrás</button>}
          </div>
          <div>
            <button onClick={next} className="px-5 py-2 bg-indigo-600 text-white rounded">{step<3? 'Siguiente' : 'Finalizar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
