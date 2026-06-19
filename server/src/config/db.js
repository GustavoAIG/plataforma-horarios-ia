import mongoose from 'mongoose'

export const connectDB = async () => {
  const opts = {}
  if (process.env.DB_NAME) opts.dbName = process.env.DB_NAME
  const conn = await mongoose.connect(process.env.MONGO_URI, opts)
  console.log(`MongoDB conectado: host=${conn.connection.host} db=${conn.connection.name || conn.connection.db?.databaseName}`)
}