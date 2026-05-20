import { useState } from 'react'

const QUESTIONS = [
  {
    id: 1,
    q: '¿Cuál es tu horario preferido para estudiar?',
    options: [
      'Mañana temprano (6:00-9:00)',
      'Media mañana (9:00-12:00)',
      'Tarde (14:00-18:00)',
      'Noche (18:00-23:00)'
    ]
  },
  {
    id: 2,
    q: '¿Prefieres sesiones de estudio largas o cortas?',
    options: ['Cortas (25-50 min)', 'Largas (90+ min)', 'Mezcla', 'Indiferente']
  },
  { id:3, q:'¿Te distraes con facilidad?', options:['Sí','No','Depende','A veces'] },
  { id:4, q:'¿Usas música mientras estudias?', options:['Sí','No','Depende del tema','Solo sonidos'] },
  { id:5, q:'¿Con cuánta anticipación te gusta preparar exámenes?', options:['1 semana','2 semanas','3 semanas','1 mes'] }
]

export default function LearningTest({ onFinish }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  function select(option) {
    setAnswers({...answers, [QUESTIONS[index].id]: option})
  }

  function next() {
    if (index < QUESTIONS.length - 1) setIndex(i => i+1)
    else onFinish(answers)
  }

  const q = QUESTIONS[index]

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-lg p-6 shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-800 text-white rounded flex items-center justify-center">🧠</div>
        <h3 className="text-lg font-semibold">Test de Estilo de Aprendizaje</h3>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded mb-3 overflow-hidden">
        <div className="h-3 bg-indigo-600" style={{ width: `${((index+1)/QUESTIONS.length)*100}%` }} />
      </div>
      <div className="text-sm text-slate-500 mb-4">Pregunta {index+1} de {QUESTIONS.length}</div>

      <div className="bg-white dark:bg-slate-100/5 p-6 rounded-lg shadow-inner mb-4">
        <h4 className="font-semibold mb-4">{q.q}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {q.options.map((opt)=> (
            <button key={opt} onClick={()=>select(opt)} className={`text-left p-4 rounded-lg border ${answers[q.id]===opt? 'border-indigo-600 bg-indigo-50':'border-slate-100 dark:border-slate-800'} `}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border ${answers[q.id]===opt? 'bg-indigo-600 border-indigo-600':'bg-white border-slate-300'}`} />
                <div>{opt}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={next} className="px-5 py-2 bg-indigo-600 text-white rounded">SIGUIENTE</button>
      </div>
    </div>
  )
}
