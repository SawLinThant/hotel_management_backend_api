import type { Request, Response } from 'express';
import { z } from 'zod';
import {
	createRoom,
	getRoomById,
	getRooms,
	updateRoom,
	deleteRoom,
	getRoomStats,
	type RoomFilters,
	type PaginationOptions,
} from '../services/roomService.js';

// Validation schemas
const createRoomSchema = z.object({
	room_number: z.string().min(1, 'Room number is required').max(50, 'Room number too long'),
	type: z.enum(['single', 'double', 'suite', 'deluxe'], {
		errorMap: () => ({ message: 'Invalid room type' }),
	}),
	capacity: z.number().int().min(1, 'Capacity must be at least 1').max(10, 'Capacity cannot exceed 10'),
	price_per_night: z.number().positive('Price must be positive').max(999999.99, 'Price too high'),
	description: z.string().optional(),
	amenities: z.record(z.any()).refine((val) => Object.keys(val).length > 0, {
		message: 'At least one amenity is required',
	}),
	images: z.array(z.string().url('Invalid image URL')).optional(),
	floor: z.number().int().min(1, 'Floor must be at least 1').max(100, 'Floor cannot exceed 100').optional(),
	size_sqm: z.number().positive('Size must be positive').max(999.99, 'Size too large').optional(),
});

const updateRoomSchema = z.object({
	room_number: z.string().min(1, 'Room number is required').max(50, 'Room number too long').optional(),
	type: z.enum(['single', 'double', 'suite', 'deluxe']).optional(),
	status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).optional(),
	capacity: z.number().int().min(1, 'Capacity must be at least 1').max(10, 'Capacity cannot exceed 10').optional(),
	price_per_night: z.number().positive('Price must be positive').max(999999.99, 'Price too high').optional(),
	description: z.string().optional(),
	amenities: z.record(z.any()).optional(),
	images: z.array(z.string().url('Invalid image URL')).optional(),
	floor: z.number().int().min(1, 'Floor must be at least 1').max(100, 'Floor cannot exceed 100').optional(),
	size_sqm: z.number().positive('Size must be positive').max(999.99, 'Size too large').optional(),
});

const roomFiltersSchema = z.object({
	status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).optional(),
	capacity: z.coerce.number().int().min(1).max(10).optional(),
	floor: z.coerce.number().int().min(1).max(100).optional(),
	price_per_night_min: z.coerce.number().positive().optional(),
	price_per_night_max: z.coerce.number().positive().optional(),
	type: z.enum(['single', 'double', 'suite', 'deluxe']).optional(),
	search: z.string().min(1).max(100).optional(),
});

const paginationSchema = z.object({
	page: z.coerce.number().int().min(1, 'Page must be at least 1').optional(),
	limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
	sortBy: z.enum(['price_per_night', 'capacity', 'floor', 'created_at']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Create room (Admin only)
export async function createRoomController(req: Request, res: Response) {
	try {
		const payload = createRoomSchema.parse(req.body);
		
		const room = await createRoom(payload);
		
		return res.status(201).json({
			message: 'Room created successfully',
			room,
		});
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Validation error',
				errors: err.errors,
			});
		}
		
		if (err.message === 'Room number already exists') {
			return res.status(409).json({
				message: err.message,
			});
		}
		
		console.error('Create room error:', err);
		return res.status(500).json({
			message: 'Failed to create room',
		});
	}
}

// Get room by ID (Public)
export async function getRoomByIdController(req: Request, res: Response) {
	try {
		const { id } = req.params;
		
		if (!id) {
			return res.status(400).json({
				message: 'Room ID is required',
			});
		}
		
		const room = await getRoomById(id);
		
		return res.status(200).json({
			room,
		});
	} catch (err: any) {
		if (err.message === 'Room not found') {
			return res.status(404).json({
				message: err.message,
			});
		}
		
		console.error('Get room by ID error:', err);
		return res.status(500).json({
			message: 'Failed to get room',
		});
	}
}

// Get rooms with filtering and pagination (Public)
export async function getRoomsController(req: Request, res: Response) {
	try {
		// Parse query parameters
		const filters = roomFiltersSchema.parse(req.query);
		const pagination = paginationSchema.parse(req.query);
		
		// Set reasonable defaults for pagination
		const finalPagination: PaginationOptions = {
			page: pagination.page || 1,
			limit: Math.min(pagination.limit || 10, 100), // Cap at 100
			sortBy: pagination.sortBy || 'created_at',
			sortOrder: pagination.sortOrder || 'desc',
		};
		
		const result = await getRooms(filters as RoomFilters, finalPagination);
		
		return res.status(200).json({
			message: 'Rooms retrieved successfully',
			...result,
		});
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Invalid query parameters',
				errors: err.errors,
			});
		}
		
		console.error('Get rooms error:', err);
		return res.status(500).json({
			message: 'Failed to get rooms',
		});
	}
}

// Update room (Admin only)
export async function updateRoomController(req: Request, res: Response) {
	try {
		const { id } = req.params;
		
		if (!id) {
			return res.status(400).json({
				message: 'Room ID is required',
			});
		}
		
		const payload = updateRoomSchema.parse(req.body);
		
		const room = await updateRoom(id, payload);
		
		return res.status(200).json({
			message: 'Room updated successfully',
			room,
		});
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Validation error',
				errors: err.errors,
			});
		}
		
		if (err.message === 'Room not found') {
			return res.status(404).json({
				message: err.message,
			});
		}
		
		if (err.message === 'Room number already exists') {
			return res.status(409).json({
				message: err.message,
			});
		}
		
		console.error('Update room error:', err);
		return res.status(500).json({
			message: 'Failed to update room',
		});
	}
}

// Delete room (Admin only)
export async function deleteRoomController(req: Request, res: Response) {
	try {
		const { id } = req.params;
		
		if (!id) {
			return res.status(400).json({
				message: 'Room ID is required',
			});
		}
		
		const result = await deleteRoom(id);
		
		return res.status(200).json(result);
	} catch (err: any) {
		if (err.message === 'Room not found') {
			return res.status(404).json({
				message: err.message,
			});
		}
		
		if (err.message === 'Cannot delete room with active bookings') {
			return res.status(409).json({
				message: err.message,
			});
		}
		
		console.error('Delete room error:', err);
		return res.status(500).json({
			message: 'Failed to delete room',
		});
	}
}

// Get room statistics (Admin only)
export async function getRoomStatsController(req: Request, res: Response) {
	try {
		const stats = await getRoomStats();
		
		return res.status(200).json({
			message: 'Room statistics retrieved successfully',
			stats,
		});
	} catch (err: any) {
		console.error('Get room stats error:', err);
		return res.status(500).json({
			message: 'Failed to get room statistics',
		});
	}
}


