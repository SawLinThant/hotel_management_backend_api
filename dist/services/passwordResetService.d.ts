export declare function requestPasswordReset(email: string): Promise<{
    message: string;
}>;
export declare function validateResetToken(token: string): Promise<{
    valid: boolean;
    user?: any;
}>;
export declare function resetPassword(token: string, newPassword: string): Promise<{
    message: string;
}>;
export declare function cleanupExpiredTokens(): Promise<void>;
//# sourceMappingURL=passwordResetService.d.ts.map