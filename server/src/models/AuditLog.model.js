import mongoose from 'mongoose'

const auditLogSchema =
  new mongoose.Schema({

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },

    action: {
      type: String,
      required: true,
      index: true
    },

    resource: {
      type: String,
      trim: true
    },

    ip: {
      type: String,
      trim: true
    },

    userAgent: {
      type: String,
      maxlength: 500
    },

    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
      index: true
    },

    detail: {
      type: String,
      maxlength: 2000
    }

  }, {
    timestamps: true,
    collection: 'auditLogs'
  })

auditLogSchema.index({
  createdAt: -1
})

export default mongoose.model(
  'AuditLog',
  auditLogSchema
)