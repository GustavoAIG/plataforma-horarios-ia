import courseRepository from '../repositories/course.repository.js'
import userRepository from '../repositories/user.repository.js'
import { extractCoursesFromMalla } from '../services/gemini.service.js'

export const getCourses = async (req, res) => {
  const courses = await courseRepository.findByUser(req.user._id)
  res.json(courses)
}

export const createCourse = async (req, res) => {
  try {
    const { name, hours, priority, teacher, timesAWeek, code } = req.body
    const course = await courseRepository.create({
      user:                  req.user._id,
      Name_Course:           name,
      Hours_Course:          hours || 3,
      Priority_Level_Course: priority || 1,
      Teacher_Course:        teacher || '',
      Times_A_Week_Course:   timesAWeek || 2,
      code:                  code || '',
    })

    // Actualizar contador de cursos del usuario
    const total = await courseRepository.findByUser(req.user._id)
    await userRepository.updateById(req.user._id, { Courses_User: total.length })

    res.status(201).json(course)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

export const updateCourse = async (req, res) => {
  try {
    const { name, hours, priority, teacher, timesAWeek } = req.body
    const course = await courseRepository.updateByIdAndUser(req.params.id, req.user._id, {
      Name_Course:           name,
      Hours_Course:          hours,
      Priority_Level_Course: priority,
      Teacher_Course:        teacher,
      Times_A_Week_Course:   timesAWeek,
    })
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' })
    res.json(course)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

export const deleteCourse = async (req, res) => {
  const course = await courseRepository.deleteByIdAndUser(req.params.id, req.user._id)
  if (!course) return res.status(404).json({ message: 'Curso no encontrado' })

  const total = await courseRepository.findByUser(req.user._id)
  await userRepository.updateById(req.user._id, { Courses_User: total.length })

  res.json({ message: 'Curso eliminado' })
}

// Analiza una malla curricular (PDF o TXT) y devuelve la lista de cursos detectados.
export const analyzeMalla = async (req, res) => {
  try {
    const { fileBase64, mimeType } = req.body
    if (!fileBase64 || !mimeType) {
      return res.status(400).json({ message: 'El archivo base64 y el tipo de contenido (mimeType) son requeridos.' })
    }

    const courses = await extractCoursesFromMalla({ fileBase64, mimeType })
    res.json({ courses })
  } catch (e) {
    console.error('Error al analizar la malla:', e)
    res.status(500).json({ message: 'Error de la IA al analizar el documento: ' + e.message })
  }
}