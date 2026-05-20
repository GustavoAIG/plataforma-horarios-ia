import { memo } from 'react'

const calendarTabs = [
  {
    id: 'today',
    label: 'Hoy'
  },
  {
    id: 'week',
    label: 'Semana'
  },
  {
    id: 'month',
    label: 'Mes'
  }
]

const PanelCard = memo(function PanelCard({
  title,
  children
}) {
  return (
    <section className="panel-card">
      <header className="panel-card__header">
        <h3>{title}</h3>
      </header>

      <div className="panel-card__body">
        {children}
      </div>
    </section>
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
  if (!plan) {
    return (
      <section className="page page--shell">
        <div className="screen-card shell-card">
          <div className="empty-state">
            <h2>No hay información disponible</h2>
            <p>
              El calendario aún no ha sido generado.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page page--shell">

      <div className="screen-card shell-card">

        <div className="calendar-layout">

          {/* MAIN */}
          <main className="calendar-main">

            {/* HEADER */}
            <header className="calendar-header">

              <div>
                <h1 className="calendar-title">
                  {plan.title}
                </h1>

                <p className="section-helper">
                  {plan.date}
                </p>
              </div>

              {/* TABS */}
              <nav
                className="calendar-tabs"
                aria-label="Calendar view"
              >
                {calendarTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`
                      calendar-tab
                      ${
                        mode === tab.id
                          ? 'is-active'
                          : ''
                      }
                    `}
                    onClick={() =>
                      onChangeMode(tab.id)
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

            </header>

            {/* SUMMARY */}
            <section
              className="
                calendar-banner
                calendar-banner--dashboard
              "
            >

              <div>

                <strong>
                  {plan.summary}
                </strong>

                <div className="calendar-banner__points">
                  {plan.highlights?.map(
                    (item) => (
                      <span key={item}>
                        ✓ {item}
                      </span>
                    )
                  )}
                </div>

              </div>

            </section>

            {/* SCHEDULE */}
            <section className="schedule-list">

              {plan.schedule?.length > 0 ? (
                plan.schedule.map(
                  (item, index) => (
                    <button
                      key={item.course}
                      type="button"
                      className={`
                        schedule-item
                        schedule-item--${index}
                        ${
                          selectedCourse === item.course
                            ? 'is-active'
                            : ''
                        }
                      `}
                      onClick={() =>
                        onSelectCourse(
                          item.course
                        )
                      }
                    >

                      <div>

                        <h4>
                          {item.course}
                        </h4>

                        <p>
                          {item.time}
                        </p>

                        {item.location && (
                          <span className="place">
                            📍 {item.location}
                          </span>
                        )}

                      </div>

                      <span
                        className={`
                          schedule-tag
                          schedule-tag--${item.priority}
                        `}
                      >
                        {item.priority}
                      </span>

                    </button>
                  )
                )
              ) : (
                <div className="empty-state">
                  No hay actividades programadas.
                </div>
              )}

            </section>

          </main>

          {/* SIDEBAR */}
          <aside className="calendar-side">

            <PanelCard title="Mis Cursos">

              {plan.courses?.length > 0 ? (
                plan.courses.map((course) => (
                  <button
                    key={course}
                    type="button"
                    className={`
                      side-item
                      ${
                        selectedCourse === course
                          ? 'is-active'
                          : ''
                      }
                    `}
                    onClick={() =>
                      onSelectCourse(course)
                    }
                  >
                    <span>{course}</span>
                    <i />
                  </button>
                ))
              ) : (
                <p className="empty-text">
                  Sin cursos registrados.
                </p>
              )}

            </PanelCard>

            <PanelCard title="Recordatorios Inteligentes">

              {plan.reminders?.length > 0 ? (
                plan.reminders.map((text) => (
                  <button
                    key={text}
                    type="button"
                    className={`
                      side-reminder
                      ${
                        selectedReminder === text
                          ? 'is-active'
                          : ''
                      }
                    `}
                    onClick={() =>
                      onSelectReminder(text)
                    }
                  >
                    {text}
                  </button>
                ))
              ) : (
                <p className="empty-text">
                  No hay recordatorios.
                </p>
              )}

            </PanelCard>

            {/* PREFERENCE */}
            <section className="info-panel info-panel--green">

              <strong>
                Preferencia activa
              </strong>

              <p>
                {preference === 'focus'
                  ? 'Modo foco: más estudio previo a exámenes.'
                  : preference === 'light'
                  ? 'Modo ligero: menos carga y más pausas.'
                  : 'Modo balanceado: mantiene continuidad sin saturarte.'
                }
              </p>

            </section>

            {/* ACTIONS */}
            <div className="calendar-actions">

              <button
                type="button"
                className="
                  primary-button
                  primary-button--compact
                "
                onClick={() =>
                  onNavigate('tasks')
                }
              >
                Ver tareas
              </button>

              <button
                type="button"
                className="soft-button"
                onClick={onAdjustSchedule}
              >
                Ajustar horario
              </button>

            </div>

          </aside>

        </div>

      </div>

    </section>
  )
}