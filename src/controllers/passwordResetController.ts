import type { Request, Response } from 'express';
import { z } from 'zod';
import { 
	requestPasswordReset, 
	validateResetToken, 
	resetPassword 
} from '../services/passwordResetService.js';

// Schema for requesting password reset
const requestResetSchema = z.object({
	email: z.string().email(),
});

// Schema for validating reset token
const validateTokenSchema = z.object({
	token: z.string().min(1),
});

// Schema for resetting password
const resetPasswordSchema = z.object({
	token: z.string().min(1),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
	confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"],
});

export async function requestPasswordResetController(req: Request, res: Response) {
	try {
		const payload = requestResetSchema.parse(req.body);
		
		const result = await requestPasswordReset(payload.email);
		
		return res.status(200).json(result);
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({ 
				message: 'Invalid email format',
				errors: err.errors 
			});
		}
		
		console.error('Password reset request error:', err);
		return res.status(500).json({ 
			message: 'Failed to process password reset request' 
		});
	}
}

export async function validateResetTokenController(req: Request, res: Response) {
	try {
		const payload = validateTokenSchema.parse(req.body);
		
		const result = await validateResetToken(payload.token);
		
		if (!result.valid) {
			return res.status(400).json({ 
				message: 'Invalid or expired reset token' 
			});
		}
		
		return res.status(200).json({ 
			message: 'Token is valid',
			user: {
				email: result.user?.email,
				first_name: result.user?.first_name,
				last_name: result.user?.last_name,
			}
		});
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({ 
				message: 'Invalid token format',
				errors: err.errors 
			});
		}
		
		console.error('Token validation error:', err);
		return res.status(500).json({ 
			message: 'Failed to validate reset token' 
		});
	}
}

export async function resetPasswordController(req: Request, res: Response) {
	try {
		const payload = resetPasswordSchema.parse(req.body);
		
		const result = await resetPassword(payload.token, payload.password);
		
		return res.status(200).json(result);
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({ 
				message: 'Invalid input data',
				errors: err.errors 
			});
		}
		
		if (err.message === 'Invalid or expired reset token') {
			return res.status(400).json({ 
				message: err.message 
			});
		}
		
		console.error('Password reset error:', err);
		return res.status(500).json({ 
			message: 'Failed to reset password' 
		});
	}
}
