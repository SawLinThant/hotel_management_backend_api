import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma/index.js';
import { config } from '../config/index.js';
const prisma = new PrismaClient();
function signAccessToken(userId, role) {
    return jwt.sign({ role }, config.jwt.accessTokenSecret, {
        subject: userId,
        expiresIn: config.jwt.accessTokenExpiresIn,
    });
}
function signRefreshToken(userId, role) {
    return jwt.sign({ role }, config.jwt.refreshTokenSecret, {
        subject: userId,
        expiresIn: config.jwt.refreshTokenExpiresIn,
    });
}
export async function registerGuest(payload) {
    const existing = await prisma.user.findUnique({ where: { email: payload.email }, select: { id: true } });
    if (existing) {
        throw new Error('Email already in use');
    }
    const password_hash = await bcrypt.hash(payload.password, 12);
    const user = await prisma.user.create({
        data: {
            first_name: payload.first_name,
            last_name: payload.last_name,
            email: payload.email,
            password_hash,
            phone: payload.phone || null,
            role: 'guest',
        },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
            is_active: true,
            created_at: true,
        },
    });
    const access_token = signAccessToken(user.id, 'guest');
    const refresh_token = signRefreshToken(user.id, 'guest');
    await prisma.refreshToken.create({
        data: {
            token: refresh_token,
            user_id: user.id,
            expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        },
    });
    return { user, access_token, refresh_token, token_type: 'Bearer', expires_in: 900 };
}
export async function registerStaff(payload) {
    if (!config.security.staffRegistrationKey || payload.registration_key !== config.security.staffRegistrationKey) {
        throw new Error('Invalid registration key');
    }
    const existing = await prisma.user.findUnique({ where: { email: payload.email }, select: { id: true } });
    if (existing) {
        throw new Error('Email already in use');
    }
    const password_hash = await bcrypt.hash(payload.password, 12);
    const user = await prisma.user.create({
        data: {
            first_name: payload.first_name,
            last_name: payload.last_name,
            email: payload.email,
            password_hash,
            phone: payload.phone || null,
            role: 'staff',
            email_verified: true,
        },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
            is_active: true,
            created_at: true,
        },
    });
    const access_token = signAccessToken(user.id, 'staff');
    const refresh_token = signRefreshToken(user.id, 'staff');
    await prisma.refreshToken.create({
        data: {
            token: refresh_token,
            user_id: user.id,
            expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        },
    });
    return { user, access_token, refresh_token, token_type: 'Bearer', expires_in: 900 };
}
export async function loginWithRole(payload) {
    const user = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { id: true, email: true, password_hash: true, role: true, is_active: true, first_name: true, last_name: true },
    });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    if (!user.is_active) {
        throw new Error('Account disabled');
    }
    if (user.role !== payload.role) {
        throw new Error('Invalid role');
    }
    const valid = await bcrypt.compare(payload.password, user.password_hash);
    if (!valid) {
        throw new Error('Invalid credentials');
    }
    const access_token = signAccessToken(user.id, user.role);
    const refresh_token = signRefreshToken(user.id, user.role);
    await prisma.refreshToken.create({
        data: { token: refresh_token, user_id: user.id, expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000) },
    });
    return {
        user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
        },
        access_token,
        refresh_token,
        token_type: 'Bearer',
        expires_in: 900,
    };
}
export async function refreshAccessToken(refreshToken) {
    // Find the refresh token in the database
    const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: {
            user: {
                select: {
                    id: true,
                    role: true,
                    is_active: true,
                },
            },
        },
    });
    if (!tokenRecord) {
        throw new Error('Invalid refresh token');
    }
    if (!tokenRecord.user.is_active) {
        throw new Error('Account disabled');
    }
    // Check if token is expired
    if (tokenRecord.expires_at < new Date()) {
        // Delete expired token
        await prisma.refreshToken.delete({
            where: { token: refreshToken },
        });
        throw new Error('Refresh token expired');
    }
    // Generate new access token
    const access_token = signAccessToken(tokenRecord.user.id, tokenRecord.user.role);
    return {
        access_token,
        token_type: 'Bearer',
        expires_in: 900,
    };
}
export async function logout(refreshToken) {
    try {
        // Delete the refresh token from database
        await prisma.refreshToken.delete({
            where: { token: refreshToken },
        });
        return { message: 'Logged out successfully' };
    }
    catch (error) {
        // Token might not exist, but we still consider it a successful logout
        return { message: 'Logged out successfully' };
    }
}
export async function logoutAllSessions(userId) {
    try {
        // Delete all refresh tokens for the user
        await prisma.refreshToken.deleteMany({
            where: { user_id: userId },
        });
        return { message: 'All sessions logged out successfully' };
    }
    catch (error) {
        throw new Error('Failed to logout all sessions');
    }
}
//# sourceMappingURL=authService.js.map