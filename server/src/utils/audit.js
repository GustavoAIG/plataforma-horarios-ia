import AuditLog from '../models/AuditLog.model.js'

export const logAction = async ({ userId, action, resource, req, status = 'success', detail = '' }) => {
  try {
    await AuditLog.create({
      user:      userId,
      action,
      resource,
      ip:        req.ip,
      userAgent: req.get('user-agent'),
      status,
      detail,
    })
  } catch (e) {
    console.error('Error al registrar auditoría:', e.message)
  }
}