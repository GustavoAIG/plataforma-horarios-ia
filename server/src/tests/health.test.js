import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../index.js'

describe('GET /api/health - DB-Aware Health Check', () => {
  beforeEach(() => {
    // Restablecer el estado por defecto a conectado (1) antes de cada test
    mongoose.connection.readyState = 1
  })

  it('Debería retornar 200 { status: "ok", db: "connected" } cuando readyState === 1 (conectado)', async () => {
    mongoose.connection.readyState = 1

    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok', db: 'connected' })
  })

  it('Debería retornar 503 { status: "degraded", db: "disconnected" } cuando readyState !== 1 (desconectado)', async () => {
    mongoose.connection.readyState = 0

    const res = await request(app).get('/api/health')

    expect(res.status).toBe(503)
    expect(res.body).toEqual({ status: 'degraded', db: 'disconnected' })
  })
})
