import scheduleRepository from '../repositories/schedule.repository.js'
import courseRepository from '../repositories/course.repository.js'
import { generateSchedule } from '../services/gemini.service.js'
import { logAction } from '../utils/audit.js'

export const generate = async (req, res) => {
  try {
    const { courseIds, preference, learningAnswers } = req.body

    if (!courseIds?.length)
      return res.status(400).json({ message: 'Selecciona al menos un curso' })

    const courses = await courseRepository.findManyByUser(courseIds, req.user._id)
    if (!courses.length)
      return res.status(400).json({ message: 'No se encontraron cursos válidos' })

    // generateSchedule ahora retorna un objeto estructurado, no texto Markdown.
    // Si Gemini falla tras los reintentos internos, esto lanza un error claro
    // (capturado abajo) en vez de propagar un parseo fallido al frontend.
    const aiResult = await generateSchedule({
      courses,
      preference: preference || 'balanced',
      learningAnswers: learningAnswers || req.user.learningAnswers || [],
      userName: req.user.Name_User,
    })

    // Mapeamos course (nombre en texto que devuelve Gemini) al _id real
    // del curso en MongoDB, para que el frontend pueda hacer lookups directos.
    const courseByName = new Map(courses.map((c) => [c.Name_Course.toLowerCase(), c._id]))
    const enrichedBlocks = aiResult.blocks.map((b) => ({
      ...b,
      courseId: b.course ? courseByName.get(b.course.toLowerCase()) || null : null,
    }))

    const schedule = await scheduleRepository.create({
      user:          req.user._id,
      courses:       courses.map((c) => c._id),
      aiPlan:        aiResult.summaryText || '',
      blocks:        enrichedBlocks,
      preference:    preference || 'balanced',
      learningStyle: learningAnswers || [],
      generatedAt:   new Date(),
    })

    await logAction({
      userId: req.user._id,
      action: 'GENERATE_SCHEDULE',
      resource: 'studySchedules',
      req,
      detail: `${courses.length} cursos, ${enrichedBlocks.length} bloques, preferencia: ${preference}`,
    })

    // El frontend recibe recommendations/reminders/strategy directamente,
    // sin necesidad de parsear nada.
    res.status(201).json({
      schedule,
      blocks: enrichedBlocks,
      recommendations: aiResult.recommendations,
      reminders: aiResult.reminders,
      antiStressStrategy: aiResult.antiStressStrategy,
    })
  } catch (e) {
    console.error('GENERATE SCHEDULE ERROR:', e)
    // Sanitizado: nunca exponemos el error interno de la SDK de Gemini al cliente
    res.status(500).json({
      message: e.message?.startsWith('No se pudo generar')
        ? e.message
        : 'Error interno del servidor al generar el horario'
    })
  }
}

export const getLatest = async (req, res) => {
  try {
    const schedule = await scheduleRepository.findLatestByUser(req.user._id)
    res.json(schedule)
  } catch (e) {
    console.error('GET LATEST SCHEDULE ERROR:', e)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

export const getAll = async (req, res) => {
  try {
    const schedules = await scheduleRepository.findAllByUser(req.user._id)
    res.json(schedules)
  } catch (e) {
    console.error('GET ALL SCHEDULES ERROR:', e)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}