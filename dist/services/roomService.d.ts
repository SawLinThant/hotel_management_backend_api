import { RoomType, RoomStatus } from '../../generated/prisma/index.js';
export interface CreateRoomData {
    room_number: string;
    type: RoomType;
    capacity: number;
    price_per_night: number;
    description?: string;
    amenities: Record<string, any>;
    images?: string[];
    floor?: number;
    size_sqm?: number;
}
export interface UpdateRoomData {
    room_number?: string;
    type?: RoomType;
    status?: RoomStatus;
    capacity?: number;
    price_per_night?: number;
    description?: string;
    amenities?: Record<string, any>;
    images?: string[];
    floor?: number;
    size_sqm?: number;
}
export interface RoomFilters {
    status?: RoomStatus;
    capacity?: number;
    floor?: number;
    price_per_night_min?: number;
    price_per_night_max?: number;
    type?: RoomType;
    search?: string;
}
export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: 'price_per_night' | 'capacity' | 'floor' | 'created_at';
    sortOrder?: 'asc' | 'desc';
}
export interface RoomListResponse {
    rooms: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare function listRooms(params: {
    page?: number;
    limit?: number;
    type?: 'single' | 'double' | 'suite' | 'deluxe';
    status?: 'available' | 'occupied' | 'maintenance' | 'cleaning';
    min_price?: number;
    max_price?: number;
    min_capacity?: number;
    max_capacity?: number;
    amenities?: string[];
    floor?: number;
    available_from?: Date;
    available_to?: Date;
    sort_by?: 'price' | 'capacity' | 'room_number' | 'created_at';
    sort_order?: 'asc' | 'desc';
}): Promise<{
    readonly rooms: {
        id: string;
        created_at: Date;
        updated_at: Date;
        type: import("../../generated/prisma/index.js").$Enums.RoomType;
        status: import("../../generated/prisma/index.js").$Enums.RoomStatus;
        images: import("../../generated/prisma/runtime/library.js").JsonValue;
        price_per_night: import("../../generated/prisma/runtime/library.js").Decimal;
        capacity: number;
        floor: number | null;
        room_number: string;
        description: string | null;
        amenities: import("../../generated/prisma/runtime/library.js").JsonValue;
        size_sqm: import("../../generated/prisma/runtime/library.js").Decimal | null;
    }[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly total_pages: number;
}>;
export declare function getRoomById(id: string): Promise<any>;
export declare function getRooms(filters?: RoomFilters, pagination?: PaginationOptions): Promise<RoomListResponse>;
export declare function createRoom(data: CreateRoomData): Promise<any>;
export declare function updateRoom(id: string, data: UpdateRoomData): Promise<any>;
export declare function deleteRoom(id: string): Promise<{
    message: string;
}>;
export declare function bulkUpdateStatus(roomIds: string[], status: 'available' | 'occupied' | 'maintenance' | 'cleaning'): Promise<void>;
export declare function checkAvailability(params: {
    check_in_date: Date;
    check_out_date: Date;
    guests?: number;
    room_type?: 'single' | 'double' | 'suite' | 'deluxe';
}): Promise<{
    room_id: string;
    available: boolean;
    price_per_night: number;
    total_price: number;
    nights: number;
}[]>;
export declare function getRoomStats(): Promise<any>;
//# sourceMappingURL=roomService.d.ts.map