import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    action: { type: String, required: true, maxlength: 100, index: true },
    status: { type: String, enum: ['success', 'failure'], default: 'success' },
    ipAddress: { type: String, default: 'unknown' },
    userAgent: { type: String, default: 'unknown', maxlength: 500 },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
