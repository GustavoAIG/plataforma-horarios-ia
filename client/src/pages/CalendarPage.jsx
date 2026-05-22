import { memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './CalendarPage.css'
import { useAuth } from '../context/AuthContext'

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

// Sidebar izquierdo fijo
const SidebarLeft = memo(function SidebarLeft({ user }) {
  return (
    <aside className="cal-sidebar-left">
      <div className="cal-brand-header">
        <h2>Stressless</h2>
        <button className="cal-menu-btn"><Icons.Menu /></button>
      </div>

      <nav className="cal-nav-list">
        <button className="cal-nav-item is-active"><Icons.Calendar /> Calendario</button>
        <button className="cal-nav-item"><Icons.Check /> Tareas</button>
        <button className="cal-nav-item"><Icons.Heart /> Wellness</button>
        {user?.role === 'admin' && (
          <button className="cal-nav-item"><Icons.Users /> Admin Panel</button>
        )}
        <button className="cal-nav-item"><Icons.User /> Perfil</button>
      </nav>

      <div className="cal-user-card">
        <strong>Usuario</strong>
        <span>{user?.Email_User || 'estudiante@uni.edu'}</span>
      </div>
    </aside>
  )
})

// Navbar móvil fija abajo
const MobileNavbar = memo(function MobileNavbar() {
  return (
    <nav className="cal-mobile-nav">
      <button className="cal-nav-btn-mobile is-active">
        <div className="nav-icon-wrapper"><Icons.Calendar /></div>
        <span>Calendario</span>
      </button>
      <button className="cal-nav-btn-mobile">
        <div className="nav-icon-wrapper"><Icons.Check /></div>
        <span>Tareas</span>
      </button>
      <button className="cal-nav-btn-mobile">
        <div className="nav-icon-wrapper"><Icons.Heart /></div>
        <span>Bienestar</span>
      </button>
      <button className="cal-nav-btn-mobile">
        <div className="nav-icon-wrapper"><Icons.User /></div>
        <span>Perfil</span>
      </button>
    </nav>
  )
})

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

  // Determinar la clase de color basada en la prioridad/tipo
  const getTypeClass = (priority) => {
    if (!priority) return 'type-clase'
    const p = priority.toLowerCase()
    if (p.includes('clase')) return 'type-clase'
    if (p.includes('estudio')) return 'type-estudio'
    if (p.includes('break') || p.includes('descanso')) return 'type-break'
    return 'type-clase'
  }

  const safePlan = plan || location.state?.generatedPlan || { courses: user?.onboardingCourses || [] }
  
  // Para saber si realmente hay un plan con horarios generados o solo un listado de cursos vacíos
  const hasSchedule = safePlan.schedule && safePlan.schedule.length > 0

  return (
    <section className="page--calendar">
      <div className="calendar-app-container">
        
        {/* SIDEBAR IZQUIERDO (Desktop) */}
        <SidebarLeft user={user} />

        {/* CONTENIDO PRINCIPAL */}
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
                  <h1>Horario de Hoy</h1>
                  <p>Lunes, 13 de Abril 2026</p> {/* Hardcodeado momentáneamente o usar plan.date si tiene ese formato */}
                </div>

                <div className="cal-tabs">
                  {calendarTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`cal-tab-btn ${mode === tab.id ? 'is-active' : ''}`}
                      onClick={() => onChangeMode(tab.id)}
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

              <div className="cal-schedule-list">
                {safePlan.schedule?.length > 0 ? (
                  safePlan.schedule.map((item, index) => {
                const typeClass = getTypeClass(item.priority)
                return (
                  <div key={index} className={`schedule-card ${typeClass}`}>
                    <div className="schedule-info">
                      <h4>{item.course}</h4>
                      <p>{item.time}</p>
                      {item.location && (
                        <p style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icons.MapPin /> {item.location}
                        </p>
                      )}
                    </div>
                    <div className={`schedule-badge ${typeClass}`}>
                      {item.priority || 'Clase'}
                    </div>
                  </div>
                )
              })
                ) : (
                  <p style={{ color: '#64748b' }}>No hay actividades programadas.</p>
                )}
              </div>

              {/* Info green box para MOBILE */}
              <div className="cal-info-green-mobile">
                <strong><Icons.Lightbulb /> Reducción de Estrés</strong>
                <p>Este horario distribuye tu carga académica de forma equilibrada, evitando saturación y preparación de último minuto.</p>
              </div>
            </>
          )}

        </main>

        {/* SIDEBAR DERECHO (Desktop) */}
        <aside className="cal-sidebar-right">
          
          <div className="cal-right-panel">
            <h3><Icons.Calendar /> Mis Cursos</h3>
            <div>
              {safePlan.courses?.length > 0 ? (
                safePlan.courses.map((course, idx) => (
                  <div key={idx} className="cal-course-item">
                    <span>{course}</span>
                    <span className="dot" />
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Sin cursos</p>
              )}
            </div>
          </div>

          {hasSchedule && (
            <>
              <div className="cal-right-panel">
                <h3><Icons.Bell /> Recordatorios Inteligentes</h3>
                <div>
                  <div className="cal-reminder-item">
                    <strong>Examen Parcial Matemáticas III</strong>
                    <span>En 5 días • Recordatorio configurado</span>
                  </div>
                  <div className="cal-reminder-item">
                    <strong>Entrega Proyecto Física II</strong>
                    <span>En 7 días • Recordatorio configurado</span>
                  </div>
                </div>
              </div>

              <div className="cal-info-green">
                <strong><Icons.Lightbulb /> Reducción de Estrés</strong>
                <p>Este horario distribuye tu carga académica de forma equilibrada, evitando saturación y preparación de último minuto.</p>
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
            <button className="btn-ajustar" onClick={onAdjustSchedule}>
              AJUSTAR HORARIO
            </button>
            <button 
              className="btn-ajustar" 
              style={{ backgroundColor: '#ffffff', color: '#2C3E50', border: '2px solid #2C3E50', boxShadow: 'none' }}
              onClick={() => navigate('/onboarding')}
            >
              VOLVER A REALIZAR TEST
            </button>
          </div>

        </aside>

        {/* NAVBAR INFERIOR (Mobile) */}
        <MobileNavbar />

      </div>
    </section>
  )
}