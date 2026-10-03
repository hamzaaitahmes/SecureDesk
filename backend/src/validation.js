import { z } from 'zod';

const name = z.string().trim().min(2, 'Minimum 2 caractères.').max(50);
const password = z.string().min(8, 'Minimum 8 caractères.').max(72)
  .regex(/[a-z]/, 'Une minuscule est requise.')
  .regex(/[A-Z]/, 'Une majuscule est requise.')
  .regex(/[0-9]/, 'Un chiffre est requis.');
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Identifiant invalide.');

export const registerSchema = z.object({
  body: z.object({ firstName: name, lastName: name, email: z.string().email().max(120), password }),
  params: z.object({}), query: z.object({}),
});

export const loginSchema = z.object({
  body: z.object({ email: z.string().email().max(120), password: z.string().min(1).max(72) }),
  params: z.object({}), query: z.object({}),
});

export const passwordSchema = z.object({
  body: z.object({ currentPassword: z.string().min(1).max(72), newPassword: password }),
  params: z.object({}), query: z.object({}),
});

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5).max(120),
    description: z.string().trim().min(10).max(3000),
    category: z.enum(['hardware', 'software', 'network', 'access', 'other']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  }),
  params: z.object({}), query: z.object({}),
});

export const updateTicketSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5).max(120).optional(),
    description: z.string().trim().min(10).max(3000).optional(),
    category: z.enum(['hardware', 'software', 'network', 'access', 'other']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  }).refine((value) => Object.keys(value).length > 0, 'Aucune modification fournie.'),
  params: z.object({ id: objectId }), query: z.object({}),
});

export const statusSchema = z.object({
  body: z.object({ status: z.enum(['open', 'in_progress', 'resolved', 'closed']) }),
  params: z.object({ id: objectId }), query: z.object({}),
});

export const assignSchema = z.object({
  body: z.object({ technicianId: objectId.nullable() }),
  params: z.object({ id: objectId }), query: z.object({}),
});

export const commentSchema = z.object({
  body: z.object({ content: z.string().trim().min(2).max(1000) }),
  params: z.object({ id: objectId }), query: z.object({}),
});

export const idSchema = z.object({
  body: z.object({}), params: z.object({ id: objectId }), query: z.object({}),
});

export const roleSchema = z.object({
  body: z.object({ role: z.enum(['employee', 'technician', 'admin']) }),
  params: z.object({ id: objectId }), query: z.object({}),
});

export const activeSchema = z.object({
  body: z.object({ isActive: z.boolean() }),
  params: z.object({ id: objectId }), query: z.object({}),
});
