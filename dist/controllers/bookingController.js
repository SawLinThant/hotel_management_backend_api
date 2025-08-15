import { z } from 'zod';
import { createBooking, getBookingById, getBookings, updateBooking, cancelBooking, deleteBooking, getBookingStats, } from '../services/bookingService.js';
// Validation schemas
const createBookingSchema = z.object({
    room_id: z.string().min(1, 'Room ID is required'),
    guest_id: z.string().min(1, 'Guest ID is required'),
    check_in_date: z.string().datetime('Invalid check-in date format'),
    check_out_date: z.string().datetime('Invalid check-out date format'),
    guests: z.number().int().min(1, 'At least 1 guest required').max(10, 'Maximum 10 guests allowed'),
    special_requests: z.string().optional(),
});
const updateBookingSchema = z.object({
    check_in_date: z.string().datetime('Invalid check-in date format').optional(),
    check_out_date: z.string().datetime('Invalid check-out date format').optional(),
    guests: z.number().int().min(1, 'At least 1 guest required').max(10, 'Maximum 10 guests allowed').optional(),
    status: z.enum(['pending', 'confirmed', 'checked_in', 'completed', 'cancelled']).optional(),
    special_requests: z.string().optional(),
});
const bookingFiltersSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'checked_in', 'completed', 'cancelled']).optional(),
    guest_id: z.string().min(1).optional(),
    room_id: z.string().min(1).optional(),
    check_in_date_from: z.string().datetime('Invalid date format').optional(),
    check_in_date_to: z.string().datetime('Invalid date format').optional(),
    check_out_date_from: z.string().datetime('Invalid date format').optional(),
    check_out_date_to: z.string().datetime('Invalid date format').optional(),
    guests: z.coerce.number().int().min(1).max(10).optional(),
});
const paginationSchema = z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').optional(),
    limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
    sortBy: z.enum(['check_in_date', 'check_out_date', 'total_amount', 'created_at']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});
