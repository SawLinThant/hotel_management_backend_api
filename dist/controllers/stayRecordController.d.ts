import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
export declare function createStayRecordController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getStayRecordByIdController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getStayRecordsController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateStayRecordController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function checkOutGuestController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteStayRecordController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getStayRecordStatsController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=stayRecordController.d.ts.map