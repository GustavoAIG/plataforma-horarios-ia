import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // Importamos el contexto de autenticación
import heroPhoto from '../assets/study.webp'
import './SplashPage.css'

function BrainIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24"><path d="M8 7a3.5 3.5 0 0 1 6.8-1A3.2 3.2 0 0 1 18 9c0 1.4-.7 2.6-1.9 3.3V14A3 3 0 0 1 13 17h-2a3 3 0 0 1-3-3v-1.7A3.5 3.5 0 0 1 8 7Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function BellIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24"><path d="M12 18a2.2 2.2 0 0 0 2.1-1.5h-4.2A2.2 2.2 0 0 0 12 18Zm6-4.5H6l1.3-1.4A3.5 3.5 0 0 0 8 10V8.8a4 4 0 1 1 8 0V10a3.5 3.5 0 0 0 .7 2.1L18 13.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function HeartIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24"><path d="M12 20s-6.6-4.2-8.3-8.1A4.9 4.9 0 0 1 12 6.7a4.9 4.9 0 0 1 8.3 5.2C18.6 15.8 12 20 12 20Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> }

function Feature({ icon, tone, title, text }) {
  return (
    <div className="feature-item">
      <span className={`feature-icon feature-icon--${tone}`}>{icon}</span>
      <div className="feature-text-group">
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default function SplashPage() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth() // Obtenemos el estado de sesión y la función de salida

  return (
    <section className="page page--splash">
      
      {/* BOTÓN DE CERRAR SESIÓN FLOTANTE (Solo se muestra si el usuario ya está logueado) */}
      {isAuthenticated && (
        <button 
          type="button" 
          className="splash-logout-btn" 
          onClick={() => {
            logout()
            navigate('/auth') // Opcional: mandarlo al login tras limpiar la sesión
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesión activa
        </button>
      )}

      <div className="screen-card landing-card">

        {/* PANEL IZQUIERDO (Oscuro con la información de Stressless) */}
        <div className="landing-copy">
          <div>
            <h1 className="landing-title">Reduce Tu Estrés Académico</h1>
            <p className="landing-lead">
              Stressless usa inteligencia artificial para crear horarios equilibrados,
              evitar preparaciones de última hora y mantener tu bienestar mental durante el semestre.
            </p>
          </div>

          <div className="feature-list">
            <Feature 
              tone="lavender" 
              icon={<BrainIcon />} 
              title="Sin Saturación"
              text="Distribución inteligente de carga académica evitando picos de estrés" 
            />
            <Feature 
              tone="mint" 
              icon={<BellIcon />} 
              title="Preparación Anticipada"
              text="Recordatorios programados para evitar estudiar todo el día anterior" 
            />
            <Feature 
              tone="violet" 
              icon={<HeartIcon />} 
              title="Balance Healthy"
              text="Descansos obligatorios y monitoreo de bienestar para prevenir burnout" 
            />
          </div>

          <div className="button-row button-row--center button-row--single">
            <button
              className="primary-button primary-button--compact"
              type="button"
              onClick={() => navigate('/onboarding/test')}
            >
              INICIAR TEST DE APRENDIZAJE
            </button>
          </div>
        </div>

        {/* PANEL DERECHO (Imagen del estudiante) */}
        <div className="landing-photo-wrap">
          <img className="landing-photo" src={heroPhoto} alt="Estudiante trabajando" />
        </div>

      </div>
    </section>
  )
}