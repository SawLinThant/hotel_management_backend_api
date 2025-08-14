import { PrismaClient, RoomType, RoomStatus } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

// Types for room operations
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

// Create a new room (Admin only)
export async function createRoom(data: CreateRoomData): Promise<any> {
	// Check if room number already exists
	const existingRoom = await prisma.room.findUnique({
		where: { room_number: data.room_number },
	});

	if (existingRoom) {
		throw new Error('Room number already exists');
	}

	const room = await prisma.room.create({
		data: {
			room_number: data.room_number,
			type: data.type,
			capacity: data.capacity,
			price_per_night: data.price_per_night,
			description: data.description,
			amenities: data.amenities,
			images: data.images || [],
			floor: data.floor,
			size_sqm: data.size_sqm,
		},
		select: {
			id: true,
			room_number: true,
			type: true,
			status: true,
			capacity: true,
			price_per_night: true,
			description: true,
			amenities: true,
			images: true,
			floor: true,
			size_sqm: true,
			created_at: true,
			updated_at: true,
		},
	});

	return room;
}

// Get room by ID
export async function getRoomById(id: string): Promise<any> {
	const room = await prisma.room.findUnique({
		where: { id },
		select: {
			id: true,
			room_number: true,
			type: true,
			status: true,
			capacity: true,
			price_per_night: true,
			description: true,
			amenities: true,
			images: true,
			floor: true,
			size_sqm: true,
			created_at: true,
			updated_at: true,
			// Include booking count for availability context
			_count: {
				select: {
					bookings: {
						where: {
							status: {
								in: ['pending', 'confirmed', 'checked_in'],
							},
						},
					},
				},
			},
		},
	});

	if (!room) {
		throw new Error('Room not found');
	}

	return room;
}

// Get rooms with filtering and pagination
export async function getRooms(
	filters: RoomFilters = {},
	pagination: PaginationOptions = {}
): Promise<RoomListResponse> {
	const {
		status,
		capacity,
		floor,
		price_per_night_min,
		price_per_night_max,
		type,
		search,
	} = filters;

	const {
		page = 1,
		limit = 10,
		sortBy = 'created_at',
		sortOrder = 'desc',
	} = pagination;

	// Build where clause for filtering
	const where: any = {};

	if (status) where.status = status;
	if (capacity) where.capacity = capacity;
	if (floor) where.floor = floor;
	if (type) where.type = type;

	// Price range filter
	if (price_per_night_min || price_per_night_max) {
		where.price_per_night = {};
		if (price_per_night_min) where.price_per_night.gte = price_per_night_min;
		if (price_per_night_max) where.price_per_night.lte = price_per_night_max;
	}

	// Search filter (search in room number, description)
	if (search) {
		where.OR = [
			{ room_number: { contains: search, mode: 'insensitive' } },
			{ description: { contains: search, mode: 'insensitive' } },
		];
	}

	// Calculate pagination
	const skip = (page - 1) * limit;

	// Build order by clause
	const orderBy: any = {};
	orderBy[sortBy] = sortOrder;

	// Execute queries
	const [rooms, total] = await Promise.all([
		prisma.room.findMany({
			where,
			select: {
				id: true,
				room_number: true,
				type: true,
				status: true,
				capacity: true,
				price_per_night: true,
				description: true,
				amenities: true,
				images: true,
				floor: true,
				size_sqm: true,
				created_at: true,
				updated_at: true,
				// Include active booking count for availability
				_count: {
					select: {
						bookings: {
							where: {
								status: {
									in: ['pending', 'confirmed', 'checked_in'],
								},
							},
						},
					},
				},
			},
			orderBy,
			skip,
			take: limit,
		}),
		prisma.room.count({ where }),
	]);

	const totalPages = Math.ceil(total / limit);
	const hasNext = page < totalPages;
	const hasPrev = page > 1;

	return {
		rooms,
		total,
		page,
		limit,
		totalPages,
		hasNext,
		hasPrev,
	};
}

// Update room (Admin only)
export async function updateRoom(id: string, data: UpdateRoomData): Promise<any> {
	// Check if room exists
	const existingRoom = await prisma.room.findUnique({
		where: { id },
	});

	if (!existingRoom) {
		throw new Error('Room not found');
	}

	// If room number is being updated, check for uniqueness
	if (data.room_number && data.room_number !== existingRoom.room_number) {
		const roomWithSameNumber = await prisma.room.findUnique({
			where: { room_number: data.room_number },
		});

		if (roomWithSameNumber) {
			throw new Error('Room number already exists');
		}
	}

	const room = await prisma.room.update({
		where: { id },
		data: {
			room_number: data.room_number,
			type: data.type,
			status: data.status,
			capacity: data.capacity,
			price_per_night: data.price_per_night,
			description: data.description,
			amenities: data.amenities,
			images: data.images,
			floor: data.floor,
			size_sqm: data.size_sqm,
		},
		select: {
			id: true,
			room_number: true,
			type: true,
			status: true,
			capacity: true,
			price_per_night: true,
			description: true,
			amenities: true,
			images: true,
			floor: true,
			size_sqm: true,
			created_at: true,
			updated_at: true,
		},
	});

	return room;
}

// Delete room (Admin only)
export async function deleteRoom(id: string): Promise<{ message: string }> {
	// Check if room exists
	const existingRoom = await prisma.room.findUnique({
		where: { id },
		include: {
			bookings: {
				where: {
					status: {
						in: ['pending', 'confirmed', 'checked_in'],
					},
				},
			},
		},
	});

	if (!existingRoom) {
		throw new Error('Room not found');
	}

	// Check if room has active bookings
	if (existingRoom.bookings.length > 0) {
		throw new Error('Cannot delete room with active bookings');
	}

	// Delete the room
	await prisma.room.delete({
		where: { id },
	});

	return { message: 'Room deleted successfully' };
}

// Get room statistics (for admin dashboard)
export async function getRoomStats(): Promise<any> {
	const [
		totalRooms,
		availableRooms,
		occupiedRooms,
		maintenanceRooms,
		cleaningRooms,
		roomsByType,
	] = await Promise.all([
		prisma.room.count(),
		prisma.room.count({ where: { status: 'available' } }),
		prisma.room.count({ where: { status: 'occupied' } }),
		prisma.room.count({ where: { status: 'maintenance' } }),
		prisma.room.count({ where: { status: 'cleaning' } }),
		prisma.room.groupBy({
			by: ['type'],
			_count: { type: true },
		}),
	]);

	return {
		total: totalRooms,
		available: availableRooms,
		occupied: occupiedRooms,
		maintenance: maintenanceRooms,
		cleaning: cleaningRooms,
		byType: roomsByType,
		occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : '0',
	};
}


