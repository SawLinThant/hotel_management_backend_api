import { z } from 'zod';
import { PrismaClient } from '../../generated/prisma/index.js';
const prisma = new PrismaClient();
export async function meController(req, res) {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, first_name: true, last_name: true, email: true, role: true, is_active: true, created_at: true } });
    return res.json(user);
}
export async function updateMeController(req, res) {
    const userId = req.user?.id;
    const body = z.object({
        first_name: z.string().min(1).optional(),
        last_name: z.string().min(1).optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        preferences: z.any().optional(),
        avatar_url: z.string().url().optional(),
    }).parse(req.body);
    const user = await prisma.user.update({ where: { id: userId }, data: body, select: { id: true, first_name: true, last_name: true, email: true, role: true, is_active: true, created_at: true } });
    return res.json(user);
}
export async function changePasswordController(_req, res) {
    return res.status(501).json({ message: 'Change password not implemented in this scope' });
}
export async function uploadAvatarController(req, res) {
    const userId = req.user?.id;
    const body = z.object({ avatar: z.any().optional() }).parse(req.body);
    // Stub: accept avatar and set an URL if provided
    const avatar_url = body?.avatar ? 'https://example.com/avatar.png' : undefined;
    if (avatar_url) {
        await prisma.user.update({ where: { id: userId }, data: { avatar_url } });
    }
    return res.json({ avatar_url: avatar_url ?? null });
}
export async function requestPasswordResetController(_req, res) {
    return res.status(202).json({ queued: false });
}
export async function confirmPasswordResetController(_req, res) {
    return res.status(501).json({ message: 'Password reset confirmation not implemented' });
}
export async function sendVerificationController(_req, res) {
    return res.status(202).json({ queued: false });
}
export async function verifyEmailController(_req, res) {
    return res.status(501).json({ message: 'Email verification not implemented' });
}
//# sourceMappingURL=profileController.js.map