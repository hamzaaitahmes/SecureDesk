import crypto from 'node:crypto';
import AppError from '../utils/AppError.js';

export function csrfProtection(req, _res, next) {
  const publicAuthRoutes = ['/api/auth/login', '/api/auth/register'];
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || publicAuthRoutes.includes(req.path) || !req.cookies?.token) return next();

  const cookieToken = req.cookies?.csrfToken || '';
  const headerToken = req.get('x-csrf-token') || '';
  const validLength = cookieToken.length > 0 && cookieToken.length === headerToken.length;
  const isValid = validLength && crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));

  if (!isValid) return next(new AppError('Jeton CSRF invalide.', 403));
  next();
}
