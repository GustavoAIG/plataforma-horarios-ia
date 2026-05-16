import { useMemo, useState } from 'react'
import heroPhoto from './assets/study.webp'
import './App.css'
import AuthPage from './components/AuthPage'

const learningQuestions = [
  { prompt: '¿Cuál es tu horario preferido para estudiar?', options: ['Mañana temprano (6:00-9:00)', 'Media mañana (9:00-12:00)', 'Tarde (14:00-18:00)', 'Noche (18:00-23:00)'] },
  { prompt: '¿Qué duración prefieres para una sesión?', options: ['25-50 min', '60-90 min', '90+ min', 'Depende del tema'] },
  { prompt: '¿Cómo te concentras mejor?', options: ['Silencio', 'Música suave', 'Café y descansos', 'Ambiente social'] },
  { prompt: '¿Con cuánta anticipación preparas exámenes?', options: ['1 semana', '2 semanas', '3 semanas', '1 mes'] },
  { prompt: '¿Cuándo se te hace más fácil rendir?', options: ['Mañana', 'Mediodía', 'Tarde', 'Noche'] },
]

const courses = [
  { name: 'Matemáticas III', code: 'MAT301', credits: 4 },
  { name: 'Física II', code: 'FIS201', credits: 4 },
  { name: 'Química Orgánica', code: 'QUI205', credits: 3 },
  { name: 'Cálculo Avanzado', code: 'CAL302', credits: 4 },
  { name: 'Programación II', code: 'PRO202', credits: 3 },
  { name: 'Estadística', code: 'EST101', credits: 3 },
]

const adminRows = [
  ['1', 'Ana Martínez', 'ana.martinez@uni.edu', '5', '2026-04-23'],
  ['2', 'Carlos Rodríguez', 'carlos.rodriguez@uni.edu', '4', '2026-04-22'],
  ['3', 'María González', 'maria.gonzalez@uni.edu', '6', '2026-04-20'],
  ['4', 'José Pérez', 'jose.perez@uni.edu', '3', '2026-04-23'],
]

const navItems = [
  { id: 'calendar', label: 'Calendario', icon: <CalendarIcon /> },
  { id: 'tasks', label: 'Tareas', icon: <CheckIcon /> },
  { id: 'wellness', label: 'Wellness', icon: <HeartIcon /> },
  { id: 'admin', label: 'Admin Panel', icon: <UsersIcon /> },
  { id: 'profile', label: 'Perfil', icon: <UserIcon /> },
]

const calendarTabs = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
]

const calendarPlans = {
  today: {
    title: 'Horario de Hoy',
    date: 'Lunes, 13 de Abril 2026',
    summary: 'Generado por IA - Basado en tu estilo de aprendizaje y disponibilidad',
    highlights: ['Tiempo de estudio distribuido', 'Descansos programados', 'Preparación anticipada'],
    schedule: [
      ['Física II', '08:00 • 2 horas', 'Aula 301', 'Clase'],
      ['Estudio IA', '10:00 • 1 hora', 'Biblioteca', 'Estudio'],
      ['Descanso', '11:00 • 1 hora', '', 'Break'],
      ['Matemáticas III', '14:00 • 2 horas', 'Aula 205', 'Clase'],
    ],
    reminders: ['Examen Parcial Matemáticas III', 'Entrega Proyecto Física II', 'Sesión de repaso Cálculo Avanzado'],
    courses: ['Matemáticas III', 'Física II', 'Química Orgánica', 'Cálculo Avanzado'],
  },
  week: {
    title: 'Resumen de la Semana',
    date: 'Semana 15 - Abril 2026',
    summary: 'La IA agrupa tus clases, repasos y descanso para evitar saturación en la semana.',
    highlights: ['Bloques intensivos lunes-miércoles', 'Repaso ligero jueves-viernes', 'Descansos extendidos el sábado'],
    schedule: [
      ['Lunes - Matemáticas III', '09:00 • 2 horas', 'Aula 205', 'Clase'],
      ['Martes - Física II', '11:00 • 2 horas', 'Laboratorio', 'Clase'],
      ['Miércoles - Estudio IA', '16:00 • 1.5 horas', 'Biblioteca', 'Estudio'],
      ['Jueves - Química Orgánica', '08:00 • 2 horas', 'Aula 112', 'Clase'],
    ],
    reminders: ['Parcial de Matemáticas III', 'Entrega de proyecto Física II', 'Sesión de repaso general'],
    courses: ['Matemáticas III', 'Física II', 'Química Orgánica', 'Programación II'],
  },
  month: {
    title: 'Vista del Mes',
    date: 'Abril 2026',
    summary: 'Vista de alto nivel para ver la carga total, entregas y balance de tu mes académico.',
    highlights: ['Mapa de carga mensual', 'Picos de estrés identificados', 'Distribución de estudio por semanas'],
    schedule: [
      ['Semana 1', 'Carga media', 'Entrega parcial', 'Clase'],
      ['Semana 2', 'Carga alta', 'Repaso general', 'Estudio'],
      ['Semana 3', 'Carga baja', 'Descanso activo', 'Break'],
      ['Semana 4', 'Cierre de mes', 'Exámenes finales', 'Clase'],
    ],
    reminders: ['Revisar evaluación mensual', 'Preparar cierre de semestre', 'Confirmar matrículas'],
    courses: ['Matemáticas III', 'Física II', 'Química Orgánica', 'Cálculo Avanzado'],
  },
}

