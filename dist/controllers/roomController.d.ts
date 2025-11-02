import type { Request, Response } from 'express';
export declare function getRoomsController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getRoomController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare const getRoomByIdController: typeof getRoomController;
export declare function createRoomController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateRoomController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteRoomController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function checkAvailabilityController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function bulkUpdateStatusController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function uploadImagesController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteImageController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getRoomStatsController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=roomController.d.ts.map