import { Role } from '../../generated/prisma/index.js';
export interface CreateStayRecordData {
    booking_id: string;
    check_in_time?: Date;
    check_out_time?: Date;
    notes?: string;
    room_condition?: string;
    amenities_used?: string[];
    incidents?: string[];
}
export interface UpdateStayRecordData {
    check_in_time?: Date;
    check_out_time?: Date;
    notes?: string;
    room_condition?: string;
    amenities_used?: string[];
    incidents?: string[];
}
export interface StayRecordFilters {
    booking_id?: string;
    guest_id?: string;
    room_id?: string;
    check_in_date_from?: Date;
    check_in_date_to?: Date;
    check_out_date_from?: Date;
    check_out_date_to?: Date;
    has_incidents?: boolean;
}
export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: 'check_in_time' | 'check_out_time' | 'created_at';
    sortOrder?: 'asc' | 'desc';
}
export interface StayRecordListResponse {
    stayRecords: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare function createStayRecord(data: CreateStayRecordData, userRole: Role, userId: string): Promise<any>;
export declare function getStayRecordById(id: string, userRole: Role, userId: string): Promise<any>;
export declare function getStayRecords(filters: StayRecordFilters | undefined, pagination: PaginationOptions | undefined, userRole: Role, userId: string): Promise<StayRecordListResponse>;
export declare function updateStayRecord(id: string, data: UpdateStayRecordData, userRole: Role, userId: string): Promise<any>;
export declare function checkOutGuest(id: string, userRole: Role, userId: string, checkOutData?: {
    check_out_time?: Date;
    notes?: string;
    room_condition?: string;
    incidents?: string[];
}): Promise<any>;
export declare function deleteStayRecord(id: string, userRole: Role): Promise<{
    message: string;
}>;
export declare function getStayRecordStats(userRole: Role, userId: string): Promise<any>;
//# sourceMappingURL=stayRecordService.d.ts.map