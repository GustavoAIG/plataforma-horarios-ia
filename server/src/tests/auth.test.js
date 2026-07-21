import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../index.js'
import userRepository from '../repositories/user.repository.js'
import User from '../models/User.model.js'

// Mock de repositorios y modelos para aislamiento completo
vi.mock('../repositories/user.repository.js', () => ({
  default: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    updateById: vi.fn(),
  }
}))

vi.mock('../models/User.model.js', () => ({
  default: {
    findById: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({
        _id: 'mocked_user_id',
        Name_User: 'Test User',
        Email_User: 'test@example.com',
        learningAnswers: ['visual'],
        toJSON: function() { return this },
        toObject: function() { return this }
      })
    }))
  }
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: () => 'mocked_jwt_token',
    verify: () => ({ id: 'mocked_user_id' }),
  }
}))

vi.mock('../utils/audit.js', () => ({
  logAction: vi.fn().mockResolvedValue(true)
}))

describe('Auth Endpoints (Pruebas Funcionales)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('Debería registrar un nuevo usuario de forma exitosa', async () => {
      userRepository.findByEmail.mockResolvedValue(null)
      userRepository.create.mockResolvedValue({
        _id: 'mocked_user_id',
        Name_User: 'Juan',
        Email_User: 'juan@example.com',
        toJSON: function() { return this },
        toObject: function() { return this }
      })

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Juan',
          lastName1: 'Perez',
          email: 'juan@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user.Name_User).toBe('Juan')
    })

    it('Debería fallar si faltan campos obligatorios', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'juan@example.com',
          password: ''
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('requeridos')
    })

    it('Debería fallar si el email ya está registrado', async () => {
      userRepository.findByEmail.mockResolvedValue({ _id: 'existing_id' })

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Juan',
          lastName1: 'Perez',
          email: 'juan@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(409)
      expect(res.body.message).toContain('ya está registrado')
    })
  })

  describe('POST /api/auth/login', () => {
    it('Debería iniciar sesión de forma exitosa', async () => {
      userRepository.findByEmail.mockResolvedValue({
        _id: 'mocked_user_id',
        Email_User: 'juan@example.com',
        comparePassword: vi.fn().mockResolvedValue(true),
        toJSON: function() { return this },
        toObject: function() { return this }
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
    })

    it('Debería rechazar credenciales incorrectas', async () => {
      userRepository.findByEmail.mockResolvedValue({
        _id: 'mocked_user_id',
        Email_User: 'juan@example.com',
        comparePassword: vi.fn().mockResolvedValue(false)
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@example.com',
          password: 'wrongpassword'
        })

      expect(res.status).toBe(401)
      expect(res.body.message).toContain('inválidas')
    })
  })

  describe('GET /api/auth/me', () => {
    it('Debería obtener los datos del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(200)
      expect(res.body.user.Name_User).toBe('Test User')
    })

    it('Debería denegar acceso si no se provee token', async () => {
      // Para simular la falta de cabecera sin pasar por el mock de jwt
      const res = await request(app)
        .get('/api/auth/me')

      expect(res.status).toBe(401)
      expect(res.body.message).toContain('No autorizado')
    })
  })

  describe('POST /api/auth/learning-answers', () => {
    it('Debería guardar las respuestas del test cognitivo', async () => {
      userRepository.updateById.mockResolvedValue({
        _id: 'mocked_user_id',
        learningAnswers: ['visual', 'auditivo']
      })

      const res = await request(app)
        .post('/api/auth/learning-answers')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({
          answers: ['visual', 'auditivo']
        })

      expect(res.status).toBe(200)
      expect(res.body.user.learningAnswers).toContain('visual')
    })
  })
})
