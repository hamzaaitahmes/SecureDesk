import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { writeAudit } from '../utils/audit.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 15, 1), 50);
  const filter = {};
  if (['employee', 'technician', 'admin'].includes(req.query.role)) filter.role = req.query.role;
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const search = new RegExp(escapeRegex(req.query.search.trim().slice(0, 80)), 'i');
    filter.$or = [{ firstName: search }, { lastName: search }, { email: search }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

export const listTechnicians = asyncHandler(async (_req, res) => {
  const technicians = await User.find({ role: 'technician', isActive: true }).sort({ firstName: 1 });
  res.json({ success: true, data: { technicians } });
});

export const updateRole = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw new AppError('Vous ne pouvez pas modifier votre propre rôle.', 409);
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.validated.body.role }, { new: true, runValidators: true });
  if (!user) throw new AppError('Utilisateur introuvable.', 404);
  await writeAudit(req, 'USER_ROLE_CHANGED', { details: { targetUserId: user._id, role: user.role } });
  res.json({ success: true, data: { user } });
});

export const updateActiveStatus = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw new AppError('Vous ne pouvez pas désactiver votre propre compte.', 409);
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.validated.body.isActive }, { new: true });
  if (!user) throw new AppError('Utilisateur introuvable.', 404);
  await writeAudit(req, 'USER_STATUS_CHANGED', { details: { targetUserId: user._id, isActive: user.isActive } });
  res.json({ success: true, data: { user } });
});

export const listAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
  const filter = {};
  if (typeof req.query.action === 'string' && req.query.action.trim()) {
    filter.action = new RegExp(escapeRegex(req.query.action.trim().slice(0, 80)), 'i');
  }
  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate('user', 'firstName lastName email role').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ success: true, data: { logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

