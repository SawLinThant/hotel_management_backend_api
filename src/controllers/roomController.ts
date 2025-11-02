import type { Request, Response } from 'express';
import { z } from 'zod';
import { BadRequest, NotFound } from '../utils/errors.js';
import {
	createRoom,
	getRoomById,
	getRooms,
	listRooms,
	updateRoom,
	deleteRoom,
	bulkUpdateStatus,
	checkAvailability,
	getRoomStats,
	type RoomFilters,
	type PaginationOptions,
} from '../services/roomService.js';
import { paginationSchema, roomCreateSchema, roomUpdateSchema, roomAvailabilityQuerySchema } from './validators.js';
import { uploadImages as uploadImagesToCloudinary } from '../utils/cloudinary.js';

// Additional validation schemas
const roomFiltersSchema = z.object({
	status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).optional(),
	capacity: z.coerce.number().int().min(1).max(10).optional(),
	floor: z.coerce.number().int().min(1).max(100).optional(),
	price_per_night_min: z.coerce.number().positive().optional(),
	price_per_night_max: z.coerce.number().positive().optional(),
	type: z.enum(['single', 'double', 'suite', 'deluxe']).optional(),
	search: z.string().min(1).max(100).optional(),
});

const paginationAuthSchema = z.object({
	page: z.coerce.number().int().min(1, 'Page must be at least 1').optional(),
	limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
	sortBy: z.enum(['price_per_night', 'capacity', 'floor', 'created_at']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Get rooms controller - uses getRooms for better filtering support
export async function getRoomsController(req: Request, res: Response) {
	try {
		// Parse query parameters
		const filters = roomFiltersSchema.parse(req.query);
		const pagination = paginationAuthSchema.parse(req.query);
		
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

// Get room by ID controller
export async function getRoomController(req: Request, res: Response) {
	try {
		const id = req.params.id;
		
		if (!id) {
			return res.status(400).json({
				message: 'Room ID is required',
			});
		}
		
		const room = await getRoomById(id);
		
		if (!room) {
			return res.status(404).json({
				message: 'Room not found',
			});
		}
		
		return res.status(200).json(room);
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

// Also export as getRoomByIdController for compatibility
export const getRoomByIdController = getRoomController;

// Create room controller with file upload support
export async function createRoomController(req: Request, res: Response) {
	try {
		// Parse JSON fields from req.body (after multer processes the form data)
		const roomData = {
			room_number: req.body.room_number,
			type: req.body.type,
			capacity: req.body.capacity ? Number(req.body.capacity) : undefined,
			price_per_night: req.body.price_per_night ? Number(req.body.price_per_night) : undefined,
			description: req.body.description,
			amenities: req.body.amenities ? (Array.isArray(req.body.amenities) ? req.body.amenities : JSON.parse(req.body.amenities)) : [],
			floor: req.body.floor ? Number(req.body.floor) : undefined,
			size_sqm: req.body.size_sqm ? Number(req.body.size_sqm) : undefined,
		};

		const payload = roomCreateSchema.parse(roomData);

		// Handle file uploads if any files are present
		let imageUrls: string[] = [];
		if (req.files && Array.isArray(req.files) && req.files.length > 0) {
			try {
				const files = req.files.map((file: Express.Multer.File) => ({
					buffer: file.buffer,
					originalname: file.originalname,
				}));
				imageUrls = await uploadImagesToCloudinary(files);
			} catch (uploadError: any) {
				console.error('Image upload error:', uploadError);
				return res.status(500).json({
					message: `Failed to upload images: ${uploadError.message}`,
				});
			}
		}

		// Add image URLs to payload
		const finalPayload = {
			...payload,
			images: imageUrls.length > 0 ? imageUrls : undefined,
		};
		
		const room = await createRoom(finalPayload);
		
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

// Update room controller with file upload support
export async function updateRoomController(req: Request, res: Response) {
	try {
		const id = req.params.id;
		
		if (!id) {
			return res.status(400).json({
				message: 'Room ID is required',
			});
		}

		// Parse JSON fields from req.body (after multer processes the form data)
		const roomData: any = {};
		
		if (req.body.type !== undefined) roomData.type = req.body.type;
		if (req.body.status !== undefined) roomData.status = req.body.status;
		if (req.body.capacity !== undefined) roomData.capacity = req.body.capacity ? Number(req.body.capacity) : undefined;
		if (req.body.price_per_night !== undefined) roomData.price_per_night = req.body.price_per_night ? Number(req.body.price_per_night) : undefined;
		if (req.body.description !== undefined) roomData.description = req.body.description;
		if (req.body.amenities !== undefined) {
			roomData.amenities = Array.isArray(req.body.amenities) 
				? req.body.amenities 
				: req.body.amenities ? JSON.parse(req.body.amenities) : [];
		}
		if (req.body.floor !== undefined) roomData.floor = req.body.floor ? Number(req.body.floor) : undefined;
		if (req.body.size_sqm !== undefined) roomData.size_sqm = req.body.size_sqm ? Number(req.body.size_sqm) : undefined;

		// Handle file uploads if any files are present
		let newImageUrls: string[] = [];
		if (req.files && Array.isArray(req.files) && req.files.length > 0) {
			try {
				const files = req.files.map((file: Express.Multer.File) => ({
					buffer: file.buffer,
					originalname: file.originalname,
				}));
				newImageUrls = await uploadImagesToCloudinary(files);
			} catch (uploadError: any) {
				console.error('Image upload error:', uploadError);
				return res.status(500).json({
					message: `Failed to upload images: ${uploadError.message}`,
				});
			}
		}

		// If new images were uploaded, get existing images and merge them
		if (newImageUrls.length > 0) {
			const existingRoom = await getRoomById(id);
			if (!existingRoom) {
				return res.status(404).json({
					message: 'Room not found',
				});
			}
			const existingImages = (existingRoom.images as string[] | null) || [];
			roomData.images = [...existingImages, ...newImageUrls];
		}

		const payload = roomUpdateSchema.parse(roomData);
		
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

// Delete room controller
export async function deleteRoomController(req: Request, res: Response) {
	try {
		const id = req.params.id;
		
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

// Check availability controller
export async function checkAvailabilityController(req: Request, res: Response) {
	try {
		const params = roomAvailabilityQuerySchema.parse(req.query);
		const data = await checkAvailability({
			check_in_date: params.check_in_date,
			check_out_date: params.check_out_date,
			guests: params.guests,
			room_type: params.room_type,
		});
		return res.json(data);
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Validation error',
				errors: err.errors,
			});
		}
		return res.status(500).json({ message: err.message || 'Failed to check availability' });
	}
}

// Bulk update status controller
export async function bulkUpdateStatusController(req: Request, res: Response) {
	try {
		const body = z.object({ room_ids: z.array(z.string().min(1)), status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']) }).parse(req.body);
		await bulkUpdateStatus(body.room_ids, body.status);
		return res.status(204).send();
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Validation error',
				errors: err.errors,
			});
		}
		return res.status(500).json({ message: err.message || 'Failed to bulk update status' });
	}
}

// Upload images controller with file upload support
export async function uploadImagesController(req: Request, res: Response) {
	try {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ message: 'Room ID is required' });
		}

		// Handle file uploads
		let imageUrls: string[] = [];
		if (req.files && Array.isArray(req.files) && req.files.length > 0) {
			try {
				const files = req.files.map((file: Express.Multer.File) => ({
					buffer: file.buffer,
					originalname: file.originalname,
				}));
				imageUrls = await uploadImagesToCloudinary(files);
			} catch (uploadError: any) {
				console.error('Image upload error:', uploadError);
				return res.status(500).json({
					message: `Failed to upload images: ${uploadError.message}`,
				});
			}
		} else {
			// Fallback: accept image URLs in body if no files
			const body = z.object({ images: z.array(z.string().url()).optional() }).parse(req.body);
			if (body.images) {
				imageUrls = body.images;
			}
		}

		if (imageUrls.length === 0) {
			return res.status(400).json({ message: 'No images provided' });
		}

		// Get existing images and append new ones
		const room = await getRoomById(id);
		if (!room) {
			return res.status(404).json({ message: 'Room not found' });
		}

		const existingImages = (room.images as string[] | null) || [];
		const allImages = [...existingImages, ...imageUrls];

		const updated = await updateRoom(id, { images: allImages });
		return res.json({ image_urls: updated.images ?? [] });
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Validation error',
				errors: err.errors,
			});
		}
		if (err.message === 'Room not found') {
			return res.status(404).json({ message: err.message });
		}
		return res.status(500).json({ message: err.message || 'Failed to upload images' });
	}
}

// Delete image controller
export async function deleteImageController(req: Request, res: Response) {
	try {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ message: 'Room ID is required' });
		}
		
		const body = z.object({ image_url: z.string().url() }).parse(req.body);
		const room = await getRoomById(id);
		if (!room) throw NotFound('Room not found');
		const images = (room.images as string[] | null) ?? [];
		const next = images.filter((u) => u !== body.image_url);
		await updateRoom(id, { images: next });
		return res.status(204).send();
	} catch (err: any) {
		if (err.name === 'ZodError') {
			return res.status(400).json({
				message: 'Validation error',
				errors: err.errors,
			});
		}
		if (err.message === 'Room not found') {
			return res.status(404).json({ message: err.message });
		}
		return res.status(500).json({ message: err.message || 'Failed to delete image' });
	}
}

// Get room statistics controller
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
