import courseRepository from '../repositories/course.repository.js'
import userRepository from '../repositories/user.repository.js'

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