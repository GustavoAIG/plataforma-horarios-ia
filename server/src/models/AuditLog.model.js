import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:    { type: String, required: true },
  resource:  { type: String },
  ip:        { type: String },
  userAgent: { type: String },
  status:    { type: String, enum: ['success', 'failure'], default: 'success' },
  detail:    { type: String },
}, { timestamps: true, collection: 'auditLogs' })

export default mongoose.model('AuditLog', auditLogSchema)