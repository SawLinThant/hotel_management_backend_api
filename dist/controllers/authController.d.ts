import type { Request, Response } from 'express';
export declare function registerGuestController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function registerStaffController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function loginGuestController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function loginStaffController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function registerController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function loginController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function refreshTokenController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function logoutController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function logoutAllSessionsController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map