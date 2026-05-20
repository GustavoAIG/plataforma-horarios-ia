import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

import video1 from '../assets/video/videostressless1.webm'
import video2 from '../assets/video/videostressless2.webm'
import video3 from '../assets/video/videostressless3.webm'
import video4 from '../assets/video/videostressless4.webm'
import stresslessIcon from '../assets/Stressless.png'

const videos = [video1, video2, video3, video4]

const universityEmailRegex =
  /^[^\s@]+@[^\s@]+\.edu(\.[a-z]+)?$/i

const INITIAL_FORM = {
  email: '',
  password: '',
  name: '',
  lastName1: '',
  lastName2: '',
  university: '',
  career: ''
}

export default function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(INITIAL_FORM)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Seleccionamos un video aleatorio al montar el componente
  const [randomVideo] = useState(() => videos[Math.floor(Math.random() * videos.length)])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    // 1. Si es registro, validamos primero los datos que aparecen arriba en la interfaz
    if (mode === 'signup') {
      if (!form.name.trim()) {
        return 'El nombre es requerido'
      }

      if (!form.lastName1.trim()) {
        return 'El apellido paterno es requerido'
      }

      if (!form.university.trim()) {
        return 'La universidad es requerida'
      }

      if (!form.career.trim()) {
        return 'La carrera es requerida'
      }
    }

    // 2. Validamos el email (limpio)
    const cleanEmail = form.email.trim().toLowerCase()
    if (!universityEmailRegex.test(cleanEmail)) {
      return 'Usa un correo universitario válido (ejemplo@universidad.edu)'
    }

    // 3. Validamos la contraseña
    // Usar .trim().length evita que guarden contraseñas compuestas solo por espacios
    if (form.password.trim().length < 8) {
      return 'La contraseña debe tener mínimo 8 caracteres válidos'
    }

    return null
  }

  async function submit(e) {
    e.preventDefault()

    if (loading) return

    setError('')

    const validationError = validateForm()

    if (validationError) {
      return setError(validationError)
    }

    setLoading(true)

    try {
      const cleanData = {
        email: form.email.trim().toLowerCase(),
        password: form.password.trim()
      }

      let user

      if (mode === 'signup') {
        user = await register({
          ...cleanData, // <--- ESTO ES LO QUE TIENES QUE AGREGAR. Ahora sí mete el email y la contraseña aquí dentro.
          name: form.name.trim(),
          lastName1: form.lastName1.trim(),
          lastName2: form.lastName2.trim(),
          university: form.university.trim(),
          career: form.career.trim()
        })
      } else {
        user = await login(cleanData)
      }

      if (user?.hasCompletedOnboarding) {
        navigate('/app/calendar', { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Ocurrió un error inesperado'
      )
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
                <div className="auth-brand-mark" style={{ overflow: 'hidden', backgroundColor: '#2C3E50' }}>
                  <img src={stresslessIcon} alt="Stressless Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <strong>Stressless</strong>
              </div>

              <h2>
                Accede con una experiencia más clara y rápida.
              </h2>

              <p>
                Guarda tu progreso, sincroniza el plan
                de estudios y mantén tu horario de forma
                inteligente.
              </p>
            </div>

            {mode === 'signup' && (
              <div className="auth-video-container" style={{ flex: 1, minHeight: 0, margin: '32px 0', borderRadius: '16px', overflow: 'hidden' }}>
                <video 
                  src={randomVideo} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            )}

            {mode !== 'signup' && (
              <div className="auth-proof-grid">
                <div className="auth-proof">
                  <strong>Estudio monitoreado</strong>

                <span>
                  La IA te ayuda a mantener el enfoque
                  y optimizar tu tiempo.
                </span>
              </div>

              <div className="auth-proof">
                <strong>Cuenta y progreso</strong>

                <span>
                  Guarda tu progreso y sincroniza tu
                  plan de estudios.
                </span>
              </div>

              <div className="auth-proof">
                <strong>Diseño amigable</strong>

                <span>
                  Interfaz diseñada para mantener la
                  motivación.
                </span>
              </div>
            </div>
            )}
          </aside>

          <main className="auth-form-card">

            <div className="auth-header">
              <div>
                <h3>
                  Inicia sesión o crea tu cuenta
                </h3>

                <p>
                  Entra a Stressless y continúa tu
                  onboarding.
                </p>
              </div>

              <button
                className="soft-button-volver"
                type="button"
                onClick={() => navigate('/')}
              >
                Volver
              </button>
            </div>

            <div className="auth-mode-switch">
              <button
                type="button"
                className={`switch-tab ${mode === 'login'
                  ? 'is-active'
                  : ''
                  }`}
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                className={`switch-tab ${mode === 'signup'
                  ? 'is-active'
                  : ''
                  }`}
                onClick={() => {
                  setMode('signup')
                  setError('')
                }}
              >
                Crear cuenta
              </button>
            </div>

            <form
              onSubmit={submit}
              className="auth-input-grid"
            >

              {error && (
                <div
                  className="auth-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {mode === 'signup' && (
                <>
                  <div className="auth-field">
                    <label htmlFor="name">
                      Nombre
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      autoComplete="given-name"
                      maxLength={50}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="lastName1">
                      Apellido paterno
                    </label>

                    <input
                      id="lastName1"
                      name="lastName1"
                      type="text"
                      value={form.lastName1}
                      onChange={handleChange}
                      placeholder="Tu apellido paterno"
                      autoComplete="family-name"
                      maxLength={50}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="lastName2">
                      Apellido materno
                    </label>

                    <input
                      id="lastName2"
                      name="lastName2"
                      type="text"
                      value={form.lastName2}
                      onChange={handleChange}
                      placeholder="Tu apellido materno"
                      maxLength={50}
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="university">
                      Universidad
                    </label>

                    <input
                      id="university"
                      name="university"
                      type="text"
                      value={form.university}
                      onChange={handleChange}
                      placeholder="Ej: Universidad Nacional Mayor de San Marcos"
                      maxLength={120}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="career">
                      Carrera
                    </label>

                    <input
                      id="career"
                      name="career"
                      type="text"
                      value={form.career}
                      onChange={handleChange}
                      placeholder="Ej: Ingeniería de Software"
                      maxLength={120}
                      required
                    />
                  </div>
                </>
              )}

              <div className="auth-field">
                <label htmlFor="email">
                  Email universitario
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="correo@uni.edu"
                  maxLength={120}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">
                  Contraseña
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    mode === 'login'
                      ? 'current-password'
                      : 'new-password'
                  }
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  minLength={8}
                  maxLength={100}
                  required
                />
              </div>

              <p className="auth-hint">
                Al continuar, tu perfil se usará
                en el calendario y el dashboard.
              </p>

              <div className="auth-submit-row">

                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancelar
                </button>

                <button
                  className="enter-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? 'Cargando...'
                    : mode === 'login'
                      ? 'Entrar'
                      : 'Crear cuenta'}
                </button>

              </div>

            </form>

          </main>

        </div>
      </div>
    </section>
  )
}