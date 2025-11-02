export class ApiError extends Error {
    statusCode;
    details;
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}
export const BadRequest = (message = 'Bad request', details) => new ApiError(400, message, details);
export const Unauthorized = (message = 'Unauthorized') => new ApiError(401, message);
export const Forbidden = (message = 'Forbidden') => new ApiError(403, message);
export const NotFound = (message = 'Not found') => new ApiError(404, message);
export const Conflict = (message = 'Conflict') => new ApiError(409, message);
export const Unprocessable = (message = 'Unprocessable entity', details) => new ApiError(422, message, details);
export const TooManyRequests = (message = 'Too many requests') => new ApiError(429, message);
export const InternalError = (message = 'Internal server error', details) => new ApiError(500, message, details);
//# sourceMappingURL=errors.js.map