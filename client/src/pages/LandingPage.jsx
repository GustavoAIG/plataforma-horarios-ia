import { useNavigate } from 'react-router-dom'
import './LandingPage.css' // <--- AQUÍ SE IMPORTA EL CSS

function StresslessMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" width="64" height="64">
      <defs>
        <linearGradient id="m1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f1e4ff" />
          <stop offset="100%" stopColor="#d9c6ff" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#34455b" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="url(#m1)" strokeWidth="2" />
      <path d="M27 41c-4-2-7-5-7-10 0-7 6-12 12-12 7 0 13 5 13 12 0 5-3 8-7 10"
        fill="none" stroke="url(#m1)" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 24c2 0 3 1 4 2 1-1 2-2 4-2 3 0 5 2 5 5s-3 5-6 8l-3 3-3-3c-3-3-6-5-6-8 0-3 2-5 5-5z"
        fill="#f0a8dc" opacity="0.92" />
    </svg>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <section className="page page--landing">
      <div className="splash-shell splash-shell--hero">
        <div className="splash-panel splash-panel--hero">
          <div className="logo-badge">
            <StresslessMark />
          </div>
          <h2 className="splash-title">Stressless</h2>
          <p className="splash-subtitle">Calendario Académico Inteligente</p>
          
          <div className="splash-pill">
            Reduce tu estrés académico hasta un 40%
          </div>

          <div className="button-row button-row--center">
            <button
              className="primary-button primary-button--splash"
              type="button"
              onClick={() => navigate('/auth')}
            >
              COMENZAR
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}