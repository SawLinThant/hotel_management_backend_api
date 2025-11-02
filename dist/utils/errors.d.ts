export declare class ApiError extends Error {
    statusCode: number;
    details?: unknown;
    constructor(statusCode: number, message: string, details?: unknown);
}
export declare const BadRequest: (message?: string, details?: unknown) => ApiError;
export declare const Unauthorized: (message?: string) => ApiError;
export declare const Forbidden: (message?: string) => ApiError;
export declare const NotFound: (message?: string) => ApiError;
export declare const Conflict: (message?: string) => ApiError;
export declare const Unprocessable: (message?: string, details?: unknown) => ApiError;
export declare const TooManyRequests: (message?: string) => ApiError;
export declare const InternalError: (message?: string, details?: unknown) => ApiError;
//# sourceMappingURL=errors.d.ts.map