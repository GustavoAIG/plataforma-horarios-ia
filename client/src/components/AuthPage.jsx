import React, { useState } from 'react'

export default function AuthPage({ onLogin, onBack }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!email) return alert('Ingresa un email')
    const profile = { name: name || email.split('@')[0], email }
    onLogin && onLogin(profile)
  }

  function socialLogin(provider) {
    const profile = {
      name: provider === 'google' ? 'Usuario Google' : 'Usuario Microsoft',
      email: provider === 'google' ? 'google@stressless.app' : 'microsoft@stressless.app',
    }
    onLogin && onLogin(profile)
  }

  return (
    <section className="page page--auth">
      <div className="auth-shell">
        <div className="auth-panel">
          <aside className="auth-aside">
            <div>
              <div className="auth-brand">
                <div className="auth-brand-mark">
                  <span>⌁</span>
                </div>
                <strong>Stressless</strong>
              </div>
              <h2>Accede con una experiencia más clara y rápida.</h2>
              <p>Guarda tu progreso, sincroniza el plan de estudios y mantén tu horario de forma inteligente sin perder el flujo visual del producto.</p>
            </div>

            <div className="auth-proof-grid">
              <div className="auth-proof">
                <strong>Inicio seguro</strong>
                <span>Flujo de acceso simulado con respaldo para integrarse luego a autenticación real.</span>
              </div>
              <div className="auth-proof">
                <strong>Cuenta y progreso</strong>
                <span>Tu nombre y email quedan listos para reaprovecharse en dashboard y perfil.</span>
              </div>
              <div className="auth-proof">
                <strong>Sin cortar el diseño</strong>
                <span>La interfaz sigue la línea visual del sistema: limpia, sobria y profesional.</span>
              </div>
            </div>
          </aside>

          <main className="auth-form-card">
            <div className="auth-header">
              <div>
                <h3>Inicia sesión o crea tu cuenta</h3>
                <p>Usa cualquiera de estos accesos para entrar a Stressless y continuar el onboarding.</p>
              </div>
              {onBack ? <button className="soft-button" type="button" onClick={onBack}>Volver</button> : null}
            </div>

            <div className="auth-mode-switch">
              <button type="button" className={`secondary-button ${mode === 'login' ? 'is-active' : ''}`} onClick={() => setMode('login')}>Iniciar sesión</button>
              <button type="button" className={`secondary-button ${mode === 'signup' ? 'is-active' : ''}`} onClick={() => setMode('signup')}>Crear cuenta</button>
            </div>

            <div className="auth-social-row">
              <button type="button" className="soft-button" onClick={() => socialLogin('google')}>Continuar con Google</button>
              <button type="button" className="soft-button" onClick={() => socialLogin('microsoft')}>Continuar con Microsoft</button>
            </div>

            <form onSubmit={submit} className="auth-input-grid">
              {mode === 'signup' ? (
                <div className="auth-field">
                  <label>Nombre completo</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
                </div>
              ) : null}

              <div className="auth-field">
                <label>Email universitario</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@uni.edu" />
              </div>

              <div className="auth-field">
                <label>Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <div className="auth-meta-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" /> Recuérdame</label>
                <button type="button" className="soft-button" onClick={() => alert('Recuperación de contraseña simulada')}>¿Olvidaste tu contraseña?</button>
              </div>

              <p className="auth-hint">Al continuar, tu perfil se usará en el calendario, el dashboard y el panel de usuario.</p>

              <div className="auth-submit-row">
                <button className="secondary-button" type="button" onClick={onBack}>Cancelar</button>
                <button className="primary-button primary-button--compact" type="submit">{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </section>
  )
}
