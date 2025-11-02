import { z } from 'zod';
import { userAdminCreateSchema, userAdminUpdateSchema, paginationSchema } from './validators.js';
import { listUsers, getUserById, createUser, updateUser, deleteUser, bulkUpdate, bulkDelete, userStats } from '../services/userService.js';
export async function getUsersController(req, res) {
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
export async function getUserController(req, res) {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    const user = await getUserById(id);
    return res.json(user);
}
export async function createUserController(req, res) {
    const payload = userAdminCreateSchema.parse(req.body);
    const user = await createUser(payload);
    return res.status(201).json(user);
}
export async function updateUserController(req, res) {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    const payload = userAdminUpdateSchema.parse(req.body);
    const user = await updateUser(id, payload);
    return res.json(user);
}
export async function deleteUserController(req, res) {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    await deleteUser(id);
    return res.status(204).send();
}
export async function bulkUpdateUsersController(req, res) {
    const body = z.object({ user_ids: z.array(z.string().min(1)), is_active: z.boolean().optional(), role: z.enum(['guest', 'staff', 'admin']).optional() }).parse(req.body);
    await bulkUpdate(body.user_ids, { is_active: body.is_active, role: body.role });
    return res.status(204).send();
}
export async function bulkDeleteUsersController(req, res) {
    const body = z.object({ user_ids: z.array(z.string().min(1)) }).parse(req.body);
    await bulkDelete(body.user_ids);
    return res.status(204).send();
}
export async function userStatsController(_req, res) {
    const s = await userStats();
    return res.json(s);
}
//# sourceMappingURL=userController.js.map