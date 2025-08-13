type Role = 'admin' | 'staff' | 'guest';
export declare function registerGuest(payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone?: string;
}): Promise<{
    readonly user: {
        id: string;
        role: import("../../generated/prisma/index.js").$Enums.Role;
        email: string;
        first_name: string;
        last_name: string;
        is_active: boolean;
        created_at: Date;
    };
    readonly access_token: string;
    readonly refresh_token: string;
    readonly token_type: "Bearer";
    readonly expires_in: 900;
}>;
export declare function registerStaff(payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    registration_key: string;
    phone?: string;
}): Promise<{
    readonly user: {
        id: string;
        role: import("../../generated/prisma/index.js").$Enums.Role;
        email: string;
        first_name: string;
        last_name: string;
        is_active: boolean;
        created_at: Date;
    };
    readonly access_token: string;
    readonly refresh_token: string;
    readonly token_type: "Bearer";
    readonly expires_in: 900;
}>;
export declare function loginWithRole(payload: {
    email: string;
    password: string;
    role: Role;
}): Promise<{
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        role: import("../../generated/prisma/index.js").$Enums.Role;
    };
    access_token: string;
    refresh_token: string;
    token_type: "Bearer";
    expires_in: number;
}>;
export declare function refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
}>;
export declare function logout(refreshToken: string): Promise<{
    message: string;
}>;
export declare function logoutAllSessions(userId: string): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=authService.d.ts.map