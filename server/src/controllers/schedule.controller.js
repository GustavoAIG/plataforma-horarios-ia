import scheduleRepository from '../repositories/schedule.repository.js'
import courseRepository from '../repositories/course.repository.js'
import { generateSchedule } from '../services/gemini.service.js'
import { logAction } from '../utils/audit.js'

export const generate = async (req, res) => {
  try {
    const { courseIds, preference, learningAnswers } = req.body

    if (!courseIds?.length)
      return res.status(400).json({ message: 'Selecciona al menos un curso' })

    // Obtenemos los cursos reales del usuario desde MongoDB
    const courses = await courseRepository.findManyByUser(courseIds, req.user._id)
    if (!courses.length)
      return res.status(400).json({ message: 'No se encontraron cursos válidos' })

    // Llamamos a Gemini con los datos reales
    const aiPlan = await generateSchedule({
      courses,
      preference: preference || 'balanced',
      learningAnswers: learningAnswers || req.user.learningAnswers || [],
      userName: req.user.Name_User,
    })

    // Guardamos en la colección studySchedules
    const schedule = await scheduleRepository.create({
      user:          req.user._id,
      courses:       courses.map((c) => c._id),
      aiPlan,
      preference:    preference || 'balanced',
      learningStyle: learningAnswers || [],
      generatedAt:   new Date(),
    })

    await logAction({
      userId: req.user._id,
      action: 'GENERATE_SCHEDULE',
      resource: 'studySchedules',
      req,
      detail: `${courses.length} cursos, preferencia: ${preference}`,
    })

    res.status(201).json({ schedule, aiPlan })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getLatest = async (req, res) => {
  const schedule = await scheduleRepository.findLatestByUser(req.user._id)
  res.json(schedule)
}

export const getAll = async (req, res) => {
  const schedules = await scheduleRepository.findAllByUser(req.user._id)
  res.json(schedules)
}