import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../index.js'
import courseRepository from '../repositories/course.repository.js'
import userRepository from '../repositories/user.repository.js'

vi.mock('../repositories/course.repository.js', () => ({
  default: {
    findByUser: vi.fn(),
    create: vi.fn(),
    updateByIdAndUser: vi.fn(),
    deleteByIdAndUser: vi.fn(),
  }
}))

vi.mock('../repositories/user.repository.js', () => ({
  default: {
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

describe('Course Endpoints (Pruebas Funcionales)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/courses', () => {
    it('Debería retornar el listado de cursos del usuario autenticado', async () => {
      courseRepository.findByUser.mockResolvedValue([
        { _id: 'course_1', Name_Course: 'Matemática I', Hours_Course: 4 },
        { _id: 'course_2', Name_Course: 'Física I', Hours_Course: 3 }
      ])

      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(200)
      expect(res.body).toBeInstanceOf(Array)
      expect(res.body.length).toBe(2)
      expect(res.body[0].Name_Course).toBe('Matemática I')
    })
  })

  describe('POST /api/courses', () => {
    it('Debería crear un curso correctamente y actualizar el contador del usuario', async () => {
      const mockCourse = {
        _id: 'new_course_id',
        user: 'mocked_user_id',
        Name_Course: 'Estructuras de Datos',
        Hours_Course: 4,
        Priority_Level_Course: 3,
        Teacher_Course: 'Docente X',
        Times_A_Week_Course: 2
      }

      courseRepository.create.mockResolvedValue(mockCourse)
      courseRepository.findByUser.mockResolvedValue([mockCourse])
      userRepository.updateById.mockResolvedValue({})

      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({
          name: 'Estructuras de Datos',
          hours: 4,
          priority: 3,
          teacher: 'Docente X',
          timesAWeek: 2
        })

      expect(res.status).toBe(201)
      expect(res.body.Name_Course).toBe('Estructuras de Datos')
      expect(courseRepository.create).toHaveBeenCalled()
      expect(userRepository.updateById).toHaveBeenCalledWith('mocked_user_id', { Courses_User: 1 })
    })

    it('Debería fallar al crear un curso si la petición genera una excepción', async () => {
      courseRepository.create.mockRejectedValue(new Error('Validación fallida'))

      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({
          name: ''
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Validación fallida')
    })
  })

  describe('PUT /api/courses/:id', () => {
    it('Debería actualizar los campos de un curso existente', async () => {
      courseRepository.updateByIdAndUser.mockResolvedValue({
        _id: 'course_1',
        Name_Course: 'Matemática Avanzada',
        Hours_Course: 5
      })

      const res = await request(app)
        .put('/api/courses/course_1')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({
          name: 'Matemática Avanzada',
          hours: 5
        })

      expect(res.status).toBe(200)
      expect(res.body.Name_Course).toBe('Matemática Avanzada')
    })

    it('Debería retornar 404 si el curso no pertenece al usuario o no existe', async () => {
      courseRepository.updateByIdAndUser.mockResolvedValue(null)

      const res = await request(app)
        .put('/api/courses/non_existent')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({
          name: 'Curso Fantasma'
        })

      expect(res.status).toBe(404)
      expect(res.body.message).toContain('no encontrado')
    })
  })

  describe('DELETE /api/courses/:id', () => {
    it('Debería eliminar el curso y actualizar el contador del usuario', async () => {
      courseRepository.deleteByIdAndUser.mockResolvedValue({ _id: 'course_1' })
      courseRepository.findByUser.mockResolvedValue([])
      userRepository.updateById.mockResolvedValue({})

      const res = await request(app)
        .delete('/api/courses/course_1')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Curso eliminado')
      expect(courseRepository.deleteByIdAndUser).toHaveBeenCalled()
      expect(userRepository.updateById).toHaveBeenCalledWith('mocked_user_id', { Courses_User: 0 })
    })

    it('Debería retornar 404 si intenta eliminar un curso inexistente o ajeno', async () => {
      courseRepository.deleteByIdAndUser.mockResolvedValue(null)

      const res = await request(app)
        .delete('/api/courses/non_existent')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(404)
      expect(res.body.message).toContain('no encontrado')
    })
  })
})
