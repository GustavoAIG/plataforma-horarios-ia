import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../index.js'
import { connectDB } from '../config/db.js'
import userRepository from '../repositories/user.repository.js'
import courseRepository from '../repositories/course.repository.js'
import scheduleRepository from '../repositories/schedule.repository.js'

vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: {
      ...actual.default,
      connect: vi.fn(),
      connection: {
        on: vi.fn(),
        readyState: 1
      }
    }
  }
})

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

describe('Pruebas de Integración - MongoDB Atlas (Resiliencia y Fallos)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CP-INT-04: Conexión y Fallo de Servidor MongoDB Atlas', () => {
    it('Debería propagar el error de conexión cuando la DB no está disponible sin crashear inesperadamente', async () => {
      const dbError = new Error('MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster')
      mongoose.connect.mockRejectedValueOnce(dbError)

      await expect(connectDB()).rejects.toThrow('MongooseServerSelectionError')
      expect(mongoose.connect).toHaveBeenCalledTimes(1)
    })
  })

  describe('CP-INT-05: Timeout y Manejo de Errores Controlados de DB', () => {
    it('Debería retornar HTTP 500 controlado con mensaje genérico sin exponer detalles internos ante un timeout de MongoDB', async () => {
      userRepository.countAll.mockRejectedValueOnce(
        new Error('MongoServerSelectionError: Server selection timed out after 30000 ms')
      )

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer mocked_jwt_token')

      expect(res.status).toBe(500)
      expect(res.body.message).toBe('Error interno del servidor')
      expect(res.body.message).not.toContain('MongoServerSelectionError')
      expect(res.body.stack).toBeUndefined()
    })
  })
})
