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
export declare function createRoom(data: CreateRoomData): Promise<any>;
export declare function getRoomById(id: string): Promise<any>;
export declare function getRooms(filters?: RoomFilters, pagination?: PaginationOptions): Promise<RoomListResponse>;
export declare function updateRoom(id: string, data: UpdateRoomData): Promise<any>;
export declare function deleteRoom(id: string): Promise<{
    message: string;
}>;
export declare function getRoomStats(): Promise<any>;
//# sourceMappingURL=roomService.d.ts.map