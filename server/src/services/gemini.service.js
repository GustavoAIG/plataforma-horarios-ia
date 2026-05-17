import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export const generateSchedule = async ({ courses, preference, learningAnswers, userName }) => {
  // Construimos la lista con los campos reales de MongoDB
  const courseList = courses.map((c) =>
    `- ${c.Name_Course}: ${c.Hours_Course} horas semanales, ` +
    `${c.Times_A_Week_Course} veces por semana, ` +
    `prioridad ${c.Priority_Level_Course}/5` +
    (c.Teacher_Course ? `, docente: ${c.Teacher_Course}` : '')
  ).join('\n')

  const preferenceMap = {
    balanced: 'distribuir el estudio uniformemente con descansos regulares',
    focus:    'bloques intensivos priorizando cursos de mayor prioridad',
    light:    'sesiones cortas con bastante tiempo libre para descanso',
  }
  const preferenceText = preferenceMap[preference] || preferenceMap.balanced

  const learningText = learningAnswers?.length
    ? `\nEstilo de aprendizaje de ${userName}:\n` +
      learningAnswers.map((a, i) => `  ${i + 1}. ${a}`).join('\n')
    : ''

  const prompt = `Eres un experto en bienestar académico universitario y planificación de estudios.
Genera un horario de estudio semanal personalizado para ${userName || 'el estudiante'}.

CURSOS MATRICULADOS (datos reales):
${courseList}
${learningText}

PREFERENCIA DE ESTUDIO: ${preferenceText}

INSTRUCCIONES:
- Distribuye las horas de estudio según las horas semanales de cada curso
- Los cursos con mayor prioridad (número más alto) deben tener más bloques de repaso
- Incluye descansos de 15-30 min cada 2 horas de estudio (anti-burnout)
- Considera que el estudiante ya tiene clases presenciales, solo planifica el estudio independiente
- Sugiere técnicas específicas según el estilo de aprendizaje detectado
- Genera recordatorios inteligentes para evitar estudiar todo a última hora

RESPONDE EN ESPAÑOL con este formato exacto:

## Horario Semanal

| Hora | Lunes | Martes | Miércoles | Jueves | Viernes | Sábado |
|------|-------|--------|-----------|--------|---------|--------|
[completa la tabla con actividades reales]

## Recomendaciones por Curso
[para cada curso: técnica sugerida + horas recomendadas]

## Recordatorios Inteligentes
[lista de recordatorios con anticipación sugerida]

## Estrategia Anti-Estrés
[3-4 puntos concretos basados en el estilo de aprendizaje]`

  const result = await model.generateContent(prompt)
  return result.response.text()
}