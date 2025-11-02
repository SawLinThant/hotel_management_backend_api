import { PrismaClient } from '../../generated/prisma/index.js';
import bcrypt from 'bcryptjs';
import { BadRequest, Conflict, NotFound } from '../utils/errors.js';

const prisma = new PrismaClient();

export async function listUsers(params: any) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 10, 100);
  const skip = (page - 1) * limit;
  const where: any = {};
  if (params.role) where.role = params.role;
  if (typeof params.is_active === 'boolean') where.is_active = params.is_active;
  if (typeof params.email_verified === 'boolean') where.email_verified = params.email_verified;
  if (params.created_from || params.created_to) {
    where.created_at = {};
    if (params.created_from) where.created_at.gte = params.created_from;
    if (params.created_to) where.created_at.lte = params.created_to;
  }
  if (params.search) {
    where.OR = [
      { first_name: { contains: params.search, mode: 'insensitive' } },
      { last_name: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: { id: true, first_name: true, last_name: true, email: true, role: true, is_active: true, created_at: true },
    }),
    prisma.user.count({ where }),
  ]);
  return { users, total, page, limit, total_pages: Math.ceil(total / limit) } as const;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, first_name: true, last_name: true, email: true, role: true, is_active: true, created_at: true } });
  if (!user) throw NotFound('User not found');
  return user;
}

export async function createUser(payload: { first_name: string; last_name: string; email: string; password: string; role?: 'guest' | 'staff' | 'admin'; phone?: string }) {
  const existing = await prisma.user.findUnique({ where: { email: payload.email }, select: { id: true } });
  if (existing) throw Conflict('Email already in use');
  const password_hash = await bcrypt.hash(payload.password, 12);
  const user = await prisma.user.create({
    data: {
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      password_hash,
      role: payload.role ?? 'guest',
      phone: payload.phone,
    },
    select: { id: true, first_name: true, last_name: true, email: true, role: true, is_active: true, created_at: true },
  });
  return user;
}

export async function updateUser(id: string, payload: Partial<{ first_name: string; last_name: string; role: 'guest' | 'staff' | 'admin'; is_active: boolean; phone?: string }>) {
  const user = await prisma.user.update({ where: { id }, data: payload, select: { id: true, first_name: true, last_name: true, email: true, role: true, is_active: true, created_at: true } });
  return user;
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
}

export async function bulkUpdate(user_ids: string[], data: { is_active?: boolean; role?: 'guest' | 'staff' | 'admin' }) {
  await prisma.user.updateMany({ where: { id: { in: user_ids } }, data });
}

export async function bulkDelete(user_ids: string[]) {
  await prisma.user.deleteMany({ where: { id: { in: user_ids } } });
}

export async function userStats() {
  const [total_users, admin_users, staff_users, guest_users, active_users, verified_users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.count({ where: { role: 'staff' } }),
    prisma.user.count({ where: { role: 'guest' } }),
    prisma.user.count({ where: { is_active: true } }),
    prisma.user.count({ where: { email_verified: true as any } }),
  ]);
  return { total_users, admin_users, staff_users, guest_users, active_users, verified_users } as const;
}


