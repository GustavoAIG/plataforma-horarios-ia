import { memo, useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './CalendarPage.css'
import { useAuth } from '../context/AuthContext'
import { getLatestScheduleApi } from '../api/schedule'

const calendarTabs = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' }
]

// Iconos SVG simples para la interfaz
const Icons = {
  Menu: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Heart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Sparkles: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>,
  MapPin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Bell: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Lightbulb: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5"/></svg>
}

// Función auxiliar para parsear tablas Markdown
function parseMarkdownTable(markdown) {
  if (!markdown) return null
  const lines = markdown.split('\n')
  const tableLines = lines.filter(line => line.trim().startsWith('|'))
  if (tableLines.length < 3) return null

  const headers = tableLines[0].split('|').map(h => h.trim()).filter(Boolean)
  const dataRows = tableLines.slice(2)

  const parsedRows = dataRows.map(row => {
    const cells = row.split('|').map(c => c.trim()).filter((_, idx) => idx > 0 && idx <= headers.length)
    const rowObj = {}
    headers.forEach((header, idx) => {
      rowObj[header.toLowerCase()] = cells[idx] || ''
    })
    return rowObj
  })

  return { headers, rows: parsedRows }
}

// Función auxiliar para extraer secciones del markdown
function extractSectionContent(markdown, headingName) {
  if (!markdown) return ''
  const regex = new RegExp(`##\\s*${headingName}[\\r\\n]+([\\s\\S]*?)(##|$)`, 'i')
  const match = markdown.match(regex)
  return match ? match[1].trim() : ''
}

// Sidebar izquierdo fijo
const SidebarLeft = memo(function SidebarLeft({ user, activeSection, onSectionChange }) {
  return (
    <aside className="cal-sidebar-left">
      <div className="cal-brand-header">
        <h2>Stressless</h2>
        <button className="cal-menu-btn"><Icons.Menu /></button>
      </div>

      <nav className="cal-nav-list">
        <button 
          className={`cal-nav-item ${activeSection === 'calendar' ? 'is-active' : ''}`}
          onClick={() => onSectionChange('calendar')}
        >
          <Icons.Calendar /> Calendario
        </button>
        <button 
          className={`cal-nav-item ${activeSection === 'tasks' ? 'is-active' : ''}`}
          onClick={() => onSectionChange('tasks')}
        >
          <Icons.Check /> Tareas
        </button>
        <button 
          className={`cal-nav-item ${activeSection === 'wellness' ? 'is-active' : ''}`}
          onClick={() => onSectionChange('wellness')}
        >
          <Icons.Heart /> Wellness
        </button>
        {user?.role === 'admin' && (
          <button className="cal-nav-item"><Icons.Users /> Admin Panel</button>
        )}
        <button 
          className={`cal-nav-item ${activeSection === 'profile' ? 'is-active' : ''}`}
          onClick={() => onSectionChange('profile')}
        >
          <Icons.User /> Perfil
        </button>
      </nav>

      <div className="cal-user-card">
        <strong>Usuario</strong>
        <span>{user?.Email_User || 'estudiante@uni.edu'}</span>
      </div>
    </aside>
  )
})

// Navbar móvil fija abajo
const MobileNavbar = memo(function MobileNavbar({ activeSection, onSectionChange }) {
  return (
    <nav className="cal-mobile-nav">
      <button 
        className={`cal-nav-btn-mobile ${activeSection === 'calendar' ? 'is-active' : ''}`}
        onClick={() => onSectionChange('calendar')}
      >
        <div className="nav-icon-wrapper"><Icons.Calendar /></div>
        <span>Calendario</span>
      </button>
      <button 
        className={`cal-nav-btn-mobile ${activeSection === 'tasks' ? 'is-active' : ''}`}
        onClick={() => onSectionChange('tasks')}
      >
        <div className="nav-icon-wrapper"><Icons.Check /></div>
        <span>Tareas</span>
      </button>
      <button 
        className={`cal-nav-btn-mobile ${activeSection === 'wellness' ? 'is-active' : ''}`}
        onClick={() => onSectionChange('wellness')}
      >
        <div className="nav-icon-wrapper"><Icons.Heart /></div>
        <span>Bienestar</span>
      </button>
      <button 
        className={`cal-nav-btn-mobile ${activeSection === 'profile' ? 'is-active' : ''}`}
        onClick={() => onSectionChange('profile')}
      >
        <div className="nav-icon-wrapper"><Icons.User /></div>
        <span>Perfil</span>
      </button>
    </nav>
  )
})

