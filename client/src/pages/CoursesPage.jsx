// Si prefieres pasar los iconos como props o importarlos desde un archivo de iconos, puedes hacerlo.
// Aquí mantengo los componentes de iconos que usaba el archivo original para que no te falte nada.
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
      <rect x="4" y="5" width="16" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 3v4M17 3v4M4 9h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SparkMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export default function CoursesPage({ 
  courses, 
  selectedCourses, 
  onToggleCourse, 
  onAddCourse, 
  onImport, 
  onGenerate 
}) {

  // Manejador local para la importación universitaria
  function handleUniversityImport() {
    if (onImport) {
      // Ejecuta la función que viene del padre
      onImport();
    } else {
      // Callback por defecto si no se pasa la prop, ideal para testing
      console.log('Simulando importación desde el sistema universitario...');
    }
  }

  return (
    <section className="page page--courses">
      <div className="screen-card courses-card">
        
        {/* ENCABEZADO DE LA PÁGINA */}
        <div className="header-row header-row--courses">
          <div className="section-icon section-icon--calendar">
            <CalendarIcon />
          </div>
          <div>
            <h2 className="section-title">Cursos Matriculados</h2>
            <p className="section-subtitle">Selecciona los cursos que estás llevando este semestre</p>
          </div>
        </div>

        {/* BANNER INFORMATIVO EXPLICANDO EL VALOR DE LA IA */}
        <div className="info-banner">
          <SparkMarkIcon />
          <div>
            <strong>¿Por qué necesitamos esta información?</strong>
            <p>
              La IA generará un horario de estudio personalizado para cada curso, 
              distribuyendo el tiempo de forma balanceada y evitando que estudies todo a 
              última hora, reduciendo significativamente tu estrés académico.
            </p>
          </div>
        </div>

        {/* CUADRÍCULA DE CURSOS DISPONIBLES */}
        <div className="course-grid">
          {courses && courses.map((course) => {
            const isSelected = selectedCourses.includes(course.name);
            
            return (
              <button 
                key={course.code} 
                className={`course-card ${isSelected ? 'is-selected' : ''}`} 
                type="button" 
                onClick={() => onToggleCourse(course.name)}
                aria-pressed={isSelected}
              >
                <span className="checkbox-circle" />
                <span>
                  <strong>{course.name}</strong>
                  <small>{course.code} • {course.credits} créditos</small>
                </span>
              </button>
            );
          })}
        </div>

        {/* ACCIONES SECUNDARIAS: AGREGAR MANUAL O IMPORTAR */}
        <div className="course-actions">
          <button 
            className="soft-button" 
            type="button" 
            onClick={onAddCourse}
          >
            + Agregar curso manualmente
          </button>
          
          <button 
            className="soft-button" 
            type="button" 
            onClick={handleUniversityImport}
          >
            + Importar desde sistema universitario
          </button>
        </div>

        {/* BOTÓN PRINCIPAL PARA ENVIAR Y CONTINUAR AL LOGIN/REGISTRO */}
        <button 
          className="primary-button primary-button--wide" 
          type="button" 
          onClick={onGenerate}
          disabled={selectedCourses.length === 0} // Evita avanzar sin seleccionar nada
        >
          GENERAR MI HORARIO
        </button>
        
      </div>
    </section>
  );
}