export declare function listUsers(params: any): Promise<{
    readonly users: {
        id: string;
        role: import("../../generated/prisma/index.js").$Enums.Role;
        email: string;
        first_name: string;
        last_name: string;
        is_active: boolean;
        created_at: Date;
    }[];
    readonly total: number;
    readonly page: any;
    readonly limit: number;
    readonly total_pages: number;
}>;
export declare function getUserById(id: string): Promise<{
    id: string;
    role: import("../../generated/prisma/index.js").$Enums.Role;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    created_at: Date;
}>;
export declare function createUser(payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role?: 'guest' | 'staff' | 'admin';
    phone?: string;
}): Promise<{
    id: string;
    role: import("../../generated/prisma/index.js").$Enums.Role;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    created_at: Date;
}>;
export declare function updateUser(id: string, payload: Partial<{
    first_name: string;
    last_name: string;
    role: 'guest' | 'staff' | 'admin';
    is_active: boolean;
    phone?: string;
}>): Promise<{
    id: string;
    role: import("../../generated/prisma/index.js").$Enums.Role;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    created_at: Date;
}>;
export declare function deleteUser(id: string): Promise<void>;
export declare function bulkUpdate(user_ids: string[], data: {
    is_active?: boolean;
    role?: 'guest' | 'staff' | 'admin';
}): Promise<void>;
export declare function bulkDelete(user_ids: string[]): Promise<void>;
export declare function userStats(): Promise<{
    readonly total_users: number;
    readonly admin_users: number;
    readonly staff_users: number;
    readonly guest_users: number;
    readonly active_users: number;
    readonly verified_users: number;
}>;
//# sourceMappingURL=userService.d.ts.map