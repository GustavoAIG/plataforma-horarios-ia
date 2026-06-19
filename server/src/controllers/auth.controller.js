import userRepository from '../repositories/user.repository.js'
import courseRepository from '../repositories/course.repository.js'
import Course from '../models/Course.model.js'
import { generateToken } from '../utils/generateToken.js'
import { logAction } from '../utils/audit.js'

export const register = async (req, res) => {
  try {
    const {
      name,
      lastName1,
      lastName2,
      email,
      password,
      age,
      career,
      university,
      studyGoal
    } = req.body

    // Prevención de NoSQL Injection
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Formato de credenciales inválido' })
    }

    const normalizedEmail =
      email?.trim().toLowerCase()

    if (
      !name?.trim() ||
      !lastName1?.trim() ||
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Nombre, apellido, email y contraseña son requeridos'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          'La contraseña debe tener mínimo 8 caracteres'
      })
    }

    const existingUser =
      await userRepository.findByEmail(
        normalizedEmail
      )

    if (existingUser) {
      return res.status(409).json({
        message:
          'El email ya está registrado'
      })
    }

    const user =
      await userRepository.create({
        Name_User: name.trim(),
        Last_Name_User_1:
          lastName1.trim(),

        Last_Name_User_2:
          lastName2?.trim() || '',

        Email_User: normalizedEmail,

        Password_user: password,

        Age_User: age || null,

        Career_User:
          career?.trim() || '',

        University_User:
          university?.trim() || '',

        Study_Goal_Student:
          studyGoal?.trim() || '',

        Registration_Date:
          new Date(),

        hasCompletedOnboarding:
          false
      })

    await logAction({
      userId: user._id,
      action: 'REGISTER',
      resource: 'auth',
      req
    })

    const {
      Password_user,
      __v,
      ...safeUser
    } = user.toObject()

    return res.status(201).json({
      user: safeUser,
      token: generateToken(user._id)
    })

  } catch (e) {

    console.error(
      'REGISTER ERROR:',
      e
    )

    return res.status(500).json({
      message:
        'Error interno del servidor'
    })
  }
}

export const login = async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body

    // Prevención de NoSQL Injection
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Formato de credenciales inválido' })
    }

    const normalizedEmail =
      email?.trim().toLowerCase()

    if (
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Email y contraseña requeridos'
      })
    }

    const user =
      await userRepository.findByEmail(
        normalizedEmail
      )

    const isValidPassword =
      user &&
      await user.comparePassword(password)

    if (!isValidPassword) {

      await logAction({
        userId: null,
        action: 'LOGIN',
        resource: 'auth',
        req,
        status: 'failure',
        detail: `
          Intento fallido:
          ${normalizedEmail}
        `
      })

      return res.status(401).json({
        message:
          'Credenciales inválidas'
      })
    }

    await logAction({
      userId: user._id,
      action: 'LOGIN',
      resource: 'auth',
      req,
      status: 'success'
    })

    const {
      Password_user,
      __v,
      ...safeUser
    } = user.toObject()

    return res.json({
      user: safeUser,
      token: generateToken(user._id)
    })

  } catch (e) {

    console.error(
      'LOGIN ERROR:',
      e
    )

    return res.status(500).json({
      message:
        'Error interno del servidor'
    })
  }
}

export const getMe = async (req, res) => {
  const { Password_user, __v, ...safeUser } = req.user.toObject()
  res.json({ user: safeUser })
}

export const saveLearningAnswers = async (req, res) => {
  try {
    const { answers, courses } = req.body
    
    const updateData = {}
    if (answers && Array.isArray(answers)) {
      updateData.learningAnswers = answers
    }

    const savedCourses = []
    if (courses && Array.isArray(courses)) {
      // 1. Guardar nombres en onboardingCourses
      const courseNames = courses.map(c => typeof c === 'object' ? c.name : c)
      updateData.onboardingCourses = courseNames

      // 2. Crear o encontrar los cursos en MongoDB
      for (const c of courses) {
        const name = typeof c === 'object' ? c.name : c
        const code = typeof c === 'object' ? c.code : ''
        const credits = typeof c === 'object' ? c.credits : 3

        let existing = await Course.findOne({ user: req.user._id, Name_Course: name })
        if (!existing) {
          existing = await courseRepository.create({
            user: req.user._id,
            Name_Course: name,
            Hours_Course: credits ? Math.round(credits * 1.5) : 3,
            Priority_Level_Course: 3,
            Teacher_Course: '',
            Times_A_Week_Course: 2,
            code: code,
          })
        }
        savedCourses.push(existing)
      }

      // Actualizar contador del usuario
      updateData.Courses_User = savedCourses.length
    }
    
    const user = await userRepository.updateById(req.user._id, updateData)
    
    res.json({
      user,
      courses: savedCourses
    })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}