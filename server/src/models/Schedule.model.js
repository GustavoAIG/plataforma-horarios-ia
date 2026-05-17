import mongoose from 'mongoose'

// Bloque individual del horario generado por Gemini
const scheduleBlockSchema = new mongoose.Schema({
  day:       { type: String }, // "Lunes", "Martes", etc.
  startTime: { type: String }, // "08:00"
  endTime:   { type: String }, // "10:00"
  activity:  { type: String }, // "Estudio Base de Datos"
  type:      { type: String, enum: ['clase', 'estudio', 'repaso', 'descanso', 'otro'], default: 'estudio' },
  course:    { type: String }, // nombre del curso
})

const studyScheduleSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courses:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  aiPlan:        { type: String, default: '' },   // respuesta Markdown de Gemini
  blocks:        [scheduleBlockSchema],            // bloques parseados para el calendario
  preference:    { type: String, default: 'balanced' },
  learningStyle: { type: [String], default: [] },
  generatedAt:   { type: Date, default: Date.now },
  semester:      { type: String, default: '' },
}, { timestamps: true, collection: 'studySchedules' })

export default mongoose.model('StudySchedule', studyScheduleSchema)