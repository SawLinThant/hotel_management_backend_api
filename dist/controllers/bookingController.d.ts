import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
export declare function createBookingController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBookingByIdController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBookingsController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateBookingController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function cancelBookingController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteBookingController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBookingStatsController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=bookingController.d.ts.map