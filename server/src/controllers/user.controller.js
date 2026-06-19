import userRepository from '../repositories/user.repository.js'

function parseSemesterFields(body) {
  const data = {}
  
  if (body.semesterWeeks !== undefined && body.semesterWeeks !== null) {
    const weeks = Number(body.semesterWeeks)
    if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) {
      return { error: 'La duración del semestre debe ser un número entero entre 1 y 52 semanas.' }
    }
    data.semesterWeeks = weeks
  }

  if (body.semesterStartDate !== undefined && body.semesterStartDate !== null) {
    if (body.semesterStartDate === '') {
      data.semesterStartDate = null
    } else {
      const date = new Date(body.semesterStartDate)
      if (isNaN(date.getTime())) {
        return { error: 'La fecha de inicio del semestre no es válida.' }
      }
      data.semesterStartDate = date
    }
  }

  return { data }
}

export const completeOnboarding = async (req, res) => {
  try {
    const updateData = { hasCompletedOnboarding: true }
    
    const { data, error } = parseSemesterFields(req.body)
    if (error) {
      return res.status(400).json({ message: error })
    }

    Object.assign(updateData, data)

    const user = await userRepository.updateById(req.user._id, updateData)
    res.json({ ok: true, user })
  } catch (e) {
    console.error('[userController.completeOnboarding] Error:', e)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { semesterWeeks, semesterStartDate } = req.body
    if (semesterWeeks === undefined && semesterStartDate === undefined) {
      return res.status(400).json({ message: 'No se enviaron campos de semestre para actualizar.' })
    }
    
    const { data, error } = parseSemesterFields(req.body)
    if (error) {
      return res.status(400).json({ message: error })
    }

    const user = await userRepository.updateById(req.user._id, data)
    res.json({ ok: true, user })
  } catch (e) {
    console.error('[userController.updateProfile] Error:', e)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}