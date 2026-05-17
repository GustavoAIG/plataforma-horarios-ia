// Datos simulados para las secciones — reemplazar fácilmente con API/DB
export const user = {
  name: 'María Pérez',
  role: 'Estudiante',
}

export const stats = {
  hoursStudied: 124,
  avgSleep: 6.5,
  completedCourses: 5,
  progressPercent: 72,
}

export const courses = [
  { id: 1, title: 'Matemáticas I', teacher: 'Dra. López', schedule: 'Lun 9:00 - 11:00' },
  { id: 2, title: 'Física General', teacher: 'Prof. Ruiz', schedule: 'Mar 13:00 - 15:00' },
  { id: 3, title: 'Programación', teacher: 'Ing. Gómez', schedule: 'Mié 10:00 - 12:00' },
  { id: 4, title: 'Historia', teacher: 'Lic. Ortega', schedule: 'Jue 8:00 - 10:00' },
]

export const learningQuestions = [
  { prompt: '¿Cuál es tu horario preferido para estudiar?', options: ['Mañana temprano (6:00-9:00)', 'Media mañana (9:00-12:00)', 'Tarde (14:00-18:00)', 'Noche (18:00-23:00)'] },
  { prompt: '¿Qué duración prefieres para una sesión?', options: ['25-50 min', '60-90 min', '90+ min', 'Depende del tema'] },
  { prompt: '¿Cómo te concentras mejor?', options: ['Silencio', 'Música suave', 'Café y descansos', 'Ambiente social'] },
  { prompt: '¿Con cuánta anticipación preparas exámenes?', options: ['1 semana', '2 semanas', '3 semanas', '1 mes'] },
  { prompt: '¿Cuándo se te hace más fácil rendir?', options: ['Mañana', 'Mediodía', 'Tarde', 'Noche'] },
];

export const defaultCourses = [
  { name: 'Matemáticas III', code: 'MAT301', credits: 4 },
  { name: 'Física II', code: 'FIS201', credits: 4 },
  { name: 'Química Orgánica', code: 'QUI205', credits: 3 },
  { name: 'Cálculo Avanzado', code: 'CAL302', credits: 4 },
  { name: 'Programación II', code: 'PRO202', credits: 3 },
  { name: 'Estadística', code: 'EST101', credits: 3 },
];

export const navItems = [
  { id: 'calendar', label: 'Calendario' },
  { id: 'tasks', label: 'Tareas' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'admin', label: 'Admin Panel' },
  { id: 'profile', label: 'Perfil' },
];

export const calendarAdjustmentOptions = [
  { id: 'balanced', label: 'Balancear jornada', description: 'Distribuye más el estudio y agrega pausas.' },
  { id: 'focus', label: 'Priorizar exámenes', description: 'Aumenta bloques intensivos antes de evaluaciones.' },
  { id: 'light', label: 'Reducir carga', description: 'Acorta sesiones y deja espacio libre adicional.' },
];