const calendarAdjustmentOptions = [
  { id: 'balanced', label: 'Balancear jornada', description: 'Distribuye más el estudio y agrega pausas.' },
  { id: 'focus', label: 'Priorizar exámenes', description: 'Aumenta bloques intensivos antes de evaluaciones.' },
  { id: 'light', label: 'Reducir carga', description: 'Acorta sesiones y deja espacio libre adicional.' },
]

function App() {
  const [view, setView] = useState('landing')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedCourses, setSelectedCourses] = useState(['Matemáticas III', 'Física II', 'Química Orgánica', 'Cálculo Avanzado'])
  const [selectedTask, setSelectedTask] = useState('Todos')
  const [user, setUser] = useState(null)
  const [answers, setAnswers] = useState(Array(learningQuestions.length).fill(null))
  const [coursesState, setCoursesState] = useState(courses)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAddCourseModal, setShowAddCourseModal] = useState(false)
  const [calendarMode, setCalendarMode] = useState('today')
  const [showCalendarAdjustModal, setShowCalendarAdjustModal] = useState(false)
  const [calendarPreference, setCalendarPreference] = useState('balanced')
  const [selectedReminder, setSelectedReminder] = useState(null)
  const [selectedScheduleCourse, setSelectedScheduleCourse] = useState('Matemáticas III')

  const progress = useMemo(() => ((questionIndex + 1) / learningQuestions.length) * 100, [questionIndex])

  function go(nextView) {
    setView(nextView)
    if (nextView !== 'test') setQuestionIndex(0)
  }

  function toggleSidebar() {
    setSidebarOpen((s) => !s)
  }

  function handleChangeCalendarMode(nextMode) {
    setCalendarMode(nextMode)
    setSelectedScheduleCourse(calendarPlans[nextMode].courses[0])
    setSelectedReminder(null)
  }

  function toggleCourse(courseName) {
    setSelectedCourses((current) =>
      current.includes(courseName) ? current.filter((item) => item !== courseName) : [...current, courseName],
    )
  }

  function addCourseManually() {
    // abrimos modal en vez de prompt nativo
    setShowAddCourseModal(true)
  }

  function submitAddCourse({ name, code, credits }) {
    const newCourse = { name, code, credits }
    setCoursesState((s) => [...s, newCourse])
    setSelectedCourses((s) => [...s, name])
    setShowAddCourseModal(false)
  }

  function importFromUniversity() {
    // simulación de importación (mejor feedback)
    const imported = { name: 'Introducción a IA', code: 'IA100', credits: 3 }
    setCoursesState((s) => [...s, imported])
    setSelectedCourses((s) => [...s, imported.name])
    // usamos un diálogo más elegante en futuro; por ahora alert
    alert('Cursos importados: Introducción a IA (simulado)')
  }

  function openCalendarAdjust() {
    setSelectedReminder(null)
    setShowCalendarAdjustModal(true)
  }

  function applyCalendarAdjust(mode) {
    setCalendarPreference(mode)
    setShowCalendarAdjustModal(false)
    setCalendarMode('week')
    setSelectedReminder('Plan ajustado con foco en balance y bienestar')
  }

  function openReminder(reminder) {
    setShowCalendarAdjustModal(false)
    setSelectedReminder(reminder)
  }

  function handleSelectOption(qIndex, value) {
    setAnswers((a) => {
      const copy = [...a]
      copy[qIndex] = value
      return copy
    })
  }

  function handleLogin(profile) {
    setUser(profile)
    // después de login, volvemos a landing para continuar onboarding
    go('landing')
  }

  function handleLogout() {
    setUser(null)
    go('landing')
  }

  const isDashboardView = ['calendar', 'tasks', 'wellness', 'admin', 'profile'].includes(view)

  function openDashboard() {
    go('calendar')
  }

  return (
    <div className={`app-shell ${isDashboardView ? 'app-shell--page' : 'app-shell--intro'} ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {isDashboardView ? (
        <>
          <aside className={`sidebar ${sidebarOpen ? '' : 'is-closed'}`}>
            <div className="sidebar__brand-row">
              <div className="sidebar__brand">Stressless</div>
              <button className="sidebar__toggle" type="button" aria-label="Menú" onClick={toggleSidebar}>
                <MenuIcon />
              </button>
            </div>

            <nav className="sidebar__menu">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar__item ${view === item.id ? 'is-active' : ''}`}
                  onClick={() => go(item.id)}
                >
                  <span className="sidebar__icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="sidebar__footer">
              <strong>{user ? user.name : 'Usuario'}</strong>
              <span>{user ? user.email : 'estudiante@uni.edu'}</span>
              {user ? <button className="soft-button" type="button" onClick={handleLogout}>Cerrar sesión</button> : null}
            </div>
          </aside>

          <main className="shell-main shell-main--page">
            <AppShellTopbar onTasks={() => go('tasks')} onProfile={() => go('profile')} />
            <div className="page-content">
              {view === 'calendar' && (
                <CalendarPage
                  mode={calendarMode}
                  plan={calendarPlans[calendarMode]}
                  onChangeMode={handleChangeCalendarMode}
                  onAdjustSchedule={openCalendarAdjust}
                  onSelectCourse={setSelectedScheduleCourse}
                  selectedCourse={selectedScheduleCourse}
                  onSelectReminder={openReminder}
                  selectedReminder={selectedReminder}
                  preference={calendarPreference}
                  onNavigate={go}
                />
              )}
              {view === 'tasks' && <TasksPage selectedTask={selectedTask} onSelectTask={setSelectedTask} onNavigate={go} />}
              {view === 'wellness' && <WellnessPage onNavigate={go} />}
              {view === 'admin' && <AdminPage onNavigate={go} />}
              {view === 'profile' && <ProfilePage user={user} onRetakeTest={() => go('test')} onEditCourses={() => go('courses')} onNavigate={go} onLogout={handleLogout} />}
            </div>
          </main>
        </>
      ) : (
        <main className="shell-main shell-main--intro">
          <div className="page-content page-content--intro">
              {view === 'landing' && <LandingPage onStart={() => go('splash')} onAuth={() => go('auth')} user={user} />}

              {view === 'splash' && <SplashPage onStart={() => go('test')} onAuth={() => go('auth')} />}

              {view === 'test' && (
                <TestPage
                  index={questionIndex}
                  progress={progress}
                  selectedAnswers={answers}
                  onSelectOption={handleSelectOption}
                  onPrev={() => setQuestionIndex((value) => Math.max(0, value - 1))}
                  onNext={() => {
                    if (questionIndex < learningQuestions.length - 1) {
                      setQuestionIndex((value) => value + 1)
                      return
                    }
                    go('courses')
                  }}
                />
              )}

              {view === 'courses' && <CoursesPage selectedCourses={selectedCourses} onToggleCourse={toggleCourse} onAddCourse={addCourseManually} onImport={importFromUniversity} onGenerate={() => go('calendar')} courses={coursesState} />}

              {view === 'auth' && <AuthPage onLogin={handleLogin} onBack={() => go('landing')} />}
            </div>
        </main>
      )}
      {showAddCourseModal ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Agregar curso manualmente</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const f = e.target
              const name = f.name.value.trim()
              const code = f.code.value.trim() || `CURS${Math.floor(Math.random()*900)}`
              const credits = parseInt(f.credits.value, 10) || 3
              if (!name) return alert('El nombre es requerido')
              submitAddCourse({ name, code, credits })
            }}>
              <label>Nombre del curso</label>
              <input name="name" placeholder="Ej: Álgebra Lineal" />
              <label>Código</label>
              <input name="code" placeholder="Ej: ALG101" />
              <label>Créditos</label>
              <input name="credits" type="number" defaultValue={3} />
              <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddCourseModal(false)}>Cancelar</button>
                <button type="submit" className="primary-button">Agregar curso</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      {showCalendarAdjustModal ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card modal-card--wide">
            <h3>Ajustar horario</h3>
            <p className="modal-subtitle">Elige un modo para reorganizar tu calendario de forma simulada, pero coherente con tu carga académica.</p>
            <div className="modal-choice-grid">
              {calendarAdjustmentOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`modal-choice ${calendarPreference === option.id ? 'is-active' : ''}`}
                  onClick={() => applyCalendarAdjust(option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
            <div className="modal-footer-actions">
              <button type="button" className="secondary-button" onClick={() => setShowCalendarAdjustModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      ) : null}
      {selectedReminder ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card modal-card--compact">
            <h3>Detalle</h3>
            <p className="modal-subtitle">{selectedReminder}</p>
            <div className="modal-footer-actions">
              <button type="button" className="primary-button primary-button--compact" onClick={() => setSelectedReminder(null)}>Entendido</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function LandingPage({ onStart, onAuth, user }) {
  return (
    <section className="page page--landing">
      <div className="splash-shell splash-shell--hero">
        <div className="splash-panel splash-panel--hero">
          <div className="logo-badge"><StresslessMark /></div>
          <h2 className="splash-title">Stressless</h2>
          <p className="splash-subtitle">Calendario Académico Inteligente</p>
          <div className="splash-pill">Reduce tu estrés académico hasta un 40%</div>
          <div className="button-row button-row--center">
            <button className="primary-button primary-button--splash" type="button" onClick={onStart}>COMENZAR</button>
            {user ? (
              <button className="secondary-button" type="button" onClick={() => alert('Ya estás autenticado')}>Cuenta: {user.name}</button>
            ) : (
              <button className="soft-button" type="button" onClick={() => onAuth && onAuth()}>Iniciar / Crear cuenta</button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function SplashPage({ onStart, onAuth }) {
  return (
    <section className="page page--splash">
      <div className="screen-card landing-card">
        <div className="landing-photo-wrap">
          <img className="landing-photo" src={heroPhoto} alt="Estudiante estresado" />
        </div>

        <div className="landing-copy">
          <h1 className="landing-title">Reduce Tu Estrés Académico</h1>
          <p className="landing-lead">
            Stressless usa inteligencia artificial para crear horarios equilibrados, evitar preparaciones de última hora y mantener tu bienestar mental durante el semestre.
          </p>

          <div className="feature-list">
            <Feature tone="lavender" icon={<BrainIcon />} title="Sin Saturación" text="Distribución inteligente de carga académica evitando picos de estrés" />
            <Feature tone="mint" icon={<BellIcon />} title="Preparación Anticipada" text="Recordatorios programados para evitar estudiar todo el día anterior" />
            <Feature tone="violet" icon={<HeartIcon />} title="Balance Saludable" text="Descansos obligatorios y monitoreo de bienestar para prevenir burnout" />
          </div>

          <div className="button-row button-row--center button-row--single">
            <button className="primary-button primary-button--compact" type="button" onClick={onStart}>INICIAR TEST DE APRENDIZAJE</button>
            <button className="soft-button" type="button" onClick={() => onAuth && onAuth()}>Iniciar / Crear cuenta</button>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestPage({ index, progress, selectedAnswers, onSelectOption, onPrev, onNext }) {
  return (
    <section className="page page--test">
      <div className="screen-card test-card">
        <div className="header-row">
          <div className="section-icon"><BrainIcon /></div>
          <div>
            <h2 className="section-title">Test de Estilo de Aprendizaje</h2>
            <div className="progress-row">
              {learningQuestions.map((_, current) => <span key={current} className={`progress-segment ${current <= index ? 'is-active' : ''}`} />)}
            </div>
            <div className="section-helper">Pregunta {index + 1} de {learningQuestions.length}</div>
          </div>
        </div>

          <div className="question-card">
          <h3 className="question-title">{learningQuestions[index].prompt}</h3>
          <div className="options-grid">
            {learningQuestions[index].options.map((option) => (
              <button
                className={`option-card ${selectedAnswers && selectedAnswers[index] === option ? 'is-selected' : ''}`}
                key={option}
                type="button"
                onClick={() => onSelectOption && onSelectOption(index, option)}
              >
                <span className="radio-circle" />
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="test-actions">
          <button className="secondary-button" type="button" onClick={onPrev} disabled={index === 0}>ATRÁS</button>
          <div className="progress-inline">{Math.round(progress)}% completado</div>
          <button className="primary-button primary-button--compact" type="button" onClick={onNext}>SIGUIENTE <span className="arrow">›</span></button>
        </div>
      </div>
    </section>
  )
}

function CoursesPage({ selectedCourses, onToggleCourse, onGenerate, onAddCourse, onImport, courses }) {
  return (
    <section className="page page--courses">
      <div className="screen-card courses-card">
        <div className="header-row header-row--courses">
          <div className="section-icon section-icon--calendar"><CalendarIcon /></div>
          <div>
            <h2 className="section-title">Cursos Matriculados</h2>
            <p className="section-subtitle">Selecciona los cursos que estás llevando este semestre</p>
          </div>
        </div>

        <div className="info-banner">
          <SparkMarkIcon />
          <div>
            <strong>¿Por qué necesitamos esta información?</strong>
            <p>La IA generará un horario de estudio personalizado para cada curso, distribuyendo el tiempo de forma balanceada y evitando que estudies todo a última hora, reduciendo significativamente tu estrés académico.</p>
          </div>
        </div>

        <div className="course-grid">
          {courses && courses.map((course) => {
            const active = selectedCourses.includes(course.name)
            return (
              <button key={course.name} className={`course-card ${active ? 'is-selected' : ''}`} type="button" onClick={() => onToggleCourse(course.name)}>
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
          <button className="soft-button" type="button" onClick={() => onAddCourse && onAddCourse()}>+ Agregar curso manualmente</button>
          <button className="soft-button" type="button" onClick={() => onImport && onImport()}>+ Importar desde sistema universitario</button>
        </div>

        <button className="primary-button primary-button--wide" type="button" onClick={onGenerate}>GENERAR MI HORARIO</button>
      </div>
    </section>
  )
}

function CalendarPage({ mode, plan, onChangeMode, onAdjustSchedule, onSelectCourse, selectedCourse, onSelectReminder, selectedReminder, preference, onNavigate }) {
  return (
    <section className="page page--shell">
      <div className="screen-card shell-card">
        <div className="calendar-layout">
          <div className="calendar-main">
            <div className="calendar-header">
              <div>
                <h2 className="calendar-title">{plan.title}</h2>
                <div className="section-helper">{plan.date}</div>
              </div>
              <div className="calendar-tabs">
                {calendarTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`calendar-tab ${mode === tab.id ? 'is-active' : ''}`}
                    onClick={() => onChangeMode(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="calendar-banner calendar-banner--dashboard">
              <div>
                <strong>{plan.summary}</strong>
                <div className="calendar-banner__points">
                  {plan.highlights.map((item) => <span key={item}>✓ {item}</span>)}
                </div>
              </div>
            </div>

            <div className="schedule-list">
              {plan.schedule.map((item, index) => (
                <button
                  type="button"
                  key={item[0]}
                  className={`schedule-item schedule-item--${index} ${selectedCourse === item[0] ? 'is-active' : ''}`}
                  onClick={() => onSelectCourse(item[0])}
                >
                  <div>
                    <h4>{item[0]}</h4>
                    <p>{item[1]}</p>
                    {item[2] ? <span className="place">📍 {item[2]}</span> : null}
                  </div>
                  <span className={`schedule-tag schedule-tag--${item[3].toLowerCase()}`}>{item[3]}</span>
                </button>
              ))}
            </div>
          </div>

          <aside className="calendar-side">
            <PanelCard title="Mis Cursos">
              {plan.courses.map((course) => (
                <button className={`side-item ${selectedCourse === course ? 'is-active' : ''}`} type="button" key={course} onClick={() => onSelectCourse(course)}>
                  <span>{course}</span><i />
                </button>
              ))}
            </PanelCard>

            <PanelCard title="Recordatorios Inteligentes">
              {plan.reminders.map((text) => (
                <button className={`side-reminder ${selectedReminder === text ? 'is-active' : ''}`} type="button" key={text} onClick={() => onSelectReminder(text)}>
                  {text}
                </button>
              ))}
            </PanelCard>

            <div className="info-panel info-panel--green">
              <strong>Preferencia activa</strong>
              <p>{preference === 'focus' ? 'Modo foco: más estudio previo a exámenes.' : preference === 'light' ? 'Modo ligero: menos carga y más pausas.' : 'Modo balanceado: mantiene continuidad sin saturarte.'}</p>
            </div>

            <button className="primary-button primary-button--compact" type="button" onClick={() => onNavigate('tasks')}>VER TAREAS</button>
            <button className="soft-button" type="button" onClick={onAdjustSchedule}>AJUSTAR HORARIO</button>
          </aside>
        </div>
      </div>
    </section>
  )
}

function TasksPage({ selectedTask, onSelectTask, onNavigate }) {
  return (
    <section className="page page--shell">
      <div className="screen-card shell-card">
        <div className="task-tabs">
          {['Todos', 'Exámenes', 'Proyectos', 'Tareas'].map((tab) => (
            <button key={tab} className={`task-tab ${selectedTask === tab ? 'is-active' : ''}`} type="button" onClick={() => onSelectTask(tab)}>
              {tab}
            </button>
          ))}
        </div>

        <div className="task-layout">
          <div className="task-grid">
            {[
              ['Examen Parcial Matemáticas III', 'Examen', '18 Abr', 'Alta'],
              ['Quiz Química Orgánica', 'Quiz', '15 Abr', 'Media'],
              ['Lectura Capítulo 5 - Cálculo', 'Tarea', '14 Abr', 'Baja'],
              ['Entrega Proyecto Física II', 'Proyecto', '20 Abr', 'Alta'],
            ].map(([title, kind, date, priority]) => (
              <div className="task-card" key={title}>
                <div className="task-card__top">
                  <span className="task-check" />
                  <strong>{title}</strong>
                  <span className="task-bell">🔔</span>
                </div>
                <div className="task-tag">{kind}</div>
                <div className="task-meta">📅 {date} <strong>{priority}</strong></div>
                <p>En 5 días • Recordatorio configurado</p>
              </div>
            ))}
          </div>

          <aside className="task-side">
            <PanelCard title="Recordatorios IA Activos">
              <div className="info-panel info-panel--mint">
                <strong>🎯 Estrategia Anti-Estrés:</strong>
                <p>Todas las tareas tienen recordatorios anticipados para evitar preparación de último momento y reducir la ansiedad.</p>
              </div>
              {['🔔 Comenzar Matemáticas - 1 semana antes del examen', '🔔 Descanso obligatorio - En 45 min', '🔔 Revisar Proyecto Física - 3 días antes de entrega'].map((item) => (
                <div className="side-reminder" key={item}>{item}</div>
              ))}
            </PanelCard>
          </aside>
        </div>
      </div>
    </section>
  )
}

function WellnessPage({ onNavigate }) {
  return (
    <section className="page page--shell">
      <div className="screen-card shell-card">
        <div className="stats-grid stats-grid--two">
          <div className="chart-card chart-card--bar">
            <h3>Progreso por Materia</h3>
            <div className="chart-bars">
              {[85, 72, 90, 68, 82].map((value, index) => (
                <div key={index} className="bar-column">
                  <div className="bar" style={{ height: `${value}%` }} />
                  <div className="bar-labels">{['MAT', 'FIS', 'QUI', 'CAL', 'PRO'][index]}</div>
                </div>
              ))}
            </div>
            <div className="chip-row">
              {[['MAT', '85%'], ['FIS', '72%'], ['QUI', '90%'], ['CAL', '68%'], ['PRO', '82%']].map(([abbr, value]) => (
                <div className="mini-chip" key={abbr}><strong>{abbr}</strong><span>{value}</span></div>
              ))}
            </div>
          </div>

          <div className="chart-card chart-card--line">
            <h3>Gestión de Estrés</h3>
            <div className="line-chart">
              <div className="line-grid" />
              <div className="line-path">
                <span style={{ left: '10%', top: '28%' }} />
                <span style={{ left: '33%', top: '34%' }} />
                <span style={{ left: '58%', top: '52%' }} />
                <span style={{ left: '82%', top: '56%' }} />
              </div>
            </div>
            <div className="info-panel info-panel--mint">
              <strong>Impacto en tu Estrés</strong>
              <p>Con este horario balanceado, tu nivel de estrés se ha reducido un 35% comparado con el semestre anterior.</p>
            </div>
          </div>
        </div>

        <div className="stats-grid stats-grid--three stats-grid--bottom">
          <SmallMetric title="Nivel de Estrés Actual" value="Moderado - 45%" meter={45} />
          <SmallMetric title="Horas de Sueño" value="6.5 hrs" helper="Promedio esta semana" />
          <SmallMetric title="Sesiones de Estudio" value="18" helper="Esta semana" />
        </div>
      </div>
    </section>
  )
}

function AdminPage({ onNavigate }) {
  const [rows, setRows] = useState(adminRows)
  const [showUserModal, setShowUserModal] = useState(false)
  const [draftUser, setDraftUser] = useState({ name: '', email: '' })

  function handleExport() {
    // simulación: exportar CSV
    const csv = ['ID,Nombre,Email,Cursos,Último acceso', ...rows.map(r => r.join(','))].join('\n')
    console.log(csv)
    alert('Exportado CSV (simulado), revisa la consola')
  }

  function handleAddUser() {
    setDraftUser({ name: '', email: '' })
    setShowUserModal(true)
  }

  function submitUser(e) {
    e.preventDefault()
    const name = draftUser.name.trim()
    if (!name) return alert('El nombre es requerido')
    const email = draftUser.email.trim() || `${name.replace(/\s+/g, '.').toLowerCase()}@uni.edu`
    const id = String(rows.length + 1)
    const newRow = [id, name, email, '0', new Date().toISOString().slice(0, 10)]
    setRows((s) => [newRow, ...s])
    setShowUserModal(false)
  }

  function viewUser(row) {
    alert(`Usuario: ${row[1]}\nEmail: ${row[2]}\nCursos: ${row[3]}\nÚltimo acceso: ${row[4]}`)
  }

  return (
    <section className="page page--shell">
      <div className="screen-card shell-card">
        <div className="stats-grid stats-grid--four">
          <StatCard icon={<UsersIcon />} label="Usuarios Activos" value="1,247" helper="↑ 12% desde el mes pasado" tone="lavender" />
          <StatCard icon={<TrendIcon />} label="Tasa de Retención" value="87%" helper="↑ 5% desde el mes pasado" tone="mint" />
          <StatCard icon={<HeartIcon />} label="Reducción de Estrés" value="35%" helper="↓ Niveles de estrés" tone="violet" />
          <StatCard icon={<BarsIcon />} label="Sesiones Totales" value="8,456" helper="Esta semana" tone="green" />
        </div>

        <div className="table-card">
          <div className="table-card__header">
            <h3>Sistema de Gestión de Usuarios</h3>
            <div className="table-actions">
              <button className="secondary-button" type="button" onClick={handleExport}>Exportar</button>
              <button className="primary-button primary-button--compact" type="button" onClick={handleAddUser}>Agregar Usuario</button>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Cursos</th>
                <th>Último acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  <td>{row[0]}</td>
                  <td><strong>{row[1]}</strong></td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                  <td>{row[4]}</td>
                  <td><button className="action-pill" type="button" onClick={() => viewUser(row)}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showUserModal ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card modal-card--compact">
            <h3>Agregar usuario</h3>
            <p className="modal-subtitle">Crea un registro simulado para revisar cómo se integrará luego con la base de datos.</p>
            <form onSubmit={submitUser} className="auth-input-grid">
              <div className="auth-field">
                <label>Nombre</label>
                <input value={draftUser.name} onChange={(e) => setDraftUser((s) => ({ ...s, name: e.target.value }))} placeholder="Nombre y apellido" />
              </div>
              <div className="auth-field">
                <label>Email</label>
                <input value={draftUser.email} onChange={(e) => setDraftUser((s) => ({ ...s, email: e.target.value }))} placeholder="correo@uni.edu" />
              </div>
              <div className="modal-footer-actions" style={{ gap: 10 }}>
                <button type="button" className="secondary-button" onClick={() => setShowUserModal(false)}>Cancelar</button>
                <button type="submit" className="primary-button primary-button--compact">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function ProfilePage({ user, onRetakeTest, onEditCourses, onNavigate, onLogout }) {
  return (
    <section className="page page--shell">
      <div className="screen-card shell-card">
        <div className="profile-layout">
          <div className="profile-card profile-card--main">
            <div className="profile-avatar">🧠</div>
            <strong>{user ? user.name : 'Estudiante Universitario'}</strong>
            <span>{user ? `ID: ${user.email.split('@')[0]}` : 'ID: 12345'}</span>
            <small>{user ? user.email : 'estudiante@universidad.edu'}</small>
            <button className="soft-button" type="button" onClick={() => alert('Editar perfil (simulado)')}>EDITAR PERFIL</button>
            <button className="primary-button primary-button--compact" type="button" onClick={() => onLogout && onLogout()}>CERRAR SESIÓN</button>
          </div>

          <div className="profile-card">
            <h3>Tu Estilo de Aprendizaje</h3>
            {[
              ['Horario preferido', 'Mañana (9:00-12:00)'],
              ['Sesiones', 'Cortas (25-50 min)'],
              ['Ambiente', 'Música de fondo'],
              ['Preparación', '1 semana antes'],
            ].map(([label, value]) => (
              <div className="profile-note" key={label}><strong>{label}</strong><span>{value}</span></div>
            ))}
            <button className="soft-button" type="button" onClick={onRetakeTest}>REHACER TEST</button>
          </div>

          <div className="profile-card">
            <h3>Mis Cursos</h3>
            <p className="profile-mini-subtitle">Semestre Actual</p>
            {[
              ['Matemáticas III', 'MAT301'],
              ['Física II', 'FIS201'],
              ['Química Orgánica', 'QUI205'],
              ['Cálculo Avanzado', 'CAL302'],
            ].map(([name, code]) => (
              <div className="course-row" key={code}><span>{name}</span><strong>{code}</strong></div>
            ))}
            <button className="soft-button" type="button" onClick={onEditCourses}>EDITAR CURSOS</button>
            <div className="info-panel info-panel--mint">💡 Actualiza tus cursos cada semestre para mantener tu horario optimizado</div>
          </div>
        </div>

        <div className="settings-card">
          <h3>Configuración</h3>
          <div className="settings-grid">
            {['Notificaciones y recordatorios', 'Disponibilidad de horario', 'Preferencias de bienestar', 'Sincronizar con sistema universitario'].map((item) => (
              <button className="setting-pill" key={item} type="button">{item} <span>›</span></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AppShellTopbar({ onTasks, onProfile }) {
  return (
    <div className="page-topbar">
      <div className="search-chip">
        <SearchIcon />
        <span>Buscar cursos, tareas, recordatorios...</span>
      </div>
      <div className="topbar-actions">
        <button type="button" className="icon-button" onClick={onTasks} aria-label="Ver tareas"><BellOutlineIcon /></button>
        <button type="button" className="icon-button" onClick={onProfile} aria-label="Abrir perfil"><GearIcon /></button>
      </div>
    </div>
  )
}

function Feature({ icon, tone, title, text }) {
  return (
    <div className="feature-item">
      <span className={`feature-icon feature-icon--${tone}`}>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, helper, tone }) {
  return (
    <div className="stat-card">
      <span className={`stat-card__icon stat-card__icon--${tone}`}>{icon}</span>
      <strong>{label}</strong>
      <b>{value}</b>
      <small>{helper}</small>
    </div>
  )
}

function SmallMetric({ title, value, helper, meter }) {
  return (
    <div className="small-metric">
      <strong>{title}</strong>
      {meter ? <div className="meter"><div className="meter__fill" style={{ width: `${meter}%` }} /></div> : null}
      <b>{value}</b>
      {helper ? <span>{helper}</span> : null}
    </div>
  )
}

function PanelCard({ title, children }) {
  return (
    <div className="panel-card">
      <h3>{title}</h3>
      <div className="panel-card__body">{children}</div>
    </div>
  )
}

function StresslessMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="m1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f1e4ff" />
          <stop offset="100%" stopColor="#d9c6ff" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#34455b" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="url(#m1)" strokeWidth="2" />
      <path d="M27 41c-4-2-7-5-7-10 0-7 6-12 12-12 7 0 13 5 13 12 0 5-3 8-7 10" fill="none" stroke="url(#m1)" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 24c2 0 3 1 4 2 1-1 2-2 4-2 3 0 5 2 5 5s-3 5-6 8l-3 3-3-3c-3-3-6-5-6-8 0-3 2-5 5-5z" fill="#f0a8dc" opacity="0.92" />
    </svg>
  )
}

function MenuIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg> }
function HomeIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20H4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 20v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg> }
function SparkMarkIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg> }
function BrainIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7a3.5 3.5 0 0 1 6.8-1A3.2 3.2 0 0 1 18 9c0 1.4-.7 2.6-1.9 3.3V14A3 3 0 0 1 13 17h-2a3 3 0 0 1-3-3v-1.7A3.5 3.5 0 0 1 8 7Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function BellIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 18a2.2 2.2 0 0 0 2.1-1.5h-4.2A2.2 2.2 0 0 0 12 18Zm6-4.5H6l1.3-1.4A3.5 3.5 0 0 0 8 10V8.8a4 4 0 1 1 8 0V10a3.5 3.5 0 0 0 .7 2.1L18 13.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function BellOutlineIcon() { return <BellIcon /> }
function HeartIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-6.6-4.2-8.3-8.1A4.9 4.9 0 0 1 12 6.7a4.9 4.9 0 0 1 8.3 5.2C18.6 15.8 12 20 12 20Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function CalendarIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M7 3v4M17 3v4M4 9h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg> }
function CheckIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h2M4 12h2M4 17h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><rect x="8" y="6.5" width="12" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="m10.5 12 1.5 1.5 3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function UsersIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm6 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M4.5 19a4.5 4.5 0 0 1 9 0M11 19a4.5 4.5 0 0 1 9 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg> }
function TrendIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16l5-5 4 4 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 8h4v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function BarsIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18V9M12 18V6M18 18v-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg> }
function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M16 16l4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg> }
function GearIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2A3.8 3.8 0 1 0 15.8 12 3.8 3.8 0 0 0 12 8.2Z" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M19 12l1.7.7-.8 2-1.8-.2a7.8 7.8 0 0 1-1.5 1.5l.2 1.8-2 .8-.7-1.7a7.8 7.8 0 0 1-2.1 0l-.7 1.7-2-.8.2-1.8a7.8 7.8 0 0 1-1.5-1.5l-1.8.2-.8-2L5 12l-1.7-.7.8-2 1.8.2a7.8 7.8 0 0 1 1.5-1.5l-.2-1.8 2-.8.7 1.7a7.8 7.8 0 0 1 2.1 0l.7-1.7 2 .8-.2 1.8a7.8 7.8 0 0 1 1.5 1.5l1.8-.2.8 2Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /></svg> }
function UserIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M5 19a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg> }

export default App