// Vista de Tareas
function TasksSection({ rawMarkdown }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('stressless_tasks')
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Revisar lecturas de Ingeniería de Requisitos', completed: false, priority: 'Alta' },
      { id: 2, text: 'Resolver guía práctica de Diseño de Algoritmos', completed: true, priority: 'Alta' },
      { id: 3, text: 'Leer material de Sistemas Operativos', completed: false, priority: 'Media' },
      { id: 4, text: 'Organizar apuntes de Ética', completed: false, priority: 'Baja' }
    ]
  })
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('Media')

  const saveTasks = (newTasks) => {
    setTasks(newTasks)
    localStorage.setItem('stressless_tasks', JSON.stringify(newTasks))
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority
    }
    saveTasks([...tasks, newTask])
    setNewTaskText('')
  }

  const handleToggleTask = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    saveTasks(updated)
  }

  const handleDeleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id)
    saveTasks(updated)
  }

  // Extraer recordatorios o recomendaciones de la IA
  const aiReminders = useMemo(() => {
    return extractSectionContent(rawMarkdown, 'Recordatorios Inteligentes')
  }, [rawMarkdown])

  const aiCoursesRecs = useMemo(() => {
    return extractSectionContent(rawMarkdown, 'Recomendaciones por Curso')
  }, [rawMarkdown])

  const recommendationItems = useMemo(() => {
    const rawList = aiReminders || aiCoursesRecs
    if (!rawList) return [
      "Planificar bloques de estudio de 1.5 horas usando mapas conceptuales para los cursos teóricos.",
      "Resolver guías prácticas inmediatamente después de clases para reforzar la memoria de trabajo.",
      "Organizar repasos espaciados de 30 minutos antes de rendir entregables y evaluaciones complejas."
    ]
    return rawList
      .split('\n')
      .map(item => item.replace(/^[-*+\d.]\s*/, '').trim())
      .filter(Boolean)
  }, [aiReminders, aiCoursesRecs])

  return (
    <div className="tasks-section fade-in">
      <div className="cal-header-top">
        <div className="cal-header-text">
          <h1>Mis Tareas y Entregables</h1>
          <p>Organiza tus actividades para reducir el estrés académico</p>
        </div>
      </div>

      <div className="tasks-container-layout">
        <div className="task-form-card">
          <h3>Añadir Nueva Tarea</h3>
          <form onSubmit={handleAddTask}>
            <div className="form-group">
              <label>Descripción</label>
              <input 
                type="text" 
                value={newTaskText} 
                onChange={(e) => setNewTaskText(e.target.value)} 
                placeholder="Ej: Estudiar para el examen de algoritmos..." 
                required 
              />
            </div>
            <div className="form-group">
              <label>Prioridad</label>
              <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}>
                <option value="Alta">Alta 🔥</option>
                <option value="Media">Media ⚡</option>
                <option value="Baja">Baja 🟢</option>
              </select>
            </div>
            <button type="submit" className="primary-button primary-button--wide">
              Añadir Tarea
            </button>
          </form>
        </div>

        <div className="tasks-list-card">
          <h3>Lista de Actividades</h3>
          <div className="tasks-list-scroll">
            {tasks.length > 0 ? (
              tasks.map(t => (
                <div key={t.id} className={`task-item ${t.completed ? 'is-completed' : ''}`}>
                  <div className="task-item-left">
                    <input 
                      type="checkbox" 
                      checked={t.completed} 
                      onChange={() => handleToggleTask(t.id)} 
                      id={`task-chk-${t.id}`}
                    />
                    <label htmlFor={`task-chk-${t.id}`} className="task-text">{t.text}</label>
                  </div>
                  <div className="task-item-right">
                    <span className={`task-priority-badge priority-${t.priority.toLowerCase()}`}>
                      {t.priority}
                    </span>
                    <button type="button" className="task-delete-btn" onClick={() => handleDeleteTask(t.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-tasks">
                <p>¡Buen trabajo! No tienes tareas pendientes. 🎉</p>
              </div>
            )}
          </div>
        </div>

        <div className="task-form-card" style={{ gridColumn: 'span 2', marginTop: '12px' }}>
          <h3>💡 Recomendaciones de Organización por IA</h3>
          <ul className="burnout-tips-list" style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {recommendationItems.map((rec, idx) => (
              <li key={idx} style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#475569' }}>
                ⭐ {rec}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}

// Vista Wellness
function WellnessSection({ rawMarkdown }) {
  const [stressLevel, setStressLevel] = useState(45)
  const [breathingText, setBreathingText] = useState('Presiona Iniciar para calmar tu mente')
  const [isBreathing, setIsBreathing] = useState(false)
  const [timer, setTimer] = useState(null)

  const handleStartBreathing = () => {
    if (isBreathing) {
      clearInterval(timer)
      setIsBreathing(false)
      setBreathingText('Presiona Iniciar para calmar tu mente')
      return
    }

    setIsBreathing(true)
    let step = 0
    const textSteps = [
      'Inhala profundamente por la nariz... (4s) 🌬️',
      'Mantén el aire... (4s) ⏳',
      'Exhala lentamente por la boca... (4s) 💨',
      'Espera antes de inhalar... (4s) ⏳'
    ]
    setBreathingText(textSteps[0])
    
    const interval = setInterval(() => {
      step = (step + 1) % 4
      setBreathingText(textSteps[step])
    }, 4000)

    setTimer(interval)
  }

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [timer])

  // Extraer estrategias anti-estrés de la IA
  const aiStrategy = useMemo(() => {
    return extractSectionContent(rawMarkdown, 'Estrategia Anti-Estrés')
  }, [rawMarkdown])

  const strategyItems = useMemo(() => {
    if (!aiStrategy) return [
      "Técnica Pomodoro 50/10: Por cada 50 minutos de estudio enfocado, toma 10 minutos de desconexión absoluta.",
      "Descanso Activo: Levántate del asiento, camina y estira los hombros. Evita pantallas durante tus breaks.",
      "Regla de 3 Prioridades: Al iniciar el día, anota solo 3 cosas importantes que desees completar."
    ]
    return aiStrategy
      .split('\n')
      .map(item => item.replace(/^[-*+\d.]\s*/, '').trim())
      .filter(Boolean)
  }, [aiStrategy])

  return (
    <div className="wellness-section fade-in">
      <div className="cal-header-top">
        <div className="cal-header-text">
          <h1>Centro de Bienestar Universitario</h1>
          <p>Herramientas y técnicas para gestionar tu salud mental y reducir la ansiedad</p>
        </div>
      </div>

      <div className="wellness-grid-layout">
        <div className="wellness-card stress-meter-card">
          <h3>Indicador de Estrés Académico</h3>
          <p>Basado en tu carga horaria y estilo de aprendizaje detectado.</p>
          <div className="stress-gauge-container">
            <div className="stress-progress-bar">
              <div 
                className="stress-progress-fill" 
                style={{ 
                  width: `${stressLevel}%`, 
                  backgroundColor: stressLevel < 40 ? '#10b981' : stressLevel < 70 ? '#f59e0b' : '#ef4444' 
                }} 
              />
            </div>
            <div className="stress-value-label">
              <span>Relajado</span>
              <strong>{stressLevel}% - Estrés Controlado</strong>
              <span>Saturado</span>
            </div>
          </div>
          <div className="stress-actions-row">
            <button className="btn-wellness-action" onClick={() => setStressLevel(Math.max(10, stressLevel - 15))}>
              🧘 Realicé un descanso (-15%)
            </button>
            <button className="btn-wellness-action" onClick={() => setStressLevel(Math.min(100, stressLevel + 10))}>
              📚 Agregué más horas (+10%)
            </button>
          </div>
        </div>

        <div className="wellness-card breathing-card">
          <h3>Respiración Guiada (Caja)</h3>
          <p>Tómate 2 minutos para estabilizar tu ritmo cardíaco y recuperar el enfoque.</p>
          <div className={`breathing-circle-wrapper ${isBreathing ? 'is-animating' : ''}`}>
            <div className="breathing-circle">
              <span className="breathing-state-text">{isBreathing ? 'Respirando' : 'Detenido'}</span>
            </div>
          </div>
          <div className="breathing-helper-text">{breathingText}</div>
          <button 
            className={`primary-button ${isBreathing ? 'secondary-button' : ''}`} 
            onClick={handleStartBreathing}
          >
            {isBreathing ? 'Detener Ejercicio' : 'Iniciar Respiración'}
          </button>
        </div>

        <div className="wellness-card burnout-tips-card" style={{ gridColumn: 'span 2' }}>
          <h3>🧘 Estrategia de Bienestar Personalizada (IA)</h3>
          <ul className="burnout-tips-list">
            {strategyItems.map((tip, idx) => (
              <li key={idx}>
                <strong>Estrategia #{idx + 1}:</strong> {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Vista Perfil
function ProfileSection({ user }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="profile-section fade-in">
      <div className="cal-header-top">
        <div className="cal-header-text">
          <h1>Mi Perfil</h1>
          <p>Administra tu cuenta y tus preferencias de estudio</p>
        </div>
      </div>

      <div className="profile-container-layout">
        <div className="profile-info-card">
          <div className="profile-avatar">👤</div>
          <h2>Estudiante Stressless</h2>
          <div className="profile-details-list">
            <div className="profile-detail-item">
              <span className="label">Correo Electrónico:</span>
              <strong className="value">{user?.Email_User || 'estudiante@uni.edu'}</strong>
            </div>
            <div className="profile-detail-item">
              <span className="label">Rol en la Plataforma:</span>
              <strong className="value">{user?.role || 'Estudiante'}</strong>
            </div>
            <div className="profile-detail-item">
              <span className="label">Cursos Registrados:</span>
              <strong className="value">{user?.Courses_User || 0} cursos</strong>
            </div>
          </div>
          
          <div className="profile-buttons-row">
            <button className="primary-button" onClick={() => navigate('/onboarding')}>
              🔄 Re-hacer Test de Aprendizaje
            </button>
            <button 
              className="primary-button" 
              style={{ backgroundColor: '#ef4444', border: 'none' }}
              onClick={logout}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Vista Semanal
function WeeklyView({ parsedTable }) {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  
  return (
    <div className="weekly-grid-container fade-in">
      {days.map(day => {
        const dayLower = day.toLowerCase()
        const activities = parsedTable?.rows.map(row => ({
          time: row['hora'] || '',
          activity: row[dayLower] || ''
        })).filter(act => act.activity && act.activity !== '-' && act.activity.toLowerCase() !== 'libre') || []

        return (
          <div key={day} className="weekly-day-card">
            <h3 className="weekly-day-title">{day}</h3>
            <div className="weekly-activities-list">
              {activities.length > 0 ? (
                activities.map((act, idx) => {
                  const isBreak = act.activity.toLowerCase().includes('descanso') || act.activity.toLowerCase().includes('break')
                  return (
                    <div key={idx} className={`weekly-activity-item ${isBreak ? 'type-break' : 'type-estudio'}`}>
                      <span className="time">{act.time}</span>
                      <span className="activity">{act.activity}</span>
                    </div>
                  )
                })
              ) : (
                <p className="no-activities">Día libre 🏖️</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Vista Mensual
function MonthlyView({ parsedTable }) {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 3, 13)) // Abril 2026 por defecto
  const [selectedDay, setSelectedDay] = useState(13)

  const year = currentDate.getFullYear()
  const monthIndex = currentDate.getMonth()

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  const currentMonthName = monthNames[monthIndex]

  // Calcular días del mes actual dinámicamente
  const totalDays = new Date(year, monthIndex + 1, 0).getDate()
  
  // Calcular offset (Lunes=0, Martes=1... Domingo=6)
  const getStartOffset = (yr, mo) => {
    const day = new Date(yr, mo, 1).getDay() // 0 = Sun, 1 = Mon...
    return day === 0 ? 6 : day - 1
  }
  const startOffset = getStartOffset(year, monthIndex)

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: startOffset }, () => null)
  const calendarDays = [...emptyDays, ...daysArray]

  const daysOfWeekNames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
  
  const getDayOfWeekName = (day) => {
    const dayOfWeekIndex = (day - 1 + startOffset) % 7
    return daysOfWeekNames[dayOfWeekIndex]
  }

  const selectedDayName = getDayOfWeekName(selectedDay)
  const selectedDayCapitalized = selectedDayName.charAt(0).toUpperCase() + selectedDayName.slice(1)

  const selectedDayActivities = parsedTable?.rows.map(row => ({
    time: row['hora'] || '',
    activity: row[selectedDayName] || ''
  })).filter(act => act.activity && act.activity !== '-' && act.activity.toLowerCase() !== 'libre') || []

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1))
    setSelectedDay(1)
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1))
    setSelectedDay(1)
  }

  return (
    <div className="monthly-view-container fade-in">
      <div className="monthly-header-row">
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--cal-text)' }}>Calendario de Actividades del Ciclo</h3>
        <div className="month-navigation-controls">
          <button onClick={handlePrevMonth} className="btn-month-nav">◀ Anterior</button>
          <span className="current-month-display">{currentMonthName} {year}</span>
          <button onClick={handleNextMonth} className="btn-month-nav">Siguiente ▶</button>
        </div>
      </div>

      <div className="monthly-layout">
        <div className="monthly-grid-card">
          <div className="calendar-grid-header">
            <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
          </div>
          <div className="calendar-grid-body">
            {calendarDays.map((day, idx) => (
              <div 
                key={idx} 
                className={`calendar-day-cell ${day === null ? 'is-empty' : ''} ${day === selectedDay ? 'is-selected' : ''}`}
                onClick={() => day !== null && setSelectedDay(day)}
              >
                {day && (
                  <>
                    <span className="day-number">{day}</span>
                    {day % 2 === 0 && <span className="day-indicator" />}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="monthly-detail-card">
          <h3>Detalle: {selectedDayCapitalized} {selectedDay} de {currentMonthName}</h3>
          <div className="monthly-detail-activities">
            {selectedDayActivities.length > 0 ? (
              selectedDayActivities.map((act, idx) => {
                const isBreak = act.activity.toLowerCase().includes('descanso') || act.activity.toLowerCase().includes('break')
                return (
                  <div key={idx} className={`monthly-detail-item ${isBreak ? 'type-break' : 'type-estudio'}`}>
                    <strong>{act.time}</strong>
                    <span>{act.activity}</span>
                  </div>
                )
              })
            ) : (
              <p className="no-activities">Día libre para descanso y actividades personales. 🏖️</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Este componente maneja la página del calendario inteligente, organizando el horario del estudiante
// (clases, estudio y descansos) y proporcionando acceso a las secciones de tareas, bienestar y perfil.
export default function CalendarPage({
  mode,
  plan,
  onChangeMode,
  onAdjustSchedule,
  onSelectCourse,
  selectedCourse,
  onSelectReminder,
  selectedReminder,
  preference,
  onNavigate
}) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Soporte para modo local/autónomo si no se pasan las props del contenedor
  const [localMode, setLocalMode] = useState('today')
  const currentMode = mode || localMode
  const handleChangeMode = onChangeMode || setLocalMode

  // Estado para la sección activa de la barra lateral (calendar, tasks, wellness, profile)
  const [activeSection, setActiveSection] = useState('calendar')

  // Estado para almacenar el plan de estudio guardado en la base de datos
  const [dbPlan, setDbPlan] = useState(null)
  const [loadingSchedule, setLoadingSchedule] = useState(false)

  // Obtener horario desde la base de datos al montar
  useEffect(() => {
    async function fetchSchedule() {
      setLoadingSchedule(true)
      try {
        const data = await getLatestScheduleApi()
        if (data) {
          setDbPlan(data)
        }
      } catch (err) {
        console.error('Error al obtener el horario guardado:', err)
      } finally {
        setLoadingSchedule(false)
      }
    }
    fetchSchedule()
  }, [])

  // Determinar el plan que vamos a mostrar (Base de datos prioritario, fallback a estado de navegación o vacío)
  const safePlan = useMemo(() => {
    if (dbPlan && dbPlan.aiPlan) {
      return {
        isAiGenerated: true,
        rawMarkdown: dbPlan.aiPlan,
        courses: dbPlan.courses || [],
        schedule: []
      }
    }
    const navPlan = location.state?.generatedPlan || plan
    if (navPlan) {
      return navPlan
    }
    return { 
      courses: user?.onboardingCourses || [] 
    }
  }, [dbPlan, plan, location.state, user])

  // Parser para la tabla de markdown
  const parsedTable = useMemo(() => {
    if (!safePlan.rawMarkdown) return null
    return parseMarkdownTable(safePlan.rawMarkdown)
  }, [safePlan.rawMarkdown])

  // Tabla simulada hermosa si no hay una tabla cargada desde la IA
  const mockWeeklyTable = useMemo(() => {
    return {
      rows: [
        { hora: '09:00 - 10:30', lunes: 'Estadística', martes: 'Cálculo Avanzado', miércoles: 'Física II', jueves: 'Matemáticas III', viernes: 'Química Orgánica', sábado: 'Programación II', domingo: 'Descanso' },
        { hora: '11:00 - 12:30', lunes: 'Física II', martes: 'Descanso', miércoles: 'Estadística', jueves: 'Química Orgánica', viernes: 'Programación II', sábado: 'Cálculo Avanzado', domingo: 'Descanso' },
        { hora: '14:00 - 15:30', lunes: 'Descanso', martes: 'Estudio: Cálculo', miércoles: 'Estudio: Física', jueves: 'Descanso', viernes: 'Estudio: Química', sábado: 'Descanso', domingo: 'Descanso' }
      ]
    }
  }, [])

  const activeParsedTable = parsedTable || mockWeeklyTable

  // Determinar la clase de color basada en la prioridad/tipo
  const getTypeClass = (priority) => {
    if (!priority) return 'type-clase'
    const p = priority.toLowerCase()
    if (p.includes('clase')) return 'type-clase'
    if (p.includes('estudio') || p.includes('repaso')) return 'type-estudio'
    if (p.includes('break') || p.includes('descanso')) return 'type-break'
    return 'type-clase'
  }

  // Generar actividades para el día de "Hoy" dinámicamente si tenemos la tabla parseada
  const todayActivities = useMemo(() => {
    if (safePlan.schedule && safePlan.schedule.length > 0) {
      return safePlan.schedule
    }
    
    // Si tenemos tabla parseada, filtramos para el día de la semana actual
    if (activeParsedTable) {
      const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
      const todayIndex = new Date().getDay()
      const todayName = daysOfWeek[todayIndex]
      
      const extracted = activeParsedTable.rows.map(row => ({
        time: row['hora'] || '',
        course: row[todayName] || '',
        priority: (row[todayName] || '').toLowerCase().includes('descanso') || (row[todayName] || '').toLowerCase().includes('break') ? 'Descanso' : 'Estudio'
      })).filter(act => act.course && act.course !== '-' && act.course.toLowerCase() !== 'libre')

      if (extracted.length > 0) return extracted
    }

    // Fallback de demostración si no hay nada
    return [
      { course: 'Estadística', time: '09:00 - 10:30', priority: 'Clase' },
      { course: 'Cálculo Avanzado', time: '11:00 - 12:30', priority: 'Clase' },
      { course: 'Descanso Activo', time: '12:30 - 13:00', priority: 'Descanso' },
      { course: 'Estudio Independiente: Física II', time: '14:00 - 15:30', priority: 'Estudio' }
    ]
  }, [safePlan.schedule, activeParsedTable])

  const hasSchedule = todayActivities.length > 0

  return (
    <section className="page--calendar">
      <div className="calendar-app-container">
        
        {/* SIDEBAR IZQUIERDO */}
        <SidebarLeft 
          user={user} 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />

        {/* CONTENIDO DINÁMICO */}
        {activeSection === 'tasks' && (
          <main className="cal-main-content">
            <TasksSection rawMarkdown={safePlan.rawMarkdown} />
          </main>
        )}
        
        {activeSection === 'wellness' && (
          <main className="cal-main-content">
            <WellnessSection rawMarkdown={safePlan.rawMarkdown} />
          </main>
        )}
        
        {activeSection === 'profile' && (
          <main className="cal-main-content">
            <ProfileSection user={user} />
          </main>
        )}

        {activeSection === 'calendar' && (
          <>
            <main className="cal-main-content">
              {!hasSchedule ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', textAlign: 'center' }}>
                  <h2>Aún no has generado tu horario</h2>
                  <p>Realiza el Test de Aprendizaje para que nuestra IA pueda organizar tus tiempos.</p>
                </div>
              ) : (
                <>
                  <div className="cal-header-top">
                    <div className="cal-header-text">
                      {currentMode === 'today' && <h1>Horario de Hoy</h1>}
                      {currentMode === 'week' && <h1>Horario Semanal</h1>}
                      {currentMode === 'month' && <h1>Calendario Mensual</h1>}
                      <p>
                        {currentMode === 'today' && `${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
                        {currentMode !== 'today' && 'Organización inteligente de tu ciclo académico'}
                      </p>
                    </div>

                    <div className="cal-tabs">
                      {calendarTabs.map((tab) => (
                        <button
                          key={tab.id}
                          className={`cal-tab-btn ${currentMode === tab.id ? 'is-active' : ''}`}
                          onClick={() => handleChangeMode(tab.id)}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cal-banner-ia">
                    <strong><Icons.Sparkles /> Generado por IA - Basado en tu estilo de aprendizaje y disponibilidad</strong>
                    <div className="cal-banner-features">
                      <span>✓ Tiempo de estudio distribuido</span>
                      <span>✓ Descansos programados</span>
                      <span>✓ Preparación anticipada</span>
                    </div>
                  </div>

                  {/* Vistas condicionales de calendario */}
                  {currentMode === 'today' && (
                    <div className="cal-schedule-list fade-in">
                      {todayActivities.map((item, index) => {
                        const typeClass = getTypeClass(item.priority)
                        return (
                          <div key={index} className={`schedule-card ${typeClass}`}>
                            <div className="schedule-info">
                              <h4>{item.course}</h4>
                              <p>{item.time}</p>
                            </div>
                            <div className={`schedule-badge ${typeClass}`}>
                              {item.priority || 'Clase'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {currentMode === 'week' && (
                    <WeeklyView parsedTable={activeParsedTable} />
                  )}

                  {currentMode === 'month' && (
                    <MonthlyView parsedTable={activeParsedTable} />
                  )}

                  <div className="cal-info-green-mobile">
                    <strong><Icons.Lightbulb /> Reducción de Estrés</strong>
                    <p>Este horario distribuye tu carga académica de forma equilibrada, evitando la fatiga mental.</p>
                  </div>
                </>
              )}
            </main>

            {/* SIDEBAR DERECHO */}
            <aside className="cal-sidebar-right">
              <div className="cal-right-panel">
                <h3><Icons.Calendar /> Mis Cursos</h3>
                <div>
                  {safePlan.courses?.length > 0 ? (
                    safePlan.courses.map((course, idx) => (
                      <div key={idx} className="cal-course-item">
                        <span>{typeof course === 'object' ? course.Name_Course : course}</span>
                        <span className="dot" />
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Sin cursos registrados</p>
                  )}
                </div>
              </div>

              <div className="cal-right-panel">
                <h3><Icons.Bell /> Recordatorios Inteligentes</h3>
                <div>
                  <div className="cal-reminder-item">
                    <strong>Preparación de Exámenes</strong>
                    <span>En 5 días • Configuración activa</span>
                  </div>
                  <div className="cal-reminder-item">
                    <strong>Revisión de Tareas</strong>
                    <span>En 7 días • Configuración activa</span>
                  </div>
                </div>
              </div>

              <div className="cal-info-green">
                <strong><Icons.Lightbulb /> Reducción de Estrés</strong>
                <p>Este horario distribuye tu carga académica de forma equilibrada, evitando saturación y preparación de último minuto.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
                <button className="btn-ajustar" onClick={onAdjustSchedule || (() => navigate('/onboarding'))}>
                  AJUSTAR HORARIO
                </button>
              </div>
            </aside>
          </>
        )}

        {/* NAVBAR INFERIOR (Mobile) */}
        <MobileNavbar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />

      </div>
    </section>
  )
}