import userRepository from '../repositories/user.repository.js'
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
    const { answers } = req.body
    const user = await userRepository.updateById(req.user._id, { learningAnswers: answers })
    res.json(user)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}