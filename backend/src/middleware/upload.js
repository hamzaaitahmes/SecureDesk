import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import AppError from '../utils/AppError.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(currentDir, '../uploads');
const allowedMimeTypes = new Set(['application/pdf', 'image/png', 'image/jpeg', 'text/plain']);

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase().slice(0, 10);
    callback(null, `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${extension}`);
  },
});

export const uploadAttachment = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new AppError('Formats autorisés : PDF, PNG, JPG et TXT.', 400));
    }
    callback(null, true);
  },
});

