import { z } from 'zod';
import { loginWithRole, registerGuest, registerStaff, refreshAccessToken, logout, logoutAllSessions } from '../services/authService.js';
const registerGuestSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
});
const registerStaffSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    registration_key: z.string().min(1),
    phone: z.string().optional(),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});
export async function registerGuestController(req, res) {
    const payload = registerGuestSchema.parse(req.body);
    try {
        const result = await registerGuest({
            ...payload,
            phone: payload.phone || undefined
        });
        return res.status(201).json(result);
    }
    catch (err) {
        return res.status(400).json({ message: err.message || 'Registration failed' });
    }
}
export async function registerStaffController(req, res) {
    const payload = registerStaffSchema.parse(req.body);
    try {
        const result = await registerStaff({
            ...payload,
            phone: payload.phone || undefined
        });
        return res.status(201).json(result);
    }
    catch (err) {
        return res.status(400).json({ message: err.message || 'Registration failed' });
    }
}
export async function loginGuestController(req, res) {
    const payload = loginSchema.parse(req.body);
    try {
        const result = await loginWithRole({ ...payload, role: 'guest' });
        return res.status(200).json(result);
    }
    catch (err) {
        return res.status(401).json({ message: err.message || 'Login failed' });
    }
}
export async function loginStaffController(req, res) {
    const payload = loginSchema.parse(req.body);
    try {
        const result = await loginWithRole({ ...payload, role: 'staff' });
        return res.status(200).json(result);
    }
    catch (err) {
        return res.status(401).json({ message: err.message || 'Login failed' });
    }
}
// Generic endpoints (backward compatibility): default to guest; allow role override
const genericRegisterSchema = z.object({
    role: z.enum(['guest', 'staff']).optional().default('guest'),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
    registration_key: z.string().optional(),
});
export async function registerController(req, res) {
    const payload = genericRegisterSchema.parse(req.body);
    try {
        if (payload.role === 'staff') {
            const result = await registerStaff({
                first_name: payload.first_name,
                last_name: payload.last_name,
                email: payload.email,
                password: payload.password,
                registration_key: payload.registration_key || '',
                phone: payload.phone || undefined,
            });
            return res.status(201).json(result);
        }
        const result = await registerGuest({
            first_name: payload.first_name,
            last_name: payload.last_name,
            email: payload.email,
            password: payload.password,
            phone: payload.phone || undefined,
        });
        return res.status(201).json(result);
    }
    catch (err) {
        return res.status(400).json({ message: err.message || 'Registration failed' });
    }
}
const genericLoginSchema = z.object({
    role: z.enum(['guest', 'staff']).optional().default('guest'),
    email: z.string().email(),
    password: z.string().min(8),
});
export async function loginController(req, res) {
    const payload = genericLoginSchema.parse(req.body);
    try {
        const result = await loginWithRole({ email: payload.email, password: payload.password, role: payload.role });
        return res.status(200).json(result);
    }
    catch (err) {
        return res.status(401).json({ message: err.message || 'Login failed' });
    }
}
// Refresh token schema
const refreshTokenSchema = z.object({
    refresh_token: z.string().min(1),
});
// Logout schema
const logoutSchema = z.object({
    refresh_token: z.string().min(1),
});
export async function refreshTokenController(req, res) {
    const payload = refreshTokenSchema.parse(req.body);
    try {
        const result = await refreshAccessToken(payload.refresh_token);
        return res.status(200).json(result);
    }
    catch (err) {
        return res.status(401).json({ message: err.message || 'Token refresh failed' });
    }
}
export async function logoutController(req, res) {
    const payload = logoutSchema.parse(req.body);
    try {
        const result = await logout(payload.refresh_token);
        return res.status(200).json(result);
    }
    catch (err) {
        return res.status(400).json({ message: err.message || 'Logout failed' });
    }
}
export async function logoutAllSessionsController(req, res) {
    try {
        // This endpoint requires authentication, so we'll get user ID from the authenticated request
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const result = await logoutAllSessions(userId);
        return res.status(200).json(result);
    }
    catch (err) {
        return res.status(400).json({ message: err.message || 'Logout all sessions failed' });
    }
}
//# sourceMappingURL=authController.js.map