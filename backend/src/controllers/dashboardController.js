import Ticket from '../models/Ticket.js';
import asyncHandler from '../utils/asyncHandler.js';

function accessFilter(user) {
  if (user.role === 'admin') return {};
  if (user.role === 'technician') return { assignedTo: user._id };
  return { createdBy: user._id };
}

export const getStats = asyncHandler(async (req, res) => {
  const match = accessFilter(req.user);
  const [statusCounts, priorityCounts, categoryCounts, recentTickets] = await Promise.all([
    Ticket.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Ticket.aggregate([{ $match: match }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Ticket.aggregate([{ $match: match }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
    Ticket.find(match).populate('createdBy', 'firstName lastName').populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 }).limit(5),
  ]);
  const status = Object.fromEntries(statusCounts.map((item) => [item._id, item.count]));
  const priority = Object.fromEntries(priorityCounts.map((item) => [item._id, item.count]));
  const category = Object.fromEntries(categoryCounts.map((item) => [item._id, item.count]));
  const total = Object.values(status).reduce((sum, value) => sum + value, 0);
  res.json({ success: true, data: { total, status, priority, category, recentTickets } });
});

