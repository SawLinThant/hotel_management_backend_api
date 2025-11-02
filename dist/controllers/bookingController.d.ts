import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
export declare function createBookingController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBookingByIdController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBookingsController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateBookingController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function cancelBookingController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteBookingController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBookingStatsController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function checkInController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function checkOutController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function statsController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function arrivalsController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function departuresController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function sendConfirmationController(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function paymentController(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function invoiceController(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=bookingController.d.ts.map