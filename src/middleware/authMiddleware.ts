import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		role: 'admin' | 'staff' | 'guest';
	};
	headers: Request['headers']; // Explicitly include headers property
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const token = authHeader.split(' ')[1];
	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	try {
		const decoded = jwt.verify(token, config.jwt.accessTokenSecret) as jwt.JwtPayload & { sub: string; role: 'admin' | 'staff' | 'guest' };
		if (!decoded.sub || !decoded.role) {
			return res.status(401).json({ message: 'Invalid token' });
		}
		req.user = { id: decoded.sub, role: decoded.role };
		return next();
	} catch {
		return res.status(401).json({ message: 'Invalid token' });
	}
};

export const requireRoles = (roles: Array<'admin' | 'staff' | 'guest'>) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		next();
	};
};


