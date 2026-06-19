import { useState } from 'react'

export default function AuthPage({ onLogin, onBack }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [lastName1, setLastName1] = useState('')
  const [lastName2, setLastName2] = useState('')
  const [university, setUniversity] = useState('')
  const [career, setCareer] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      return setError('Email y contraseña son requeridos')
    }

    if (!email.includes('.edu')) {
      return setError('Usa un correo universitario válido')
    }

    if (password.length < 8) {
      return setError('La contraseña debe tener mínimo 8 caracteres')
    }

    if (mode === 'signup' && !name) {
      return setError('El nombre es requerido')
    }

    if (mode === 'signup' && !lastName1) {
      return setError('El apellido paterno es requerido')
    }

    if (mode === 'signup' && !lastName2) {
      return setError('El apellido materno es requerido')
    }

    if (mode === 'signup' && !university) {
      return setError('La universidad es requerida')
    }

    if (mode === 'signup' && !career) {
      return setError('La carrera es requerida')
    }
    setLoading(true)
    try {
      setError('')


      await onLogin({
        email,
        password,
        isRegister: mode === 'signup',
        name,
        lastName1,
        lastName2,
        university,
        career,
      })
    } catch (err) {
      setError(err.message || 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
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
                <strong>Estudio monitoreado</strong>
                <span>La IA te ayuda a mantener el enfoque y optimizar tu tiempo de estudio.</span>
              </div>
              <div className="auth-proof">
                <strong>Cuenta y progreso</strong>
                <span>Guarda tu progreso y sincroniza tu plan de estudios de forma inteligente.</span>
              </div>
              <div className="auth-proof">
                <strong>Diseño amigable</strong>
                <span>La interfaz está diseñada para mantener la motivación del estudiante.</span>
              </div>
            </div>
          </aside>

          <main className="auth-form-card">
            <div className="auth-header">
              <div>
                <h3>Inicia sesión o crea tu cuenta</h3>
                <p>Usa cualquiera de estos accesos para entrar a Stressless y continuar el onboarding.</p>
              </div>
              {onBack ? <button className="soft-button" type="button" onClick={() => onBack?.()}>Volver</button> : null}
            </div>

            <div className="auth-mode-switch">
              <button type="button" className={`secondary-button ${mode === 'login' ? 'is-active' : ''}`} onClick={() => setMode('login')}>
                Iniciar sesión
              </button>
              <button type="button" className={`secondary-button ${mode === 'signup' ? 'is-active' : ''}`} onClick={() => setMode('signup')}>
                Crear cuenta
              </button>
            </div>

            <form onSubmit={submit} className="auth-input-grid">
              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}
              {mode === 'signup' && (
                <>
                  <div className="auth-field">
                    <label>Nombre</label>
                    <input
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label>Apellido Paterno</label>
                    <input
                      name="lastName1"
                      value={lastName1}
                      onChange={(e) => setLastName1(e.target.value)}
                      placeholder="Tu apellido paterno"
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label>Apellido Materno</label>
                    <input
                      name="lastName2"
                      value={lastName2}
                      onChange={(e) => setLastName2(e.target.value)}
                      placeholder="Tu apellido materno"
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label>Universidad</label>
                    <input
                      name="university"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="Ej: Universidad Nacional Mayor de San Marcos"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label>Carrera</label>
                    <input
                      name="career"
                      value={career}
                      onChange={(e) => setCareer(e.target.value)}
                      placeholder="Ej: Ingeniería de Software"
                      required
                    />
                  </div>
                </>
              )}

              <div className="auth-field">
                <label>Email universitario</label>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@uni.edu"
                  required
                />
              </div>

              <div className="auth-field">
                <label>Contraseña</label>
                <input
                  name="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {mode === 'login' && (
                <div className="auth-meta-row">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" /> Recuérdame
                  </label>
                  <button
                    type="button"
                    className="soft-button"
                    onClick={() => alert('Recuperación de contraseña (próximamente)')}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <p className="auth-hint">
                Al continuar, tu perfil se usará en el calendario, el dashboard y el panel de usuario.
              </p>

              <div className="auth-submit-row">
                <button className="secondary-button" type="button" onClick={() => onBack?.()}>
                  Cancelar
                </button>
                <button
                  className="primary-button primary-button--compact"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? 'Cargando...'
                    : mode === 'login' ? 'Entrar' : 'Crear cuenta'
                  }
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </section>
  )
}