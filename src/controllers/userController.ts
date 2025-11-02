import type { Request, Response } from 'express';
import { z } from 'zod';
import { userAdminCreateSchema, userAdminUpdateSchema, paginationSchema } from './validators.js';
import { listUsers, getUserById, createUser, updateUser, deleteUser, bulkUpdate, bulkDelete, userStats } from '../services/userService.js';

export async function getUsersController(req: Request, res: Response) {
  const q = paginationSchema.extend({
    role: z.enum(['guest', 'staff', 'admin']).optional(),
    is_active: z.coerce.boolean().optional(),
    email_verified: z.coerce.boolean().optional(),
    created_from: z.coerce.date().optional(),
    created_to: z.coerce.date().optional(),
    search: z.string().optional(),
  }).parse(req.query);
  const data = await listUsers(q);
  return res.json(data);
}

export async function getUserController(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  const user = await getUserById(id);
  return res.json(user);
}

export async function createUserController(req: Request, res: Response) {
  const payload = userAdminCreateSchema.parse(req.body);
  const user = await createUser(payload);
  return res.status(201).json(user);
}

export async function updateUserController(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  const payload = userAdminUpdateSchema.parse(req.body);
  const user = await updateUser(id, payload);
  return res.json(user);
}

export async function deleteUserController(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  await deleteUser(id);
  return res.status(204).send();
}

export async function bulkUpdateUsersController(req: Request, res: Response) {
  const body = z.object({ user_ids: z.array(z.string().min(1)), is_active: z.boolean().optional(), role: z.enum(['guest', 'staff', 'admin']).optional() }).parse(req.body);
  await bulkUpdate(body.user_ids, { is_active: body.is_active, role: body.role });
  return res.status(204).send();
}

export async function bulkDeleteUsersController(req: Request, res: Response) {
  const body = z.object({ user_ids: z.array(z.string().min(1)) }).parse(req.body);
  await bulkDelete(body.user_ids);
  return res.status(204).send();
}

export async function userStatsController(_req: Request, res: Response) {
  const s = await userStats();
  return res.json(s);
}


