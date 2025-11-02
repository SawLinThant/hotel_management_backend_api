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
export declare function listBookings(params: any): Promise<{
    readonly bookings: {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import("../../generated/prisma/index.js").$Enums.BookingStatus;
        room_id: string;
        guest_id: string;
        check_in_date: Date;
        check_out_date: Date;
        guests: number;
        total_amount: import("../../generated/prisma/runtime/library.js").Decimal;
        paid_amount: import("../../generated/prisma/runtime/library.js").Decimal;
        special_requests: string | null;
    }[];
    readonly total: number;
    readonly page: any;
    readonly limit: number;
    readonly total_pages: number;
}>;
export declare function getBookingById(id: string, userRole?: Role, userId?: string): Promise<any>;
export declare function createBooking(dataOrPayload: CreateBookingData | {
    room_id: string;
    guest_id: string;
    check_in_date: Date;
    check_out_date: Date;
    guests: number;
    special_requests?: string;
}, userRole?: Role, userId?: string): Promise<any>;
export declare function getBookings(filters: BookingFilters | undefined, pagination: PaginationOptions | undefined, userRole: Role, userId: string): Promise<BookingListResponse>;
export declare function updateBooking(id: string, dataOrChanges: UpdateBookingData | Partial<{
    check_in_date: Date;
    check_out_date: Date;
    guests: number;
    status: any;
    special_requests?: string;
    paid_amount?: number;
}>, userRole?: Role, userId?: string): Promise<any>;
export declare function cancelBooking(id: string, reasonOrRole?: string | Role, userId?: string): Promise<{
    id?: string;
    status?: string;
    message?: string;
}>;
export declare function checkIn(booking_id: string, notes?: string, at?: Date): Promise<{
    readonly success: true;
}>;
export declare function checkOut(booking_id: string, data: {
    notes?: string;
    at?: Date;
    additional_charges?: Array<{
        description: string;
        amount: number;
    }>;
}): Promise<{
    readonly success: true;
}>;
export declare function stats(date_from?: Date, date_to?: Date): Promise<{
    readonly total_bookings: number;
    readonly pending_bookings: number;
    readonly confirmed_bookings: number;
    readonly checked_in_bookings: number;
    readonly checked_out_bookings: number;
    readonly cancelled_bookings: number;
    readonly total_revenue: number;
    readonly average_booking_value: number;
    readonly occupancy_rate: 0;
}>;
export declare function arrivals(date?: Date): Promise<{
    id: string;
    status: import("../../generated/prisma/index.js").$Enums.BookingStatus;
    room_id: string;
    guest_id: string;
    check_in_date: Date;
}[]>;
export declare function departures(date?: Date): Promise<{
    id: string;
    status: import("../../generated/prisma/index.js").$Enums.BookingStatus;
    room_id: string;
    guest_id: string;
    check_out_date: Date;
}[]>;
export declare function deleteBooking(id: string, userRole: Role): Promise<{
    message: string;
}>;
export declare function getBookingStats(userRole: Role, userId: string): Promise<any>;
//# sourceMappingURL=bookingService.d.ts.map