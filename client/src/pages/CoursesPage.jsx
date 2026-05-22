import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { defaultCourses } from '../data/mockData'

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
      <rect x="4" y="5" width="16" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 3v4M17 3v4M4 9h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function SparkMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
        fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

export default function CoursesPage() {
  const navigate                      = useNavigate()
  const { state }                     = useLocation()
  const { user, updateUser }          = useAuth()
  const [courses, setCourses]         = useState(defaultCourses)
  const [selected, setSelected]       = useState([])
  const [showModal, setShowModal]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  function toggleCourse(name) {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  function submitAddCourse(e) {
    e.preventDefault()
    const name    = e.target.name.value.trim()
    const code    = e.target.code.value.trim() || 'CURS101'
    const credits = parseInt(e.target.credits.value, 10) || 3
    if (!name) return
    setCourses(prev => [...prev, { name, code, credits }])
    setSelected(prev => [...prev, name])
    setShowModal(false)
    e.target.reset()
  }

  async function handleGenerate() {
    if (selected.length === 0) return
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/learning-answers', {
        answers: state?.answers || [],
        courses: selected,
      })

      // Marcar onboarding como completo
      await api.patch('/user/complete-onboarding')
      
      // Actualizar el estado global del usuario para que el Router nos deje entrar al Calendario
      if (updateUser) {
        updateUser({ hasCompletedOnboarding: true })
      }

      // Pasar los cursos al calendario mediante el estado de navegación
      navigate('/app/calendar', { 
        replace: true,
        state: {
          generatedPlan: {
            courses: selected,
            schedule: selected.map((course, idx) => ({
              course,
              time: `${9 + idx}:00 - ${10 + idx}:30`,
              priority: 'Clase'
            }))
          }
        }
      })
    } catch (err) {
      setError('Error al guardar tu configuración. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page page--courses">
      <div className="screen-card courses-card">

        <div className="header-row header-row--courses">
          <div className="section-icon section-icon--calendar">
            <CalendarIcon />
          </div>
          <div>
            <h2 className="section-title">Cursos Matriculados</h2>
            <p className="section-subtitle">Selecciona los cursos que estás llevando este semestre</p>
          </div>
        </div>

        <div className="info-banner">
          <SparkMarkIcon />
          <div>
            <strong>¿Por qué necesitamos esta información?</strong>
            <p>
              La IA generará un horario de estudio personalizado para cada curso,
              distribuyendo el tiempo de forma balanceada y evitando que estudies todo a
              última hora, reduciendo significativamente tu estrés académico.
            </p>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="course-grid">
          {courses.map((course) => {
            const isSelected = selected.includes(course.name)
            return (
              <button
                key={course.code}
                className={`course-card ${isSelected ? 'is-selected' : ''}`}
                type="button"
                onClick={() => toggleCourse(course.name)}
                aria-pressed={isSelected}
              >
                <span className="checkbox-circle" />
                <span>
                  <strong>{course.name}</strong>
                  <small>{course.code} • {course.credits} créditos</small>
                </span>
              </button>
            )
          })}
        </div>

        <div className="course-actions">
          <button className="btn-lavender" type="button" onClick={() => setShowModal(true)}>
            + Agregar curso manualmente
          </button>
          <button className="btn-lavender" type="button" onClick={() => alert('Próximamente: Integración con la universidad')}>
            + Importar desde sistema universitario
          </button>
        </div>

        <button
          className="primary-button primary-button--wide"
          type="button"
          onClick={handleGenerate}
          disabled={selected.length === 0 || loading}
        >
          {loading ? 'Guardando...' : 'GENERAR MI HORARIO'}
        </button>

      </div>

      {/* MODAL AGREGAR CURSO */}
      {showModal && (
        <div className="modal-overlay" role="dialog">
          <div className="modal-card">
            <h3>Agregar curso manualmente</h3>
            <form onSubmit={submitAddCourse}>
              <input name="name" placeholder="Nombre del curso" required />
              <input name="code" placeholder="Código (ej: MAT101)" />
              <input name="credits" type="number" placeholder="Créditos" defaultValue={3} />
              <div className="auth-submit-row">
                <button type="button" className="secondary-button"
                  onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button primary-button--compact">
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  )
}