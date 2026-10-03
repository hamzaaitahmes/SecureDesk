import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authCookieOptions, createCsrfToken, createJwt, csrfCookieOptions } from '../utils/authTokens.js';
import { writeAudit } from '../utils/audit.js';

function openSession(res, user) {
  const token = createJwt(user._id.toString());
  const csrfToken = createCsrfToken();
  res.cookie('token', token, authCookieOptions());
  res.cookie('csrfToken', csrfToken, csrfCookieOptions());
}

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.validated.body;
  const exists = await User.exists({ email: email.toLowerCase() });
  if (exists) throw new AppError('Un compte utilise déjà cette adresse e-mail.', 409);

  const user = await User.create({ firstName, lastName, email, password, role: 'employee' });
  openSession(res, user);
  await writeAudit(req, 'AUTH_REGISTER', { userId: user._id });
  res.status(201).json({ success: true, data: { user } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password +failedLoginAttempts +lockUntil');

  if (user?.lockUntil && user.lockUntil > new Date()) {
    await writeAudit(req, 'AUTH_LOGIN_LOCKED', { userId: user._id, status: 'failure' });
    throw new AppError('Compte temporairement verrouillé. Réessayez dans 15 minutes.', 423);
  }

  const passwordIsValid = user ? await user.comparePassword(password) : false;
  if (!user || !passwordIsValid) {
    if (user) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.failedLoginAttempts = 0;
      }
      await user.save({ validateBeforeSave: false });
    }
    await writeAudit(req, 'AUTH_LOGIN_FAILED', { userId: user?._id, status: 'failure' });
    throw new AppError('Adresse e-mail ou mot de passe incorrect.', 401);
  }

  if (!user.isActive) {
    await writeAudit(req, 'AUTH_LOGIN_DISABLED', { userId: user._id, status: 'failure' });
    throw new AppError('Ce compte est désactivé.', 403);
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  openSession(res, user);
  await writeAudit(req, 'AUTH_LOGIN_SUCCESS', { userId: user._id });
  res.json({ success: true, data: { user } });
});

export const logout = asyncHandler(async (req, res) => {
  await writeAudit(req, 'AUTH_LOGOUT');
  res.clearCookie('token', { ...authCookieOptions(), maxAge: undefined });
  res.clearCookie('csrfToken', { ...csrfCookieOptions(), maxAge: undefined });
  res.json({ success: true, message: 'Déconnexion réussie.' });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    await writeAudit(req, 'AUTH_PASSWORD_CHANGE_FAILED', { status: 'failure' });
    throw new AppError('Le mot de passe actuel est incorrect.', 400);
  }
  user.password = newPassword;
  await user.save();
  openSession(res, user);
  await writeAudit(req, 'AUTH_PASSWORD_CHANGED');
  res.json({ success: true, message: 'Mot de passe modifié.' });
});

