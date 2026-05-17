import { useState, useMemo, useEffect } from 'react'
import './App.css'

// 1. Importamos las vistas (asumiendo que las separas en archivos)
import AuthPage from './components/AuthPage'
import LandingPage from './pages/LandingPage'
import SplashPage from './pages/SplashPage'
import TestPage from './pages/TestPage'
import CoursesPage from './pages/CoursesPage'
import CalendarPage from './pages/CalendarPage'

// 2. Importamos los servicios reales de Axios que creaste antes
import { loginApi, registerApi } from './api/auth'

// 3. Importamos los datos estáticos que movimos en el Paso 1
import { learningQuestions, defaultCourses, navItems, calendarAdjustmentOptions } from './data/mockData'

function App() {
  // Estados de Navegación y Usuario Real
  const [view, setView] = useState('landing')
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Estados del Onboarding (Test de aprendizaje)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState(Array(learningQuestions.length).fill(null))

  // Estados de Cursos
  const [coursesState, setCoursesState] = useState(defaultCourses)
  const [selectedCourses, setSelectedCourses] = useState(['Matemáticas III', 'Física II'])
  const [showAddCourseModal, setShowAddCourseModal] = useState(false)

  // Barra de progreso del Test utilizando useMemo
  const progress = useMemo(() => ((questionIndex + 1) / learningQuestions.length) * 100, [questionIndex])

  // ==========================================
  // 🔐 DETECTOR DE SESIÓN PERSISTENTE (F5)
  // ==========================================
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token')

    if (tokenGuardado) {
      // 1. Si hay un token, le indicamos a React que mande al usuario directo al Dashboard
      setView('calendar')

      // 2. OPCIONAL/RECOMENDADO: 
      // Como al recargar la página también se borra el estado `user` (haciendo que vuelva a ser null),
      // aquí deberías hacer una petición rápida a tu backend para recuperar los datos de su perfil.
      // Ejemplo:
      // api.get('/auth/me').then(response => {
      //   setUser(response.data.user);
      // }).catch(() => handleLogout()); // Si el token expiró o es inválido, lo deslogueamos.
    }
  }, []) // El arreglo vacío [] asegura que esto solo corra una vez al cargar la páginas

  // Función de enrutamiento interno
  function go(nextView) {
    setView(nextView)
    if (nextView !== 'test') setQuestionIndex(0)
  }

  // ==========================================
  // 🔥 CONEXIÓN REAL CON EL BACKEND (AXIOS)
  // ==========================================
  async function handleLoginOrRegister(formData) {
    try {
      let response;

      if (formData.isRegister) {
        // Petición real de registro: envía nombre, carrera, universidad, etc.
        response = await registerApi(formData)
      } else {
        // Petición real de login: solo envía email y password
        response = await loginApi({
          email: formData.email,
          password: formData.password
        })
      }

      // Extraemos el token y los datos del usuario que devuelve tu backend
      const { token, user: userData } = response.data

      // Guardamos el token en localStorage
      localStorage.setItem('token', token)

      // Guardamos el usuario real en el estado global
      setUser(userData)

      // 🔥 Cambiado: Como ya se identificó con éxito, ahora puede iniciar el test bajo su cuenta real
      go('splash')

    } catch (error) {
      // Capturamos el error del backend (ej: "El correo ya está registrado" o "401 No autorizado")
      const serverMessage = error.response?.data?.message || 'Ocurrió un error en la comunicación con el servidor.'

      // Lanzamos el error de nuevo para que el catch de tu `AuthPage.jsx` lo reciba y lo pinte en la caja roja
      throw new Error(serverMessage)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token') // Destruimos el token de sesión
    setUser(null)
    go('landing')
  }

  // ==========================================
  // LÓGICA DE CURSOS Y PASOS COGNITIVOS
  // ==========================================
  function toggleCourse(courseName) {
    setSelectedCourses((current) =>
      current.includes(courseName) ? current.filter((item) => item !== courseName) : [...current, courseName]
    )
  }

  function submitAddCourse({ name, code, credits }) {
    const newCourse = { name, code, credits }
    setCoursesState((s) => [...s, newCourse])
    setSelectedCourses((s) => [...s, name])
    setShowAddCourseModal(false)
  }

  function handleSelectOption(qIndex, value) {
    setAnswers((a) => {
      const copy = [...a]
      copy[qIndex] = value
      return copy
    })
  }

  // Determina si estamos dentro del panel principal o en el flujo introductorio
  const isDashboardView = ['calendar', 'tasks', 'wellness', 'admin', 'profile'].includes(view)

  return (
    <div className={`app-shell ${isDashboardView ? 'app-shell--page' : 'app-shell--intro'} ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>

      {/* VISTA DEL DASHBOARD (USUARIO AUTENTICADO) */}
      {isDashboardView ? (
        <>
          <aside className={`sidebar ${sidebarOpen ? '' : 'is-closed'}`}>
            <div className="sidebar__brand-row">
              <div className="sidebar__brand">Stressless</div>
              <button className="sidebar__toggle" type="button" onClick={() => setSidebarOpen(!sidebarOpen)}>⚙️</button>
            </div>

            <nav className="sidebar__menu">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar__item ${view === item.id ? 'is-active' : ''}`}
                  onClick={() => go(item.id)}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="sidebar__footer">
              <strong>{user?.name || 'Estudiante'}</strong>
              <span>{user?.email || 'correo@uni.edu'}</span>
              <button className="soft-button" type="button" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </aside>

          <main className="shell-main shell-main--page">
            <div className="page-content">
              {view === 'calendar' && <CalendarPage user={user} selectedCourses={selectedCourses} />}
              {/* Aquí renderizarías el resto de páginas: TasksPage, WellnessPage, etc. */}
            </div>
          </main>
        </>
      ) : (
        /* VISTA DEL ONBOARDING / LOGIN (USUARIO AFUERA) */
        <main className="shell-main shell-main--intro">
          <div className="page-content page-content--intro">
            {view === 'landing' && (<LandingPage
              onStart={() => go('auth')} // ⬅️ Cambiado: Ahora va directo a iniciar sesión o registrarse
              onAuth={() => go('auth')}
              user={user}
            />
            )}

            {view === 'splash' && <SplashPage onStart={() => go('test')} onAuth={() => go('auth')} />}

            {view === 'test' && (
              <TestPage
                index={questionIndex}
                progress={progress}
                selectedAnswers={answers}
                onSelectOption={handleSelectOption}
                onPrev={() => setQuestionIndex((v) => Math.max(0, v - 1))}
                onNext={() => {
                  if (questionIndex < learningQuestions.length - 1) {
                    setQuestionIndex((v) => v + 1)
                  } else {
                    go('courses')
                  }
                }}
              />
            )}

            {view === 'courses' && (
              <CoursesPage
                courses={coursesState}
                selectedCourses={selectedCourses}
                onToggleCourse={toggleCourse}
                onAddCourse={() => setShowAddCourseModal(true)}
                onGenerate={() => go('calendar')} // ⬅️ Cambiado: Va directo al calendario porque ya está autenticado
              />
            )}

            {/* TU COMPONENTE REAL CONECTADO A LA FUNCIÓN ASÍNCRONA */}
            {view === 'auth' && (
              <AuthPage
                onLogin={handleLoginOrRegister}
                onBack={() => go('landing')}
              />
            )}
          </div>
        </main>
      )}

      {/* MODAL PARA AGREGAR CURSOS */}
      {showAddCourseModal && (
        <div className="modal-overlay" role="dialog">
          <div className="modal-card">
            <h3>Agregar curso manualmente</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const name = e.target.name.value.trim()
              const code = e.target.code.value.trim() || 'CURS101'
              const credits = parseInt(e.target.credits.value, 10) || 3
              if (!name) return alert('El nombre es requerido')
              submitAddCourse({ name, code, credits })
            }}>
              <input name="name" placeholder="Nombre del curso" required />
              <input name="code" placeholder="Código" />
              <input name="credits" type="number" placeholder="Créditos" defaultValue={3} />
              <button type="button" onClick={() => setShowAddCourseModal(false)}>Cancelar</button>
              <button type="submit">Agregar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;