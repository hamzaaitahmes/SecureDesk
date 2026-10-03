import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyJwt } from '../utils/authTokens.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new AppError('Authentification requise.', 401);

  let payload;
  try {
    payload = verifyJwt(token);
  } catch {
    throw new AppError('Session invalide ou expirée.', 401);
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new AppError('Compte indisponible.', 401);

  req.user = user;
  next();
});

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Vous n’avez pas l’autorisation nécessaire.', 403));
    }
    next();
  };
}

