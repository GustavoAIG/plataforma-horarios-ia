import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)


const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

const scheduleResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    weeklyBlocks: {
      type: SchemaType.ARRAY,
      description: 'Lista de bloques de horario para toda la semana',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          day:       { type: SchemaType.STRING, enum: ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'] },
          startTime: { type: SchemaType.STRING, description: 'Formato HH:MM, ej. 09:00' },
          endTime:   { type: SchemaType.STRING, description: 'Formato HH:MM, ej. 10:30' },
          activity:  { type: SchemaType.STRING },
          type:      { type: SchemaType.STRING, enum: ['clase','estudio','repaso','descanso','otro'] },
          course:    { type: SchemaType.STRING },
        },
        required: ['day', 'startTime', 'endTime', 'activity', 'type'],
      },
    },
    courseRecommendations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          course:          { type: SchemaType.STRING },
          technique:       { type: SchemaType.STRING },
          recommendedHours:{ type: SchemaType.NUMBER },
        },
        required: ['course', 'technique'],
      },
    },
    smartReminders: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title:        { type: SchemaType.STRING },
          daysInAdvance:{ type: SchemaType.NUMBER },
        },
        required: ['title', 'daysInAdvance'],
      },
    },
    antiStressStrategy: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: '3 a 4 puntos concretos basados en el estilo de aprendizaje',
    },
  },
  required: ['weeklyBlocks', 'courseRecommendations', 'smartReminders', 'antiStressStrategy'],
}

const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: scheduleResponseSchema,
    temperature: 0.4, // menos creatividad = más consistencia estructural
  },
})

export const generateSchedule = async ({ courses, preference, learningAnswers, userName }) => {
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
- Los cursos con mayor prioridad deben tener más bloques de repaso
- Incluye bloques tipo "descanso" de 15-30 min cada 2 horas de estudio
- No planifiques las horas de clase presencial, solo estudio independiente
- Genera entre 15 y 25 bloques semanales en total
- Las horas deben estar en formato 24h, ej: "14:30"
- Sugiere técnicas de estudio concretas por curso según el estilo de aprendizaje
- Genera 2-3 recordatorios inteligentes con anticipación en días`

  let attempt = 0
  const maxAttempts = 2

  while (attempt < maxAttempts) {
    attempt++
    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()

      // Con responseSchema, Gemini devuelve JSON válido directamente.
      // Aun así, validamos antes de confiar en la estructura.
      const parsed = JSON.parse(text)

      if (!Array.isArray(parsed.weeklyBlocks) || parsed.weeklyBlocks.length === 0) {
        throw new Error('Gemini devolvió un array de bloques vacío')
      }

      return {
        blocks: parsed.weeklyBlocks,
        recommendations: parsed.courseRecommendations || [],
        reminders: parsed.smartReminders || [],
        antiStressStrategy: parsed.antiStressStrategy || [],
        // Mantenemos un resumen en texto para mostrar en el banner de la IA,
        // pero el calendario YA NO depende de parsear esto.
        summaryText: buildSummaryMarkdown(parsed),
      }
    } catch (err) {
      console.error(`[Gemini] Intento ${attempt}/${maxAttempts} falló:`, err.message)
      if (attempt >= maxAttempts) {
        throw new Error('No se pudo generar un horario válido con la IA. Intenta de nuevo.')
      }
    }
  }
}

// Texto legible opcional, derivado de la estructura ya validada (no al revés)
function buildSummaryMarkdown(parsed) {
  const lines = ['## Resumen del horario generado\n']
  for (const rec of parsed.courseRecommendations || []) {
    lines.push(`- **${rec.course}**: ${rec.technique}${rec.recommendedHours ? ` (${rec.recommendedHours}h/semana)` : ''}`)
  }
  return lines.join('\n')
}

// Sin cambios: extracción de cursos desde malla curricular
export const extractCoursesFromMalla = async ({ fileBase64, mimeType }) => {
  const extractionModel = genAI.getGenerativeModel({ model: MODEL_NAME })

  const prompt = `Analiza el documento adjunto (malla curricular o plan de estudios).
Extrae la lista de cursos que correspondan al ciclo actual.

Para cada curso, extrae: name, code, credits (entero, asume 3 si no se indica).

Responde únicamente con un array JSON puro, sin markdown:
[{"name": "...", "code": "...", "credits": 3}]`

  let result
  if (mimeType && (mimeType.startsWith('text/') || mimeType === 'application/octet-stream')) {
    const textContent = Buffer.from(fileBase64, 'base64').toString('utf-8')
    result = await extractionModel.generateContent([
      `CONTENIDO DEL DOCUMENTO:\n---\n${textContent}\n---\n\n${prompt}`
    ])
  } else {
    result = await extractionModel.generateContent([
      { inlineData: { data: fileBase64, mimeType } },
      { text: prompt }
    ])
  }

  const responseText = result.response.text().trim()
  
  // Limpiar concatenaciones de JS si existen en la respuesta cruda (e.g. 'linea1' + 'linea2')
  let sanitizedText = responseText
    .replace(/['"]\s*\+\s*\n?\s*['"]/g, '')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')

  const jsonMatch = sanitizedText.match(/\[\s*\{[\s\S]*\}\s*\]/)
  const cleanJson = jsonMatch ? jsonMatch[0] : sanitizedText.replace(/^```json\s*/i, '').replace(/```$/, '').trim()

  try {
    return JSON.parse(cleanJson)
  } catch (err) {
    // Intentar reparar comillas simples y claves sin comillas
    try {
      const fixedJson = cleanJson
        .replace(/'/g, '"')
        .replace(/([{\s,])(\w+)\s*:/g, '$1"$2":')
      return JSON.parse(fixedJson)
    } catch (err2) {
      console.error('Error al parsear cursos extraídos:', responseText)
      throw new Error('La respuesta de la IA no tiene el formato JSON esperado.')
    }
  }
}