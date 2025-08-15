import type { Request, Response } from 'express';
import { z } from 'zod';
import {
	createStayRecord,
	getStayRecordById,
	getStayRecords,
	updateStayRecord,
	checkOutGuest,
	deleteStayRecord,
	getStayRecordStats,
	type StayRecordFilters,
	type PaginationOptions,
} from '../services/stayRecordService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Validation schemas
const createStayRecordSchema = z.object({
	booking_id: z.string().min(1, 'Booking ID is required'),
	check_in_time: z.string().datetime('Invalid check-in time format').optional(),
	notes: z.string().optional(),
	room_condition: z.string().optional(),
	amenities_used: z.array(z.string()).optional(),
	incidents: z.array(z.string()).optional(),
});

const updateStayRecordSchema = z.object({
	check_in_time: z.string().datetime('Invalid check-in time format').optional(),
	check_out_time: z.string().datetime('Invalid check-out time format').optional(),
	notes: z.string().optional(),
	room_condition: z.string().optional(),
	amenities_used: z.array(z.string()).optional(),
	incidents: z.array(z.string()).optional(),
});

const checkOutSchema = z.object({
	check_out_time: z.string().datetime('Invalid check-out time format').optional(),
	notes: z.string().optional(),
	room_condition: z.string().optional(),
	incidents: z.array(z.string()).optional(),
});

const stayRecordFiltersSchema = z.object({
	booking_id: z.string().min(1).optional(),
	guest_id: z.string().min(1).optional(),
	room_id: z.string().min(1).optional(),
	check_in_date_from: z.string().datetime('Invalid date format').optional(),
	check_in_date_to: z.string().datetime('Invalid date format').optional(),
	check_out_date_from: z.string().datetime('Invalid date format').optional(),
	check_out_date_to: z.string().datetime('Invalid date format').optional(),
	has_incidents: z.coerce.boolean().optional(),
});

const paginationSchema = z.object({
	page: z.coerce.number().int().min(1, 'Page must be at least 1').optional(),
	limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
	sortBy: z.enum(['check_in_time', 'check_out_time', 'created_at']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Create stay record (check-in)
export async function createStayRecordController(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const payload = createStayRecordSchema.parse(req.body);
		
		const stayRecordData = {
			booking_id: payload.booking_id,
			check_in_time: payload.check_in_time ? new Date(payload.check_in_time) : undefined,
			notes: payload.notes,
			room_condition: payload.room_condition,
			amenities_used: payload.amenities_used,
			incidents: payload.incidents,
		};

		const stayRecord = await createStayRecord(stayRecordData, req.user.role, req.user.id);
		
		return res.status(201).json({
			message: 'Guest checked in successfully',
			stayRecord,
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

		if (err.message === 'Stay record already exists for this booking') {
			return res.status(409).json({
				message: err.message,
			});
		}

		if (err.message.includes('Booking must be confirmed or pending')) {
			return res.status(400).json({
				message: err.message,
			});
		}
		
		console.error('Create stay record error:', err);
		return res.status(500).json({
			message: 'Failed to check in guest',
		});
	}
}

// Get stay record by ID
export async function getStayRecordByIdController(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { id } = req.params;
		
		if (!id) {
			return res.status(400).json({
				message: 'Stay record ID is required',
			});
		}
		
		const stayRecord = await getStayRecordById(id, req.user.role, req.user.id);
		
		return res.status(200).json({
			stayRecord,
		});
	} catch (err: any) {
		if (err.message === 'Stay record not found') {
			return res.status(404).json({
				message: err.message,
			});
		}

		if (err.message === 'Access denied') {
			return res.status(403).json({
				message: err.message,
			});
		}
		
		console.error('Get stay record by ID error:', err);
		return res.status(500).json({
			message: 'Failed to get stay record',
		});
	}
}

// Get stay records with filtering and pagination
export async function getStayRecordsController(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		// Parse query parameters
		const filters = stayRecordFiltersSchema.parse(req.query);
		const pagination = paginationSchema.parse(req.query);
		
		// Build typed filters
		const processedFilters: StayRecordFilters = {};
		if (filters.booking_id) processedFilters.booking_id = filters.booking_id;
		if (filters.guest_id) processedFilters.guest_id = filters.guest_id;
		if (filters.room_id) processedFilters.room_id = filters.room_id;
		if (filters.check_in_date_from) processedFilters.check_in_date_from = new Date(filters.check_in_date_from);
		if (filters.check_in_date_to) processedFilters.check_in_date_to = new Date(filters.check_in_date_to);
		if (filters.check_out_date_from) processedFilters.check_out_date_from = new Date(filters.check_out_date_from);
		if (filters.check_out_date_to) processedFilters.check_out_date_to = new Date(filters.check_out_date_to);
		if (typeof filters.has_incidents === 'boolean') processedFilters.has_incidents = filters.has_incidents;
		
		// Set reasonable defaults for pagination
		const finalPagination: PaginationOptions = {
			page: pagination.page || 1,
			limit: Math.min(pagination.limit || 10, 100), // Cap at 100
			sortBy: pagination.sortBy || 'created_at',
			sortOrder: pagination.sortOrder || 'desc',
		};
		
		const result = await getStayRecords(processedFilters, finalPagination, req.user.role, req.user.id);
		
		return res.status(200).json({
			message: 'Stay records retrieved successfully',
			...result,
		});
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Invalid query parameters',
				errors: err.errors,
			});
		}
		
		console.error('Get stay records error:', err);
		return res.status(500).json({
			message: 'Failed to get stay records',
		});
	}
}

