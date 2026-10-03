import { Router } from 'express';
import { authorize, protect } from '../middleware/auth.js';
import { uploadAttachment } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  assignTicket, createTicket, deleteTicket, downloadAttachment, getTicket,
  listTickets, updateStatus, updateTicket,
} from '../controllers/ticketController.js';
import { addComment, listComments } from '../controllers/commentController.js';
import {
  assignSchema, commentSchema, createTicketSchema, idSchema, statusSchema, updateTicketSchema,
} from '../validation.js';

const router = Router();
router.use(protect);
router.route('/').get(listTickets).post(uploadAttachment.single('attachment'), validate(createTicketSchema), createTicket);
router.get('/:id/attachment', validate(idSchema), downloadAttachment);
router.route('/:id/comments').get(validate(idSchema), listComments).post(validate(commentSchema), addComment);
router.patch('/:id/status', validate(statusSchema), updateStatus);
router.patch('/:id/assign', authorize('admin'), validate(assignSchema), assignTicket);
router.route('/:id').get(validate(idSchema), getTicket).put(validate(updateTicketSchema), updateTicket)
  .delete(authorize('admin'), validate(idSchema), deleteTicket);
export default router;

