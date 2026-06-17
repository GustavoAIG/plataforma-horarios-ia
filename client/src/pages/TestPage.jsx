import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './TestPage.css'

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
      <path
        d="M8 7a3.5 3.5 0 0 1 6.8-1A3.2 3.2 0 0 1 18 9c0 1.4-.7 2.6-1.9 3.3V14A3 3 0 0 1 13 17h-2a3 3 0 0 1-3-3v-1.7A3.5 3.5 0 0 1 8 7Z"
        fill="none" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

// Preguntas del test de estilo de aprendizaje. 
// Las últimas tres preguntas fueron añadidas para recopilar información clave de los cursos (dificultad, prioridad y recursos de apoyo).
const learningQuestions = [
  { prompt: '¿Cuál es tu horario preferido para estudiar?', options: ['Mañana temprano (6:00-9:00)', 'Media mañana (9:00-12:00)', 'Tarde (14:00-18:00)', 'Noche (18:00-23:00)'] },
  { prompt: '¿Qué duración prefieres para una sesión de estudio?', options: ['25-50 min', '60-90 min', '90+ min', 'Depende del tema'] },
  { prompt: '¿Cómo te concentras mejor?', options: ['En silencio absoluto', 'Con música suave/Lofi', 'Con pausas frecuentes y café', 'En ambientes de estudio grupal'] },
  { prompt: '¿Con cuánta anticipación te preparas para los exámenes?', options: ['1 semana', '2 semanas', '3 semanas', 'Unos días antes'] },
  { prompt: '¿Qué tipo de cursos te resulta más difícil o requiere más esfuerzo?', options: ['Cursos prácticos (cálculo/números)', 'Cursos teóricos (lectura/memorización)', 'Proyectos y laboratorios', 'Todos por igual'] },
  { prompt: '¿Cómo describirías la materia a la que necesitas darle mayor prioridad?', options: ['Muy técnica y analítica', 'Con mucha teoría y lecturas', 'Basada en proyectos y entregas', 'Enfocada en exposiciones o debates'] },
  { prompt: '¿Qué tipo de recurso o técnica crees que te ayudaría más con tus materias actuales?', options: ['Ejercicios resueltos paso a paso', 'Mapas mentales y resúmenes de lecturas', 'Cronogramas de entregas semanales', 'Simulacros de exámenes'] }
]

export default function TestPage() {
  const navigate = useNavigate()
  const [index, setIndex]           = useState(0)
  const [answers, setAnswers]       = useState(Array(learningQuestions.length).fill(null))

  const progress = ((index + 1) / learningQuestions.length) * 100

  function selectOption(option) {
    setAnswers(prev => {
      const copy = [...prev]
      copy[index] = option
      return copy
    })
  }

  function goNext() {
    if (index < learningQuestions.length - 1) {
      setIndex(i => i + 1)
    } else {
      navigate('/onboarding/cursos', { state: { answers } })
    }
  }

  function goPrev() {
    setIndex(i => Math.max(0, i - 1))
  }

  return (
    <section className="page page--test">
      <div className="screen-card test-card">

        <div className="header-row">
          <div className="section-icon"><BrainIcon /></div>
          <div>
            <h2 className="section-title">Test de Estilo de Aprendizaje</h2>
            <div className="progress-row">
              {learningQuestions.map((_, current) => (
                <span
                  key={current}
                  className={`progress-segment ${current <= index ? 'is-active' : ''}`}
                />
              ))}
            </div>
            <div className="section-helper">Pregunta {index + 1} de {learningQuestions.length}</div>
          </div>
        </div>

        <div className="question-card">
          <h3 className="question-title">{learningQuestions[index].prompt}</h3>
          <div className="options-grid">
            {learningQuestions[index].options.map((option) => (
              <button
                key={option}
                className={`option-card ${answers[index] === option ? 'is-selected' : ''}`}
                type="button"
                onClick={() => selectOption(option)}
              >
                <span className="radio-circle" />
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="test-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={goPrev}
            disabled={index === 0}
          >
            ATRÁS
          </button>

          <div className="progress-inline">{Math.round(progress)}% completado</div>

          <button
            className="primary-button primary-button--compact"
            type="button"
            onClick={goNext}
            disabled={!answers[index]}
          >
            {index === learningQuestions.length - 1 ? 'FINALIZAR' : 'SIGUIENTE'} <span className="arrow">›</span>
          </button>
        </div>

      </div>
    </section>
  )
}