// Update stay record
export async function updateStayRecordController(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { id } = req.params;
		
		if (!id) {
			return res.status(400).json({
				message: 'Stay record ID is required',
			});
		}
		
		const payload = updateStayRecordSchema.parse(req.body);
		
		// Build typed update payload
		const updateData: any = {};
		if (payload.check_in_time) updateData.check_in_time = new Date(payload.check_in_time);
		if (payload.check_out_time) updateData.check_out_time = new Date(payload.check_out_time);
		if (payload.notes !== undefined) updateData.notes = payload.notes;
		if (payload.room_condition !== undefined) updateData.room_condition = payload.room_condition;
		if (payload.amenities_used !== undefined) updateData.amenities_used = payload.amenities_used;
		if (payload.incidents !== undefined) updateData.incidents = payload.incidents;
		
		const stayRecord = await updateStayRecord(id, updateData, req.user.role, req.user.id);
		
		return res.status(200).json({
			message: 'Stay record updated successfully',
			stayRecord,
		});
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Validation error',
				errors: err.errors,
			});
		}
		
		if (err.message === 'Stay record not found') {
			return res.status(404).json({
				message: err.message,
			});
		}

		if (err.message === 'Access denied') {
			return res.status(403).json({
				message: err.message,
			});
		}
		
		console.error('Update stay record error:', err);
		return res.status(500).json({
			message: 'Failed to update stay record',
		});
	}
}

// Check-out guest
export async function checkOutGuestController(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { id } = req.params;
		
		if (!id) {
			return res.status(400).json({
				message: 'Stay record ID is required',
			});
		}
		
		const payload = checkOutSchema.parse(req.body);
		
		// Build typed checkout payload
		const checkOutData: any = {};
		if (payload.check_out_time) checkOutData.check_out_time = new Date(payload.check_out_time);
		if (payload.notes !== undefined) checkOutData.notes = payload.notes;
		if (payload.room_condition !== undefined) checkOutData.room_condition = payload.room_condition;
		if (payload.incidents !== undefined) checkOutData.incidents = payload.incidents;

		const stayRecord = await checkOutGuest(id, req.user.role, req.user.id, checkOutData);
		
		return res.status(200).json({
			message: 'Guest checked out successfully',
			stayRecord,
		});
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Validation error',
				errors: err.errors,
			});
		}
		
		if (err.message === 'Stay record not found') {
			return res.status(404).json({
				message: err.message,
			});
		}

		if (err.message === 'Access denied') {
			return res.status(403).json({
				message: err.message,
			});
		}

		if (err.message === 'Guest is already checked out') {
			return res.status(409).json({
				message: err.message,
			});
		}
		
		console.error('Check-out guest error:', err);
		return res.status(500).json({
			message: 'Failed to check out guest',
		});
	}
}

// Delete stay record (Admin/Staff only)
export async function deleteStayRecordController(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { id } = req.params;
		
		if (!id) {
			return res.status(400).json({
				message: 'Stay record ID is required',
			});
		}
		
		const result = await deleteStayRecord(id, req.user.role);
		
		return res.status(200).json(result);
	} catch (err: any) {
		if (err.message === 'Stay record not found') {
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
		
		console.error('Delete stay record error:', err);
		return res.status(500).json({
			message: 'Failed to delete stay record',
		});
	}
}

// Get stay record statistics
export async function getStayRecordStatsController(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const stats = await getStayRecordStats(req.user.role, req.user.id);
		
		return res.status(200).json({
			message: 'Stay record statistics retrieved successfully',
			stats,
		});
	} catch (err: any) {
		console.error('Get stay record stats error:', err);
		return res.status(500).json({
			message: 'Failed to get stay record statistics',
		});
	}
}
