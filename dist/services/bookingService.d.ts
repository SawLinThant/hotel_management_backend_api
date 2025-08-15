import { BookingStatus, Role } from '../../generated/prisma/index.js';
export interface CreateBookingData {
    room_id: string;
    guest_id: string;
    check_in_date: Date;
    check_out_date: Date;
    guests: number;
    special_requests?: string;
}
export interface UpdateBookingData {
    check_in_date?: Date;
    check_out_date?: Date;
    guests?: number;
    status?: BookingStatus;
    special_requests?: string;
    total_amount?: number;
}
export interface BookingFilters {
    status?: BookingStatus;
    guest_id?: string;
    room_id?: string;
    check_in_date_from?: Date;
    check_in_date_to?: Date;
    check_out_date_from?: Date;
    check_out_date_to?: Date;
    guests?: number;
}
export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: 'check_in_date' | 'check_out_date' | 'total_amount' | 'created_at';
    sortOrder?: 'asc' | 'desc';
}
export interface BookingListResponse {
    bookings: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare function checkRoomAvailability(room_id: string, check_in_date: Date, check_out_date: Date, exclude_booking_id?: string): Promise<boolean>;
export declare function createBooking(data: CreateBookingData, userRole: Role, userId: string): Promise<any>;
export declare function getBookingById(id: string, userRole: Role, userId: string): Promise<any>;
export declare function getBookings(filters: BookingFilters | undefined, pagination: PaginationOptions | undefined, userRole: Role, userId: string): Promise<BookingListResponse>;
export declare function updateBooking(id: string, data: UpdateBookingData, userRole: Role, userId: string): Promise<any>;
export declare function cancelBooking(id: string, userRole: Role, userId: string): Promise<{
    message: string;
}>;
export declare function deleteBooking(id: string, userRole: Role): Promise<{
    message: string;
}>;
export declare function getBookingStats(userRole: Role, userId: string): Promise<any>;
//# sourceMappingURL=bookingService.d.ts.map