import { Router } from 'express';
import { listAuditLogs, listTechnicians, listUsers, updateActiveStatus, updateRole } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { activeSchema, roleSchema } from '../validation.js';

const router = Router();
router.use(protect, authorize('admin'));
router.get('/users', listUsers);
router.get('/technicians', listTechnicians);
router.patch('/users/:id/role', validate(roleSchema), updateRole);
router.patch('/users/:id/status', validate(activeSchema), updateActiveStatus);
router.get('/logs', listAuditLogs);
export default router;

