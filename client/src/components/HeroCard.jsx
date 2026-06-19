import heroImg from '../assets/study.webp'

// 💡 Agregamos 'user' a las propiedades del componente
export default function HeroCard({ onStart, user }) {
  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-r from-white to-indigo-50 dark:from-slate-900 dark:to-slate-900 rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
      <div className="p-6 flex flex-col justify-center bg-white dark:bg-slate-900">
        <h1 className="text-3xl font-bold mb-2">Stressless</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Reduce tu estrés académico con rutinas inteligentes y una planificación clara.
        </p>
        
        <div className="flex gap-3">
          {/* 🟢 Si hay usuario, el botón cambia a una acción directa al dashboard */}
          <button 
            onClick={() => onStart()} 
            className="px-5 py-2 bg-indigo-600 text-white rounded-md shadow"
          >
            {user ? 'Ir a mi Calendario' : 'Comenzar'}
          </button>

          {/* Si está logueado, podemos mostrar un saludo o su perfil en lugar del botón genérico */}
          {user ? (
            <span className="px-5 py-2 text-slate-500 text-sm flex items-center">
              👋 ¡Hola de nuevo, {user.name || 'Estudiante'}!
            </span>
          ) : (
            <button 
              className="px-5 py-2 border rounded-md" 
              type="button" 
              onClick={() => alert('Stressless organiza tu estudio, tus cursos y tu calendario de forma sincronizada con IA.')} 
            >
              Más información
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6 flex items-center justify-center bg-indigo-50 dark:bg-slate-800">
        <img src={heroImg} alt="hero" className="w-56 h-auto" />
      </div>
    </div>
  )
}