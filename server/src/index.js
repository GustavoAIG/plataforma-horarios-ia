import dotenv from 'dotenv'
dotenv.config()

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)
require('dotenv').config({ path: join(__dirname, '/../.env') })

import mongoose from 'mongoose'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import courseRoutes from './routes/course.routes.js'
import scheduleRoutes from './routes/schedule.routes.js'
import adminRoutes from './routes/admin.routes.js'

const app = express()
const PORT = process.env.PORT || 5000

app.set('trust proxy', 1)

// Seguridad
app.use(helmet())
app.use(cors({ origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5175'].filter(Boolean), credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// Rate limiting global (OWASP)
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Demasiadas solicitudes, intenta más tarde' }
}))

// Rate limiting estricto para auth (NIST)
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Demasiados intentos de login, intenta en 15 minutos' }
}))

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes) 
app.use('/api/courses', courseRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/admin', adminRoutes)
app.get('/api/health', (_, res) => {
  const isConnected = mongoose.connection.readyState === 1
  if (isConnected) {
    return res.status(200).json({ status: 'ok', db: 'connected' })
  }
  return res.status(503).json({ status: 'degraded', db: 'disconnected' })
})

// Conectar DB y levantar servidor (solo en ejecución real, no en tests)
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      // Es CRÍTICO especificar '0.0.0.0' en entornos Docker/Cloud Run
      app.listen(PORT, '0.0.0.0', () => console.log(`Servidor corriendo en puerto ${PORT}`))
    })
    .catch((err) => {
      console.error('ERROR CRÍTICO: No se pudo conectar a MongoDB en el inicio.', err)
      process.exit(1) // Obliga al contenedor a caer y mostrar el error en los logs
    })
}

export default app
