import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

// Inicialización de la API de Google Generative AI usando la clave de entorno.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Configuración del modelo: se migró a 'gemini-2.5-flash' ya que la serie 1.5 está en proceso de retiro/deprecación para esta clave.
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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

| Hora | Lunes | Martes | Miércoles | Jueves | Viernes | Sábado | Domingo |
|------|-------|--------|-----------|--------|---------|--------|---------|
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

// Analiza y extrae cursos de un documento de malla curricular (PDF o TXT) usando Gemini.
export const extractCoursesFromMalla = async ({ fileBase64, mimeType }) => {
  const prompt = `Analiza el documento adjunto (malla curricular o plan de estudios).
Extrae la lista de cursos que correspondan al ciclo actual o las asignaturas mencionadas en el documento.

REGLAS DE CICLO:
- Si el documento contiene múltiples ciclos o semestres (por ejemplo, Ciclo I, Ciclo II, etc.), intenta identificar si se especifica un ciclo actual o semestre de interés (por ejemplo, con menciones como "Ciclo V", cursos marcados, o si el archivo está enfocado en un solo ciclo).
- Si no se especifica de manera clara un ciclo actual pero el documento se divide por ciclos, extrae únicamente las asignaturas del primer ciclo mencionado o el que parezca ser el objeto de estudio principal.
- Si solo hay una lista de asignaturas individuales sin división clara de ciclos, extrae todas las asignaturas de la lista.

Para cada curso detectado, extrae o infiere los siguientes campos en formato JSON:
- name: El nombre completo del curso (ej: "Matemáticas III").
- code: El código del curso (por ejemplo, MAT101 o ALG301). Si no está disponible, créalo usando las primeras letras del nombre del curso en mayúsculas.
- credits: La cantidad de créditos del curso (un número entero). Si no se indica, asume 3.

Responde únicamente con un array en formato JSON puro, sin decoraciones de markdown (no utilices triple backticks ni \`\`\`json). Ejemplo de respuesta:
[
  {"name": "Diseño de Algoritmos", "code": "ALG301", "credits": 4},
  {"name": "Ingeniería de Requisitos", "code": "REQ202", "credits": 3}
]`;

  let result;
  if (mimeType && (mimeType.startsWith('text/') || mimeType === 'application/octet-stream')) {
    // Decodificar Base64 de archivos TXT y pasarlo como texto plano para evitar problemas de inlineData con text/plain
    const textContent = Buffer.from(fileBase64, 'base64').toString('utf-8');
    result = await model.generateContent([
      `CONTENIDO DEL DOCUMENTO DE MALLA CURRICULAR:\n---\n${textContent}\n---\n\n${prompt}`
    ]);
  } else {
    result = await model.generateContent([
      {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType
        }
      },
      { text: prompt }
    ]);
  }

  const responseText = result.response.text().trim();
  
  // Extraer el bloque JSON de manera robusta usando expresiones regulares
  const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
  const cleanJson = jsonMatch ? jsonMatch[0] : responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  
  try {
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Error al parsear el JSON de cursos extraídos. Respuesta original de Gemini:', responseText);
    throw new Error('La respuesta de la IA no tiene el formato JSON esperado.');
  }
}