import userRepository from '../repositories/user.repository.js'
import { generateToken } from '../utils/generateToken.js'
import { logAction } from '../utils/audit.js'

export const register = async (req, res) => {
  try {
    const {
      name, lastName1, lastName2,
      email, password,
      age, career, university, studyGoal
    } = req.body

    if (!name || !email || !password || !lastName1)
      return res.status(400).json({ message: 'Nombre, apellido, email y contraseña son requeridos' })

    if (await userRepository.findByEmail(email))
      return res.status(400).json({ message: 'El email ya está registrado' })

    const user = await userRepository.create({
      Name_User: name,
      Last_Name_User_1: lastName1,
      Last_name_User_2: lastName2 || '',
      Email_User: email,
      Password_user: password,
      Age_User: age,
      Career_User: career || '',
      University_User: university || '',
      Study_Goal_Student: studyGoal || '',
      Registration_Date: new Date(),
    })

    await logAction({ userId: user._id, action: 'REGISTER', resource: 'auth', req })

    res.status(201).json({ user, token: generateToken(user._id) })
  } catch (e) {
    console.error('ERROR REGISTER:', e)
    res.status(500).json({ message: e.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email y contraseña requeridos' })

    const user = await userRepository.findByEmail(email)
    if (!user || !(await user.comparePassword(password))) {
      await logAction({
        userId: null, action: 'LOGIN', resource: 'auth',
        req, status: 'failure', detail: `Intento fallido: ${email}`
      })
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    await logAction({ userId: user._id, action: 'LOGIN', resource: 'auth', req })

    res.json({ user, token: generateToken(user._id) })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getMe = async (req, res) => {
  res.json(req.user)
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