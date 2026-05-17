import dotenv from 'dotenv'
dotenv.config()

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)
require('dotenv').config({ path: join(__dirname, '/../.env') })

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import courseRoutes from './routes/course.routes.js'
import scheduleRoutes from './routes/schedule.routes.js'

const app = express()
const PORT = process.env.PORT || 5000

// Seguridad
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
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
app.use('/api/courses', courseRoutes)
app.use('/api/schedule', scheduleRoutes)
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// Conectar DB y levantar servidor
connectDB().then(() =>
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
)