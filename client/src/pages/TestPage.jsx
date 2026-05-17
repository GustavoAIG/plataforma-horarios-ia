import React from 'react'

// Icono nativo del monolito que usa esta página
function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
      <path 
        d="M8 7a3.5 3.5 0 0 1 6.8-1A3.2 3.2 0 0 1 18 9c0 1.4-.7 2.6-1.9 3.3V14A3 3 0 0 1 13 17h-2a3 3 0 0 1-3-3v-1.7A3.5 3.5 0 0 1 8 7Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  )
}

// Array de preguntas idéntico al del archivo original
const learningQuestions = [
  { prompt: '¿Cuál es tu horario preferido para estudiar?', options: ['Mañana temprano (6:00-9:00)', 'Media mañana (9:00-12:00)', 'Tarde (14:00-18:00)', 'Noche (18:00-23:00)'] },
  { prompt: '¿Qué duración prefieres para una sesión?', options: ['25-50 min', '60-90 min', '90+ min', 'Depende del tema'] },
  { prompt: '¿Cómo te concentras mejor?', options: ['Silencio', 'Música suave', 'Café y descansos', 'Ambiente social'] },
  { prompt: '¿Con cuánta anticipación preparas exámenes?', options: ['1 semana', '2 semanas', '3 semanas', '1 mes'] },
  { prompt: '¿Cuándo se te hace más fácil rendir?', options: ['Mañana', 'Mediodía', 'Tarde', 'Noche'] },
]

export default function TestPage({ index, progress, selectedAnswers, onSelectOption, onPrev, onNext }) {
  return (
    <section className="page page--test">
      <div className="screen-card test-card">
        
        {/* ENCABEZADO EXACTO DEL MONOLITO */}
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

        {/* TARJETA DE LA PREGUNTA ACTUAL */}
        <div className="question-card">
          <h3 className="question-title">{learningQuestions[index].prompt}</h3>
          <div className="options-grid">
            {learningQuestions[index].options.map((option) => (
              <button
                key={option}
                className={`option-card ${selectedAnswers && selectedAnswers[index] === option ? 'is-selected' : ''}`}
                type="button"
                onClick={() => onSelectOption && onSelectOption(index, option)}
              >
                <span className="radio-circle" />
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PIE DE PÁGINA Y ACCIONES EXACTAS */}
        <div className="test-actions">
          <button 
            className="secondary-button" 
            type="button" 
            onClick={onPrev} 
            disabled={index === 0}
          >
            ATRÁS
          </button>
          
          <div className="progress-inline">{Math.round(progress)}% completado</div>
          
          <button 
            className="primary-button primary-button--compact" 
            type="button" 
            onClick={onNext}
          >
            SIGUIENTE <span className="arrow">›</span>
          </button>
        </div>

      </div>
    </section>
  )
}