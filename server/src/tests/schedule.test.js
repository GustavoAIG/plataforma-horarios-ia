import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../index.js'
import scheduleRepository from '../repositories/schedule.repository.js'
import courseRepository from '../repositories/course.repository.js'
import { generateSchedule } from '../services/gemini.service.js'

vi.mock('../repositories/schedule.repository.js', () => ({
  default: {
    create: vi.fn(),
    findLatestByUser: vi.fn(),
    findAllByUser: vi.fn(),
  }
}))

vi.mock('../repositories/course.repository.js', () => ({
  default: {
    findManyByUser: vi.fn(),
  }
}))

vi.mock('../services/gemini.service.js', () => ({
  generateSchedule: vi.fn()
}))

vi.mock('../models/User.model.js', () => ({
  default: {
    findById: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({
        _id: 'mocked_user_id',
        Name_User: 'Test User',
        Email_User: 'test@example.com',
        toJSON: function() { return this }
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

describe('Schedule Endpoints (Pruebas Funcionales)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/schedule/generate', () => {
    it('Debería generar y guardar un horario nuevo con éxito', async () => {
      const mockCourses = [
        { _id: 'course_1', Name_Course: 'Matemáticas', Hours_Course: 4, Priority_Level_Course: 3 }
      ]
      courseRepository.findManyByUser.mockResolvedValue(mockCourses)
      generateSchedule.mockResolvedValue({
        blocks: [
          { course: 'Matemáticas', day: 'Lunes', startTime: '08:00', endTime: '10:00' }
        ],
        summaryText: '## Horario Semanal\n| Hora | Lunes |\n|---|---|'
      })
      
      scheduleRepository.create.mockResolvedValue({
        _id: 'schedule_1',
        user: 'mocked_user_id',
        courses: ['course_1'],
        aiPlan: '## Horario Semanal\n| Hora | Lunes |\n|---|---|'
      })

      const res = await request(app)
        .post('/api/schedule/generate')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({
          courseIds: ['course_1'],
          preference: 'balanced',
          learningAnswers: ['visual']
        })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('schedule')
      expect(res.body.schedule).toHaveProperty('aiPlan')
      expect(res.body).toHaveProperty('blocks')
      expect(generateSchedule).toHaveBeenCalled()
      expect(scheduleRepository.create).toHaveBeenCalled()
    })

    it('Debería retornar 400 si no se envían IDs de cursos', async () => {
      const res = await request(app)
        .post('/api/schedule/generate')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({
          courseIds: []
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Selecciona al menos un curso')
    })

    it('Debería retornar 400 si los cursos no son válidos para el usuario', async () => {
      courseRepository.findManyByUser.mockResolvedValue([])

      const res = await request(app)
        .post('/api/schedule/generate')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({
          courseIds: ['invalid_id']
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('No se encontraron cursos válidos')
    })
  })

  describe('GET /api/schedule/latest', () => {
    it('Debería retornar el último horario generado del usuario', async () => {
      scheduleRepository.findLatestByUser.mockResolvedValue({
        _id: 'schedule_latest',
        aiPlan: '## Horario Semanal'
      })

      const res = await request(app)
        .get('/api/schedule/latest')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(200)
      expect(res.body._id).toBe('schedule_latest')
    })
  })

  describe('GET /api/schedule', () => {
    it('Debería retornar todos los horarios del usuario', async () => {
      scheduleRepository.findAllByUser.mockResolvedValue([
        { _id: 'sched_1' },
        { _id: 'sched_2' }
      ])

      const res = await request(app)
        .get('/api/schedule')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(200)
      expect(res.body.length).toBe(2)
    })
  })
})
