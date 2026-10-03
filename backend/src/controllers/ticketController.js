import fs from 'node:fs/promises';
import path from 'node:path';
import Comment from '../models/Comment.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { writeAudit } from '../utils/audit.js';
import { cleanValue } from '../middleware/sanitize.js';

const populateTicket = [
  { path: 'createdBy', select: 'firstName lastName email role' },
  { path: 'assignedTo', select: 'firstName lastName email role' },
];

function accessFilter(user) {
  if (user.role === 'admin') return {};
  if (user.role === 'technician') return { assignedTo: user._id };
  return { createdBy: user._id };
}

async function findAccessibleTicket(id, user) {
  const ticket = await Ticket.findOne({ _id: id, ...accessFilter(user) }).populate(populateTicket);
  if (!ticket) throw new AppError('Ticket introuvable ou accès interdit.', 404);
  return ticket;
}

export const listTickets = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
  const filter = { ...accessFilter(req.user) };
  if (['open', 'in_progress', 'resolved', 'closed'].includes(req.query.status)) filter.status = req.query.status;
  if (['low', 'medium', 'high', 'urgent'].includes(req.query.priority)) filter.priority = req.query.priority;
  if (['hardware', 'software', 'network', 'access', 'other'].includes(req.query.category)) filter.category = req.query.category;
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const escaped = req.query.search.trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ title: new RegExp(escaped, 'i') }, { code: new RegExp(escaped, 'i') }];
  }

  const [tickets, total] = await Promise.all([
    Ticket.find(filter).populate(populateTicket).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Ticket.countDocuments(filter),
  ]);
  res.json({ success: true, data: { tickets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await findAccessibleTicket(req.params.id, req.user);
  res.json({ success: true, data: { ticket } });
});

export const createTicket = asyncHandler(async (req, res) => {
  const data = cleanValue(req.validated.body);
  try {
    const ticket = await Ticket.create({
      ...data,
      createdBy: req.user._id,
      attachment: req.file ? {
        originalName: req.file.originalname.slice(0, 200),
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      } : null,
    });
    await ticket.populate(populateTicket);
    await writeAudit(req, 'TICKET_CREATED', { details: { ticketId: ticket._id, code: ticket.code } });
    res.status(201).json({ success: true, data: { ticket } });
  } catch (error) {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await findAccessibleTicket(req.params.id, req.user);
  if (req.user.role === 'technician') throw new AppError('Le technicien modifie uniquement le statut.', 403);
  if (req.user.role === 'employee' && ticket.status !== 'open') {
    throw new AppError('Seul un ticket ouvert peut être modifié.', 409);
  }
  Object.assign(ticket, req.validated.body);
  await ticket.save();
  await ticket.populate(populateTicket);
  await writeAudit(req, 'TICKET_UPDATED', { details: { ticketId: ticket._id } });
  res.json({ success: true, data: { ticket } });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const ticket = await findAccessibleTicket(req.params.id, req.user);
  if (!['technician', 'admin'].includes(req.user.role)) throw new AppError('Action réservée au support.', 403);
  ticket.status = req.validated.body.status;
  ticket.resolvedAt = ticket.status === 'resolved' ? new Date() : ticket.resolvedAt;
  ticket.closedAt = ticket.status === 'closed' ? new Date() : ticket.closedAt;
  await ticket.save();
  await ticket.populate(populateTicket);
  await writeAudit(req, 'TICKET_STATUS_CHANGED', { details: { ticketId: ticket._id, status: ticket.status } });
  res.json({ success: true, data: { ticket } });
});

export const assignTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new AppError('Ticket introuvable.', 404);
  const { technicianId } = req.validated.body;
  if (technicianId) {
    const technician = await User.findOne({ _id: technicianId, role: 'technician', isActive: true });
    if (!technician) throw new AppError('Technicien introuvable ou inactif.', 400);
  }
  ticket.assignedTo = technicianId || null;
  if (technicianId && ticket.status === 'open') ticket.status = 'in_progress';
  await ticket.save();
  await ticket.populate(populateTicket);
  await writeAudit(req, 'TICKET_ASSIGNED', { details: { ticketId: ticket._id, technicianId } });
  res.json({ success: true, data: { ticket } });
});

export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new AppError('Ticket introuvable.', 404);
  await Promise.all([Comment.deleteMany({ ticket: ticket._id }), ticket.deleteOne()]);
  if (ticket.attachment?.path) await fs.unlink(ticket.attachment.path).catch(() => {});
  await writeAudit(req, 'TICKET_DELETED', { details: { ticketId: ticket._id, code: ticket.code } });
  res.json({ success: true, message: 'Ticket supprimé.' });
});

export const downloadAttachment = asyncHandler(async (req, res) => {
  const ticket = await findAccessibleTicket(req.params.id, req.user);
  if (!ticket.attachment?.path) throw new AppError('Aucune pièce jointe.', 404);
  const absolutePath = path.resolve(ticket.attachment.path);
  await fs.access(absolutePath).catch(() => { throw new AppError('Fichier introuvable.', 404); });
  await writeAudit(req, 'ATTACHMENT_DOWNLOADED', { details: { ticketId: ticket._id } });
  res.download(absolutePath, ticket.attachment.originalName);
});

export { findAccessibleTicket };
