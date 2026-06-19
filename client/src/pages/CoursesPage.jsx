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
  const [semesterWeeks, setSemesterWeeks] = useState(16)
  const [semesterStartDate, setSemesterStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [semesterError, setSemesterError] = useState('')

  function validateSemesterFields() {
    setSemesterError('')
    const weeks = Number(semesterWeeks)
    if (!semesterWeeks || !Number.isInteger(weeks) || weeks < 1 || weeks > 52) {
      setSemesterError('La duración del semestre debe ser un número entero entre 1 y 52 semanas.')
      return false
    }
    if (!semesterStartDate) {
      setSemesterError('Debes seleccionar una fecha de inicio para tu semestre académico.')
      return false
    }
    return true
  }

  // Convierte el archivo a base64 y envía la solicitud al backend para extraer los cursos usando la IA de Gemini
  function handleAnalyzeMalla() {
    if (!selectedFile) return
    setIsAnalyzing(true)
    
    const reader = new FileReader()
    reader.readAsDataURL(selectedFile)
    reader.onload = async () => {
      try {
        let mimeType = selectedFile.type
        if (!mimeType) {
          if (selectedFile.name.toLowerCase().endsWith('.txt')) {
            mimeType = 'text/plain'
          } else if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
            mimeType = 'application/pdf'
          } else {
            mimeType = 'application/pdf'
          }
        }

        const base64Data = reader.result.split(',')[1]
        const response = await api.post('/courses/analyze-malla', {
          fileBase64: base64Data,
          mimeType: mimeType
        })
        
        if (response.data && response.data.courses) {
          setDetectedCourses(response.data.courses)
          setMallaStep(3)
        } else {
          alert('No se pudieron extraer cursos válidos del archivo.')
        }
      } catch (err) {
        console.error('Error al analizar malla:', err)
        alert(err.response?.data?.message || 'Error al procesar el archivo con la IA.')
      } finally {
        setIsAnalyzing(false)
      }
    }
    reader.onerror = () => {
      alert('Error al leer el archivo.')
      setIsAnalyzing(false)
    }
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
    if (!validateSemesterFields()) return
    setLoading(true)
    setError('')
    try {
      // 1. Obtener los objetos de curso seleccionados
      const selectedCoursesData = courses
        .filter(c => selected.includes(c.name))
        .map(c => ({
          name: c.name,
          code: c.code || '',
          credits: c.credits || 3
        }))

      // 2. Guardar las respuestas del test y los cursos en MongoDB
      const saveResponse = await api.post('/auth/learning-answers', {
        answers: state?.answers || [],
        courses: selectedCoursesData,
      })

      // Extraer los cursos guardados en la BD con su ID
      const savedCoursesFromDb = saveResponse.data.courses || []
      const courseIds = savedCoursesFromDb.map(c => c._id)

      // 3. Generar el horario de estudio con Gemini
      let generatedScheduleData = null
      if (courseIds.length > 0) {
        try {
          const scheduleResponse = await api.post('/schedule/generate', {
            courseIds,
            preference: 'balanced',
            learningAnswers: state?.answers || []
          })
          generatedScheduleData = scheduleResponse.data
        } catch (scheduleErr) {
          console.error('Error al generar el horario con Gemini:', scheduleErr)
        }
      }

      // Marcar onboarding como completo
      await api.patch('/user/complete-onboarding', {
        semesterWeeks: parseInt(semesterWeeks, 10),
        semesterStartDate
      })
      
      // Actualizar el estado global del usuario para que el Router nos deje entrar al Calendario
      if (updateUser) {
        updateUser({
          hasCompletedOnboarding: true,
          semesterWeeks: parseInt(semesterWeeks, 10),
          semesterStartDate
        })
      }

      // Pasar los cursos al calendario mediante el estado de navegación
      navigate('/app/calendar', { 
        replace: true,
        state: generatedScheduleData ? {
          generatedPlan: {
            isAiGenerated: true,
            rawMarkdown: generatedScheduleData.schedule?.aiPlan || '',
            courses: savedCoursesFromDb,
            schedule: [],
            blocks: generatedScheduleData.blocks || generatedScheduleData.schedule?.blocks || []
          }
        } : {
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
      console.error('Error en el flujo de generación:', err)
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

        <div className="semester-config-card" style={{
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0',
          textAlign: 'left'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: 'bold' }}>
            📅 Duración de tu Ciclo Académico
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
            Configura las semanas de duración y la fecha de inicio para acotar la proyección de tu calendario.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>
                Semanas de Duración (1-52)
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={semesterWeeks}
                onChange={(e) => {
                  setSemesterWeeks(e.target.value);
                  setSemesterError('');
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.9rem',
                  color: '#1e293b'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={semesterStartDate}
                onChange={(e) => {
                  setSemesterStartDate(e.target.value);
                  setSemesterError('');
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.9rem',
                  color: '#1e293b'
                }}
              />
            </div>
          </div>
          
          {semesterError && (
            <div className="auth-error" style={{ marginTop: '12px', marginBottom: 0 }}>
              {semesterError}
            </div>
          )}
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