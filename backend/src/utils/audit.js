import AuditLog from '../models/AuditLog.js';

export async function writeAudit(req, action, options = {}) {
  try {
    await AuditLog.create({
      user: options.userId || req.user?._id || null,
      action,
      status: options.status || 'success',
      ipAddress: req.ip || req.socket?.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      details: options.details || {},
    });
  } catch (error) {
    console.error('Impossible d’enregistrer le journal d’audit :', error.message);
  }
}

