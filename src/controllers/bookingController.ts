import type { Request, Response } from 'express';
import { z } from 'zod';
import { BadRequest, NotFound } from '../utils/errors.js';
import { paginationSchema, bookingCreateSchema, bookingUpdateSchema, checkInSchema, checkOutSchema } from './validators.js';
import {
	createBooking,
	getBookingById,
	getBookings,
	updateBooking,
	cancelBooking,
	deleteBooking,
	getBookingStats,
	checkIn,
	checkOut,
	stats,
	arrivals,
	departures,
	type BookingFilters,
	type PaginationOptions,
	type CreateBookingData,
	type UpdateBookingData,
} from '../services/bookingService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import type { BookingStatus } from '../../generated/prisma/index.js';

// Validation schemas for AuthenticatedRequest controllers
const createBookingAuthSchema = z.object({
	room_id: z.string().min(1, 'Room ID is required'),
	guest_id: z.string().min(1, 'Guest ID is required'),
	check_in_date: z.string().datetime('Invalid check-in date format'),
	check_out_date: z.string().datetime('Invalid check-out date format'),
	guests: z.number().int().min(1, 'At least 1 guest required').max(10, 'Maximum 10 guests allowed'),
	special_requests: z.string().optional(),
});

const updateBookingAuthSchema = z.object({
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

const paginationAuthSchema = z.object({
	page: z.coerce.number().int().min(1, 'Page must be at least 1').optional(),
	limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
	sortBy: z.enum(['check_in_date', 'check_out_date', 'total_amount', 'created_at']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional(),
});

// AuthenticatedRequest Controllers (more comprehensive with role-based access)
export async function createBookingController(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const payload = createBookingAuthSchema.parse(req.body);
		
		const bookingData: CreateBookingData = {
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
	} catch (err: any) {
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

export async function getBookingByIdController(req: AuthenticatedRequest, res: Response) {
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
	} catch (err: any) {
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

export async function getBookingsController(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		// Parse query parameters
		const filters = bookingFiltersSchema.parse(req.query);
		const pagination = paginationAuthSchema.parse(req.query);
		
		// Build strongly-typed filters
		const processedFilters: BookingFilters = {};
		if (filters.status) processedFilters.status = filters.status as BookingStatus;
		if (filters.guest_id) processedFilters.guest_id = filters.guest_id;
		if (filters.room_id) processedFilters.room_id = filters.room_id;
		if (typeof filters.guests === 'number') processedFilters.guests = filters.guests;
		if (filters.check_in_date_from) processedFilters.check_in_date_from = new Date(filters.check_in_date_from);
		if (filters.check_in_date_to) processedFilters.check_in_date_to = new Date(filters.check_in_date_to);
		if (filters.check_out_date_from) processedFilters.check_out_date_from = new Date(filters.check_out_date_from);
		if (filters.check_out_date_to) processedFilters.check_out_date_to = new Date(filters.check_out_date_to);
		
		// Set reasonable defaults for pagination
		const finalPagination: PaginationOptions = {
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
	} catch (err: any) {
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

export async function updateBookingController(req: AuthenticatedRequest, res: Response) {
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
		
		const payload = updateBookingAuthSchema.parse(req.body);
		
		// Build strongly-typed update payload
		const updateData: UpdateBookingData = {};
		if (payload.check_in_date) updateData.check_in_date = new Date(payload.check_in_date);
		if (payload.check_out_date) updateData.check_out_date = new Date(payload.check_out_date);
		if (typeof payload.guests === 'number') updateData.guests = payload.guests;
		if (payload.status) updateData.status = payload.status as BookingStatus;
		if (typeof payload.special_requests === 'string') updateData.special_requests = payload.special_requests;
		
		const booking = await updateBooking(id, updateData, req.user.role, req.user.id);
		
		return res.status(200).json({
			message: 'Booking updated successfully',
			booking,
		});
	} catch (err: any) {
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

export async function cancelBookingController(req: AuthenticatedRequest, res: Response) {
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
	} catch (err: any) {
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

export async function deleteBookingController(req: AuthenticatedRequest, res: Response) {
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
	} catch (err: any) {
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

export async function getBookingStatsController(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const stats = await getBookingStats(req.user.role, req.user.id);
		
		return res.status(200).json({
			message: 'Booking statistics retrieved successfully',
			stats,
		});
	} catch (err: any) {
		console.error('Get booking stats error:', err);
		return res.status(500).json({
			message: 'Failed to get booking statistics',
		});
	}
}

// Additional controllers using simpler service functions
export async function checkInController(req: Request, res: Response) {
	try {
		const payload = checkInSchema.parse({ ...req.body, booking_id: req.params.id });
		await checkIn(payload.booking_id, payload.notes, payload.actual_check_in_time);
		const booking = await getBookingById(payload.booking_id);
		if (!booking) throw NotFound('Booking not found');
		return res.json(booking);
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Validation error',
				errors: err.errors,
			});
		}
		return res.status(500).json({ message: err.message || 'Failed to check in' });
	}
}

export async function checkOutController(req: Request, res: Response) {
	try {
		const payload = checkOutSchema.parse({ ...req.body, booking_id: req.params.id });
		await checkOut(payload.booking_id, { notes: payload.notes, at: payload.actual_check_out_time, additional_charges: payload.additional_charges });
		const booking = await getBookingById(payload.booking_id);
		if (!booking) throw NotFound('Booking not found');
		return res.json(booking);
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Validation error',
				errors: err.errors,
			});
		}
		return res.status(500).json({ message: err.message || 'Failed to check out' });
	}
}

export async function statsController(req: Request, res: Response) {
	try {
		const params = z.object({ date_from: z.coerce.date().optional(), date_to: z.coerce.date().optional() }).parse(req.query);
		const s = await stats(params.date_from, params.date_to);
		return res.json(s);
	} catch (err: any) {
		return res.status(500).json({ message: 'Failed to get stats' });
	}
}

export async function arrivalsController(req: Request, res: Response) {
	try {
		const params = z.object({ date: z.coerce.date().optional() }).parse(req.query);
		const data = await arrivals(params.date);
		return res.json(data);
	} catch (err: any) {
		return res.status(500).json({ message: 'Failed to get arrivals' });
	}
}

export async function departuresController(req: Request, res: Response) {
	try {
		const params = z.object({ date: z.coerce.date().optional() }).parse(req.query);
		const data = await departures(params.date);
		return res.json(data);
	} catch (err: any) {
		return res.status(500).json({ message: 'Failed to get departures' });
	}
}

export async function sendConfirmationController(_req: Request, res: Response) {
	// Stub: email service not enabled
	return res.status(202).json({ queued: false });
}

export async function paymentController(_req: Request, res: Response) {
	// Payment excluded by scope
	return res.status(501).json({ message: 'Payment not implemented' });
}

export async function invoiceController(_req: Request, res: Response) {
	// Out of scope; return 501
	return res.status(501).json({ message: 'Invoice generation not implemented' });
}
