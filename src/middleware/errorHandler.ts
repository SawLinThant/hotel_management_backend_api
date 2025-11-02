import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error('API %s %s -> %d %s', req.method, req.originalUrl, err.statusCode, err.message);
    }
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  logger.error('API %s %s -> 500 %s', req.method, req.originalUrl, message);
  return res.status(500).json({ message: 'Internal server error' });
}


