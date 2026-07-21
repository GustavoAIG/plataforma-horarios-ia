import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../index.js'
import userRepository from '../repositories/user.repository.js'
import courseRepository from '../repositories/course.repository.js'
import scheduleRepository from '../repositories/schedule.repository.js'
import User from '../models/User.model.js'

vi.mock('../repositories/user.repository.js', () => ({
  default: {
    findAll: vi.fn(),
    findById: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
    countAll: vi.fn(),
    countByRole: vi.fn(),
  }
}))

vi.mock('../repositories/course.repository.js', () => ({
  default: {
    countAll: vi.fn(),
  }
}))

vi.mock('../repositories/schedule.repository.js', () => ({
  default: {
    countAll: vi.fn(),
  }
}))

// Por defecto simulamos un usuario autenticado con rol admin.
// Los tests que necesiten un usuario 'student' sobreescriben esto con mockImplementationOnce.
vi.mock('../models/User.model.js', () => ({
  default: {
    findById: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({
        _id: 'admin_id',
        Name_User: 'Admin User',
        Email_User: 'admin@stressless.com',
        role: 'admin',
        toObject: function () { return this }
      })
    }))
  }
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: () => 'mocked_jwt_token',
    verify: () => ({ id: 'admin_id' }),
  }
}))

vi.mock('../utils/audit.js', () => ({
  logAction: vi.fn().mockResolvedValue(true)
}))

describe('Admin Endpoints (Pruebas de Integración)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/admin/users', () => {
    it('Debería listar todos los usuarios registrados si el solicitante es admin', async () => {
      userRepository.findAll.mockResolvedValue([
        { _id: 'u1', Name_User: 'Juan', Email_User: 'juan@example.com', role: 'student' },
        { _id: 'u2', Name_User: 'Ana', Email_User: 'ana@example.com', role: 'student' }
      ])

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(200)
      expect(res.body.total).toBe(2)
      expect(res.body.users).toHaveLength(2)
    })

    it('Debería filtrar usuarios por nombre o correo cuando se envía ?search=', async () => {
      userRepository.findAll.mockResolvedValue([
        { _id: 'u1', Name_User: 'Juan Perez', Email_User: 'juan@example.com', University_User: 'UTP' },
        { _id: 'u2', Name_User: 'Ana Lopez', Email_User: 'ana@example.com', University_User: 'UTP' }
      ])

      const res = await request(app)
        .get('/api/admin/users?search=juan')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(200)
      expect(res.body.total).toBe(1)
      expect(res.body.users[0].Name_User).toBe('Juan Perez')
    })

    it('Debería denegar acceso (403) si el usuario autenticado no es admin', async () => {
      User.findById.mockImplementationOnce(() => ({
        select: vi.fn().mockResolvedValue({
          _id: 'student_id',
          Name_User: 'Estudiante',
          role: 'student',
          toObject: function () { return this }
        })
      }))

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(403)
      expect(res.body.message).toContain('administradores')
    })
  })

  describe('PATCH /api/admin/users/:id/role', () => {
    it('Debería actualizar el rol de un usuario correctamente', async () => {
      userRepository.updateById.mockResolvedValue({
        _id: 'u1', Name_User: 'Juan', role: 'admin'
      })

      const res = await request(app)
        .patch('/api/admin/users/u1/role')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({ role: 'admin' })

      expect(res.status).toBe(200)
      expect(res.body.user.role).toBe('admin')
    })

    it('Debería rechazar (400) un valor de rol inválido', async () => {
      const res = await request(app)
        .patch('/api/admin/users/u1/role')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({ role: 'superuser' })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain("'admin' o 'student'")
    })

    it('Debería impedir que un admin se quite el rol a sí mismo', async () => {
      const res = await request(app)
        .patch('/api/admin/users/admin_id/role')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({ role: 'student' })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('No puedes quitarte')
    })

    it('Debería impedir dejar la plataforma sin ningún administrador', async () => {
      userRepository.countByRole.mockResolvedValue(1)
      userRepository.findById.mockResolvedValue({ _id: 'u2', role: 'admin' })

      const res = await request(app)
        .patch('/api/admin/users/u2/role')
        .set('Authorization', 'Bearer mocked_jwt_token')
        .send({ role: 'student' })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('al menos un administrador')
    })
  })

  describe('DELETE /api/admin/users/:id', () => {
    it('Debería eliminar un usuario correctamente', async () => {
      userRepository.findById.mockResolvedValue({ _id: 'u1', role: 'student' })
      userRepository.deleteById.mockResolvedValue(true)

      const res = await request(app)
        .delete('/api/admin/users/u1')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('eliminado')
    })

    it('Debería impedir que un admin se elimine a sí mismo', async () => {
      const res = await request(app)
        .delete('/api/admin/users/admin_id')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('propia cuenta')
    })

    it('Debería retornar 404 si el usuario a eliminar no existe', async () => {
      userRepository.findById.mockResolvedValue(null)

      const res = await request(app)
        .delete('/api/admin/users/no_existe')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/admin/stats', () => {
    it('Debería retornar las métricas generales de la plataforma', async () => {
      userRepository.countAll.mockResolvedValue(50)
      userRepository.countByRole.mockResolvedValue(2)
      courseRepository.countAll.mockResolvedValue(120)
      scheduleRepository.countAll.mockResolvedValue(45)

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(200)
      expect(res.body.totalUsers).toBe(50)
      expect(res.body.totalAdmins).toBe(2)
      expect(res.body.totalStudents).toBe(48)
      expect(res.body.totalCourses).toBe(120)
      expect(res.body.totalSchedules).toBe(45)
    })
  })
})
