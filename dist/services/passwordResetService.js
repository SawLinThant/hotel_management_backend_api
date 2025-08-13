import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '../../generated/prisma/index.js';
import { config } from '../config/index.js';
const prisma = new PrismaClient();
// Generate a secure random token
function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}
// Send password reset email (placeholder - you'll need to implement actual email sending)
async function sendPasswordResetEmail(email, resetToken, userName) {
    // TODO: Implement actual email sending logic
    // For now, we'll just log the reset link
    const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;
    console.log(`Password reset email sent to ${email}:`);
    console.log(`Reset link: ${resetLink}`);
    console.log(`Token: ${resetToken}`);
    // In production, you would use a service like:
    // - Nodemailer
    // - SendGrid
    // - AWS SES
    // - Resend
    // - etc.
}
export async function requestPasswordReset(email) {
    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            is_active: true,
        },
    });
    // Don't reveal if email exists or not for security
    if (!user || !user.is_active) {
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }
    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
        where: { user_id: user.id },
    });
    // Generate new reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    // Store reset token in database
    await prisma.passwordResetToken.create({
        data: {
            token: resetToken,
            user_id: user.id,
            expires_at: expiresAt,
        },
    });
    // Send password reset email
    try {
        await sendPasswordResetEmail(user.email, resetToken, `${user.first_name} ${user.last_name}`);
    }
    catch (error) {
        // If email sending fails, delete the token
        await prisma.passwordResetToken.delete({
            where: { token: resetToken },
        });
        throw new Error('Failed to send password reset email');
    }
    return { message: 'If an account with that email exists, a password reset link has been sent.' };
}
export async function validateResetToken(token) {
    // Find the reset token in database
    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    is_active: true,
                },
            },
        },
    });
    if (!resetToken) {
        return { valid: false };
    }
    // Check if token is expired
    if (resetToken.expires_at < new Date()) {
        // Delete expired token
        await prisma.passwordResetToken.delete({
            where: { token },
        });
        return { valid: false };
    }
    // Check if token has been consumed
    if (resetToken.consumed_at) {
        return { valid: false };
    }
    // Check if user is still active
    if (!resetToken.user.is_active) {
        return { valid: false };
    }
    return { valid: true, user: resetToken.user };
}
export async function resetPassword(token, newPassword) {
    // Validate the reset token
    const validation = await validateResetToken(token);
    if (!validation.valid || !validation.user) {
        throw new Error('Invalid or expired reset token');
    }
    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    // Update user's password
    await prisma.user.update({
        where: { id: validation.user.id },
        data: { password_hash: passwordHash },
    });
    // Mark the reset token as consumed
    await prisma.passwordResetToken.update({
        where: { token },
        data: { consumed_at: new Date() },
    });
    // Delete all refresh tokens for this user (force logout from all devices)
    await prisma.refreshToken.deleteMany({
        where: { user_id: validation.user.id },
    });
    return { message: 'Password has been reset successfully. Please log in with your new password.' };
}
export async function cleanupExpiredTokens() {
    // Delete expired reset tokens
    await prisma.passwordResetToken.deleteMany({
        where: {
            expires_at: {
                lt: new Date(),
            },
        },
    });
}
//# sourceMappingURL=passwordResetService.js.map