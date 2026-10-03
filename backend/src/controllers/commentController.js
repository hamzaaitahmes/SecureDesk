import Comment from '../models/Comment.js';
import asyncHandler from '../utils/asyncHandler.js';
import { writeAudit } from '../utils/audit.js';
import { findAccessibleTicket } from './ticketController.js';

export const listComments = asyncHandler(async (req, res) => {
  await findAccessibleTicket(req.params.id, req.user);
  const comments = await Comment.find({ ticket: req.params.id })
    .populate('author', 'firstName lastName role').sort({ createdAt: 1 });
  res.json({ success: true, data: { comments } });
});

export const addComment = asyncHandler(async (req, res) => {
  const ticket = await findAccessibleTicket(req.params.id, req.user);
  const comment = await Comment.create({
    content: req.validated.body.content,
    ticket: ticket._id,
    author: req.user._id,
  });
  await comment.populate('author', 'firstName lastName role');
  await writeAudit(req, 'COMMENT_CREATED', { details: { ticketId: ticket._id, commentId: comment._id } });
  res.status(201).json({ success: true, data: { comment } });
});
