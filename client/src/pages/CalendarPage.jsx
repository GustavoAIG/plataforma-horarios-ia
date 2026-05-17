import React from 'react'

// Pestañas compartidas nativas del monolito
const calendarTabs = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
]

// Componente auxiliar nativo que usa el calendario para las tarjetas laterales
function PanelCard({ title, children }) {
  return (
    <div className="panel-card">
      <h3>{title}</h3>
      <div className="panel-card__body">{children}</div>
    </div>
  )
}

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
  return (
    <section className="page page--shell">
      <div className="screen-card shell-card">
        <div className="calendar-layout">
          
          {/* BLOQUE IZQUIERDO PRINCIPAL DEL CALENDARIO */}
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

          {/* ASIDE / COLUMNA DERECHA DE CONTROL */}
          <aside className="calendar-side">
            <PanelCard title="Mis Cursos">
              {plan.courses.map((course) => (
                <button 
                  className={`side-item ${selectedCourse === course ? 'is-active' : ''}`} 
                  type="button" 
                  key={course} 
                  onClick={() => onSelectCourse(course)}
                >
                  <span>{course}</span><i />
                </button>
              ))}
            </PanelCard>

            <PanelCard title="Recordatorios Inteligentes">
              {plan.reminders.map((text) => (
                <button 
                  className={`side-reminder ${selectedReminder === text ? 'is-active' : ''}`} 
                  type="button" 
                  key={text} 
                  onClick={() => onSelectReminder(text)}
                >
                  {text}
                </button>
              ))}
            </PanelCard>

            <div className="info-panel info-panel--green">
              <strong>Preferencia activa</strong>
              <p>
                {preference === 'focus' 
                  ? 'Modo foco: más estudio previo a exámenes.' 
                  : preference === 'light' 
                  ? 'Modo ligero: menos carga y más pausas.' 
                  : 'Modo balanceado: mantiene continuidad sin saturarte.'}
              </p>
            </div>

            <button className="primary-button primary-button--compact" type="button" onClick={() => onNavigate('tasks')}>
              VER TAREAS
            </button>
            <button className="soft-button" type="button" onClick={onAdjustSchedule}>
              AJUSTAR HORARIO
            </button>
          </aside>

        </div>
      </div>
    </section>
  )
}