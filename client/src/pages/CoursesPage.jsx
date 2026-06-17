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
  // Estados para controlar el modal interactivo de importación de malla curricular
  const [showMallaModal, setShowMallaModal] = useState(false)
  const [mallaStep, setMallaStep]           = useState(1) // 1: Tutorial, 2: Upload, 3: Success
  const [selectedFile, setSelectedFile]     = useState(null)
  const [isAnalyzing, setIsAnalyzing]       = useState(false)
  const [detectedCourses, setDetectedCourses] = useState([])

  // Simula el análisis de la malla curricular con la IA de Gemini
  function handleAnalyzeMalla() {
    if (!selectedFile) return
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setMallaStep(3)
      setDetectedCourses([
        { name: 'Diseño de Algoritmos', code: 'ALG301', credits: 4 },
        { name: 'Ingeniería de Requisitos', code: 'REQ202', credits: 3 },
        { name: 'Sistemas Operativos', code: 'SO302', credits: 4 },
        { name: 'Ética y Filosofía', code: 'ETI101', credits: 2 }
      ])
    }, 1500)
  }

  // Agrega los cursos detectados a la lista general y los autoselecciona
  function handleConfirmImport() {
    setCourses(prev => {
      const existingNames = prev.map(c => c.name)
      const newCourses = detectedCourses.filter(c => !existingNames.includes(c.name))
      return [...prev, ...newCourses]
    })
    setSelected(prev => {
      const newNames = detectedCourses.map(c => c.name)
      const combined = new Set([...prev, ...newNames])
      return Array.from(combined)
    })
    setShowMallaModal(false)
    setMallaStep(1)
    setSelectedFile(null)
  }

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
          <button className="btn-lavender" type="button" onClick={() => setShowMallaModal(true)}>
            + Importar Malla Curricular
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

      {/* MODAL SUBIR MALLA CURRICULAR */}
      {showMallaModal && (
        <div className="modal-overlay" role="dialog">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Importar Malla Curricular</h3>
              <button 
                type="button" 
                onClick={() => { setShowMallaModal(false); setMallaStep(1); setSelectedFile(null); }}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#7c8a9c' }}
              >
                &times;
              </button>
            </div>

            {mallaStep === 1 && (
              <div className="malla-tutorial">
                <p style={{ color: '#56677a', lineHeight: 1.5, marginBottom: '20px' }}>
                  Sigue estos simples pasos para cargar tus materias automáticamente:
                </p>
                <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef3ff', color: '#3b82f6', width: '28px', height: '28px', borderRadius: '50%', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>1</span>
                    <p style={{ margin: 0, color: '#445268', fontSize: '0.95rem', textAlign: 'left' }}>Descarga tu malla curricular o historial de notas en formato <strong>PDF</strong> o <strong>TXT</strong> desde tu portal universitario.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef3ff', color: '#3b82f6', width: '28px', height: '28px', borderRadius: '50%', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>2</span>
                    <p style={{ margin: 0, color: '#445268', fontSize: '0.95rem', textAlign: 'left' }}>Asegúrate de que el archivo contenga los nombres de los cursos y sus créditos.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef3ff', color: '#3b82f6', width: '28px', height: '28px', borderRadius: '50%', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>3</span>
                    <p style={{ margin: 0, color: '#445268', fontSize: '0.95rem', textAlign: 'left' }}>Sube el archivo y nuestra IA extraerá las asignaturas por ti en un segundo.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" className="primary-button" onClick={() => setMallaStep(2)}>
                    Entendido, continuar
                  </button>
                </div>
              </div>
            )}

            {mallaStep === 2 && (
              <div className="malla-upload">
                <p style={{ color: '#56677a', lineHeight: 1.5, marginBottom: '20px' }}>
                  Selecciona el archivo de tu malla curricular para iniciar el análisis:
                </p>
                
                <div 
                  onClick={() => document.getElementById('malla-file-input').click()}
                  style={{
                    border: '2px dashed #cfd9ff',
                    borderRadius: '12px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    background: '#fcfdff',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    marginBottom: '20px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cfd9ff'}
                >
                  <input 
                    type="file" 
                    id="malla-file-input" 
                    accept=".pdf,.txt" 
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0])
                      }
                    }}
                  />
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                  {selectedFile ? (
                    <div>
                      <strong style={{ color: '#34455b', display: 'block', wordBreak: 'break-all' }}>{selectedFile.name}</strong>
                      <span style={{ color: '#7c8a9c', fontSize: '0.85rem' }}>{(selectedFile.size / 1024).toFixed(1)} KB • Haz clic para cambiar el archivo</span>
                    </div>
                  ) : (
                    <div>
                      <strong style={{ color: '#445268', display: 'block' }}>Selecciona tu archivo</strong>
                      <span style={{ color: '#7c8a9c', fontSize: '0.85rem' }}>Formatos soportados: PDF, TXT</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" className="secondary-button" onClick={() => setMallaStep(1)}>
                    Atrás
                  </button>
                  <button 
                    type="button" 
                    className="primary-button" 
                    disabled={!selectedFile || isAnalyzing}
                    onClick={handleAnalyzeMalla}
                  >
                    {isAnalyzing ? 'Analizando con IA...' : 'Subir y Analizar'}
                  </button>
                </div>
              </div>
            )}

            {mallaStep === 3 && (
              <div className="malla-success">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: '#def7ec', 
                    color: '#03543f', 
                    width: '56px', 
                    height: '56px', 
                    borderRadius: '50%', 
                    fontSize: '28px',
                    marginBottom: '12px',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#03543f' }}>¡Malla subida correctamente!</h4>
                  <p style={{ margin: '4px 0 0', color: '#56677a', fontSize: '0.9rem' }}>
                    La IA ha detectado y extraído los siguientes cursos del ciclo:
                  </p>
                </div>

                <div style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '10px', 
                  padding: '12px', 
                  maxHeight: '180px', 
                  overflowY: 'auto',
                  marginBottom: '20px'
                }}>
                  {detectedCourses.map((c, index) => (
                    <div 
                      key={index}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '8px 4px', 
                        borderBottom: index < detectedCourses.length - 1 ? '1px solid #edf2f7' : 'none',
                        fontSize: '0.9rem',
                        color: '#34455b'
                      }}
                    >
                      <strong>{c.name}</strong>
                      <span style={{ color: '#7c8a9c' }}>{c.credits} créditos ({c.code})</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" className="primary-button" onClick={handleConfirmImport}>
                    Confirmar e Importar Cursos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  )
}