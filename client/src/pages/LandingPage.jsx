import { useNavigate } from 'react-router-dom'
import './LandingPage.css'
import stresslessIcon from '../assets/Stressless.png'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <section className="page page--landing">
      <div className="splash-shell splash-shell--hero">
        <div className="splash-panel splash-panel--hero">
          <div className="logo-badge">
            <img src={stresslessIcon} alt="Stressless Logo" className="logo-img" />
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