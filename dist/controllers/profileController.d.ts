import type { Request, Response } from 'express';
export declare function meController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateMeController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function changePasswordController(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function uploadAvatarController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function requestPasswordResetController(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function confirmPasswordResetController(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function sendVerificationController(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function verifyEmailController(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=profileController.d.ts.map