// Create booking
export async function createBookingController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const payload = createBookingSchema.parse(req.body);
        const bookingData = {
            room_id: payload.room_id,
            guest_id: payload.guest_id,
            check_in_date: new Date(payload.check_in_date),
            check_out_date: new Date(payload.check_out_date),
            guests: payload.guests,
            special_requests: payload.special_requests,
        };
        const booking = await createBooking(bookingData, req.user.role, req.user.id);
        return res.status(201).json({
            message: 'Booking created successfully',
            booking,
        });
    }
    catch (err) {
        if (err.name === 'ZodError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: err.errors,
            });
        }
        if (err.message.includes('Room is not available')) {
            return res.status(409).json({
                message: err.message,
            });
        }
        if (err.message.includes('Room not found')) {
            return res.status(404).json({
                message: err.message,
            });
        }
        console.error('Create booking error:', err);
        return res.status(500).json({
            message: 'Failed to create booking',
        });
    }
}
// Get booking by ID
export async function getBookingByIdController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: 'Booking ID is required',
            });
        }
        const booking = await getBookingById(id, req.user.role, req.user.id);
        return res.status(200).json({
            booking,
        });
    }
    catch (err) {
        if (err.message === 'Booking not found') {
            return res.status(404).json({
                message: err.message,
            });
        }
        if (err.message === 'Access denied') {
            return res.status(403).json({
                message: err.message,
            });
        }
        console.error('Get booking by ID error:', err);
        return res.status(500).json({
            message: 'Failed to get booking',
        });
    }
}
// Get bookings with filtering and pagination
export async function getBookingsController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Parse query parameters
        const filters = bookingFiltersSchema.parse(req.query);
        const pagination = paginationSchema.parse(req.query);
        // Build strongly-typed filters
        const processedFilters = {};
        if (filters.status)
            processedFilters.status = filters.status;
        if (filters.guest_id)
            processedFilters.guest_id = filters.guest_id;
        if (filters.room_id)
            processedFilters.room_id = filters.room_id;
        if (typeof filters.guests === 'number')
            processedFilters.guests = filters.guests;
        if (filters.check_in_date_from)
            processedFilters.check_in_date_from = new Date(filters.check_in_date_from);
        if (filters.check_in_date_to)
            processedFilters.check_in_date_to = new Date(filters.check_in_date_to);
        if (filters.check_out_date_from)
            processedFilters.check_out_date_from = new Date(filters.check_out_date_from);
        if (filters.check_out_date_to)
            processedFilters.check_out_date_to = new Date(filters.check_out_date_to);
        // Set reasonable defaults for pagination
        const finalPagination = {
            page: pagination.page || 1,
            limit: Math.min(pagination.limit || 10, 100), // Cap at 100
            sortBy: pagination.sortBy || 'created_at',
            sortOrder: pagination.sortOrder || 'desc',
        };
        const result = await getBookings(processedFilters, finalPagination, req.user.role, req.user.id);
        return res.status(200).json({
            message: 'Bookings retrieved successfully',
            ...result,
        });
    }
    catch (err) {
        if (err.name === 'ZodError') {
            return res.status(400).json({
                message: 'Invalid query parameters',
                errors: err.errors,
            });
        }
        console.error('Get bookings error:', err);
        return res.status(500).json({
            message: 'Failed to get bookings',
        });
    }
}
// Update booking
export async function updateBookingController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: 'Booking ID is required',
            });
        }
        const payload = updateBookingSchema.parse(req.body);
        // Build strongly-typed update payload
        const updateData = {};
        if (payload.check_in_date)
            updateData.check_in_date = new Date(payload.check_in_date);
        if (payload.check_out_date)
            updateData.check_out_date = new Date(payload.check_out_date);
        if (typeof payload.guests === 'number')
            updateData.guests = payload.guests;
        if (payload.status)
            updateData.status = payload.status;
        if (typeof payload.special_requests === 'string')
            updateData.special_requests = payload.special_requests;
        const booking = await updateBooking(id, updateData, req.user.role, req.user.id);
        return res.status(200).json({
            message: 'Booking updated successfully',
            booking,
        });
    }
    catch (err) {
        if (err.name === 'ZodError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: err.errors,
            });
        }
        if (err.message === 'Booking not found') {
            return res.status(404).json({
                message: err.message,
            });
        }
        if (err.message === 'Access denied') {
            return res.status(403).json({
                message: err.message,
            });
        }
        if (err.message.includes('Room is not available')) {
            return res.status(409).json({
                message: err.message,
            });
        }
        console.error('Update booking error:', err);
        return res.status(500).json({
            message: 'Failed to update booking',
        });
    }
}
// Cancel booking
export async function cancelBookingController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: 'Booking ID is required',
            });
        }
        const result = await cancelBooking(id, req.user.role, req.user.id);
        return res.status(200).json(result);
    }
    catch (err) {
        if (err.message === 'Booking not found') {
            return res.status(404).json({
                message: err.message,
            });
        }
        if (err.message === 'Access denied') {
            return res.status(403).json({
                message: err.message,
            });
        }
        if (err.message.includes('Cannot cancel')) {
            return res.status(409).json({
                message: err.message,
            });
        }
        console.error('Cancel booking error:', err);
        return res.status(500).json({
            message: 'Failed to cancel booking',
        });
    }
}
// Delete booking (Admin/Staff only)
export async function deleteBookingController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: 'Booking ID is required',
            });
        }
        const result = await deleteBooking(id, req.user.role);
        return res.status(200).json(result);
    }
    catch (err) {
        if (err.message === 'Booking not found') {
            return res.status(404).json({
                message: err.message,
            });
        }
        if (err.message === 'Access denied') {
            return res.status(403).json({
                message: err.message,
            });
        }
        if (err.message.includes('Cannot delete')) {
            return res.status(409).json({
                message: err.message,
            });
        }
        console.error('Delete booking error:', err);
        return res.status(500).json({
            message: 'Failed to delete booking',
        });
    }
}
// Get booking statistics
export async function getBookingStatsController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const stats = await getBookingStats(req.user.role, req.user.id);
        return res.status(200).json({
            message: 'Booking statistics retrieved successfully',
            stats,
        });
    }
    catch (err) {
        console.error('Get booking stats error:', err);
        return res.status(500).json({
            message: 'Failed to get booking statistics',
        });
    }
}
//# sourceMappingURL=bookingController.js.map