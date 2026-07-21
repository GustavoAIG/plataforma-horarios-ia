import mongoose from 'mongoose'

// Listeners de eventos de conexión con marca de tiempo ISO para mediciones de RTO (Alta Disponibilidad)
mongoose.connection.on('disconnected', () => {
  console.log(`[${new Date().toISOString()}] MongoDB desconectado (event: disconnected)`)
})

mongoose.connection.on('reconnected', () => {
  console.log(`[${new Date().toISOString()}] MongoDB reconectado exitosamente (event: reconnected)`)
})

mongoose.connection.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] Error en conexión MongoDB (event: error):`, err?.message || err)
})

export const connectDB = async () => {
  const opts = {}
  if (process.env.DB_NAME) opts.dbName = process.env.DB_NAME
  const conn = await mongoose.connect(process.env.MONGO_URI, opts)
  console.log(`MongoDB conectado: host=${conn.connection.host} db=${conn.connection.name || conn.connection.db?.databaseName}`)
}