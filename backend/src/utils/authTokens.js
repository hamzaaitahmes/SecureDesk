import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const isSecureCookie = () => process.env.COOKIE_SECURE === 'true';

export function createJwt(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    issuer: 'securedesk-api',
    audience: 'securedesk-web',
  });
}

export function verifyJwt(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'securedesk-api',
    audience: 'securedesk-web',
  });
}

export function createCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  };
}

export function csrfCookieOptions() {
  return {
    httpOnly: false,
    secure: isSecureCookie(),
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  };
}

