import { z } from 'zod';
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sort_by: z.string().optional(),
    sort_order: z.enum(['asc', 'desc']).optional(),
});
export const roomCreateSchema = z.object({
    room_number: z.string().min(1),
    type: z.enum(['single', 'double', 'suite', 'deluxe']),
    capacity: z.number().int().min(1),
    price_per_night: z.number().nonnegative(),
    description: z.string().optional(),
    amenities: z.array(z.string()).default([]),
    images: z.array(z.string().url()).optional(),
    floor: z.number().int().optional(),
    size_sqm: z.number().positive().optional(),
});
export const roomUpdateSchema = roomCreateSchema.partial().extend({
    status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).optional(),
});
export const roomAvailabilityQuerySchema = z.object({
    check_in_date: z.coerce.date(),
    check_out_date: z.coerce.date(),
    guests: z.coerce.number().int().min(1).optional(),
    room_type: z.enum(['single', 'double', 'suite', 'deluxe']).optional(),
});
export const bookingCreateSchema = z.object({
    room_id: z.string().min(1),
    check_in_date: z.coerce.date(),
    check_out_date: z.coerce.date(),
    guests: z.number().int().min(1),
    guest_info: z.object({
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(3).optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        date_of_birth: z.string().optional(),
        nationality: z.string().optional(),
        passport_number: z.string().optional(),
        id_card_number: z.string().optional(),
    }),
    special_requests: z.string().optional(),
    payment_method: z.enum(['cash', 'card', 'online', 'bank_transfer']).optional(),
});
export const bookingUpdateSchema = z.object({
    check_in_date: z.coerce.date().optional(),
    check_out_date: z.coerce.date().optional(),
    guests: z.number().int().min(1).optional(),
    status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']).optional(),
    special_requests: z.string().optional(),
    paid_amount: z.number().nonnegative().optional(),
});
export const checkInSchema = z.object({
    booking_id: z.string().min(1),
    notes: z.string().optional(),
    actual_check_in_time: z.coerce.date().optional(),
});
export const checkOutSchema = z.object({
    booking_id: z.string().min(1),
    notes: z.string().optional(),
    actual_check_out_time: z.coerce.date().optional(),
    additional_charges: z.array(z.object({ description: z.string(), amount: z.number().nonnegative() })).optional(),
});
export const userAdminCreateSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['guest', 'staff', 'admin']).optional(),
    phone: z.string().optional(),
});
export const userAdminUpdateSchema = z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    role: z.enum(['guest', 'staff', 'admin']).optional(),
    is_active: z.boolean().optional(),
    phone: z.string().optional(),
});
//# sourceMappingURL=validators.js.map