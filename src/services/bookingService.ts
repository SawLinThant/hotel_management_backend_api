import { PrismaClient, BookingStatus, Role } from '../../generated/prisma/index.js';
import { BadRequest, Conflict, NotFound } from '../utils/errors.js';

const prisma = new PrismaClient();

function nightsBetween(a: Date, b: Date) {
	const ms = Math.max(0, +b - +a);
	return Math.max(1, Math.ceil(ms / (24 * 3600 * 1000)));
}

// Types for booking operations
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

async function assertRoomAvailable(room_id: string, from: Date, to: Date, excludeBookingId?: string) {
	const overlapping = await prisma.booking.findFirst({
		where: {
			room_id,
			id: excludeBookingId ? { not: excludeBookingId } : undefined,
			OR: [
				{ AND: [{ check_in_date: { lt: to } }, { check_out_date: { gt: from } }] },
			],
			status: { in: ['pending', 'confirmed', 'checked_in'] },
		},
		select: { id: true },
	});
	if (overlapping) throw Conflict('Room is not available for selected dates');
}

// Check room availability for given dates
export async function checkRoomAvailability(
	room_id: string,
	check_in_date: Date,
	check_out_date: Date,
	exclude_booking_id?: string
): Promise<boolean> {
	const conflictingBookings = await prisma.booking.findMany({
		where: {
			room_id,
			id: { not: exclude_booking_id },
			status: {
				in: ['pending', 'confirmed', 'checked_in'],
			},
			OR: [
				{
					check_in_date: { lt: check_out_date },
					check_out_date: { gt: check_in_date },
				},
			],
		},
	});

	return conflictingBookings.length === 0;
}

// Simple versions (used by checkIn, checkOut, etc.)
export async function listBookings(params: any) {
	const page = params.page ?? 1;
	const limit = Math.min(params.limit ?? 10, 100);
	const skip = (page - 1) * limit;

	const where: any = {};
	if (params.status) where.status = params.status;
	if (params.room_id) where.room_id = params.room_id;
	if (params.guest_id) where.guest_id = params.guest_id;
	if (params.check_in_from || params.check_in_to) {
		where.check_in_date = {};
		if (params.check_in_from) where.check_in_date.gte = params.check_in_from;
		if (params.check_in_to) where.check_in_date.lte = params.check_in_to;
	}
	if (params.check_out_from || params.check_out_to) {
		where.check_out_date = {};
		if (params.check_out_from) where.check_out_date.gte = params.check_out_from;
		if (params.check_out_to) where.check_out_date.lte = params.check_out_to;
	}
	if (params.min_amount || params.max_amount) {
		where.total_amount = {};
		if (params.min_amount) where.total_amount.gte = params.min_amount;
		if (params.max_amount) where.total_amount.lte = params.max_amount;
	}

	const orderBy: any = params.sort_by ? { [params.sort_by]: params.sort_order ?? 'asc' } : { created_at: 'desc' };

	const [bookings, total] = await prisma.$transaction([
		prisma.booking.findMany({
			where,
			skip,
			take: limit,
			orderBy,
			select: {
				id: true,
				room_id: true,
				guest_id: true,
				check_in_date: true,
				check_out_date: true,
				guests: true,
				status: true,
				total_amount: true,
				paid_amount: true,
				special_requests: true,
				created_at: true,
				updated_at: true,
			},
		}),
		prisma.booking.count({ where }),
	]);
	return { bookings, total, page, limit, total_pages: Math.ceil(total / limit) } as const;
}

// Overloaded function - handles both simple and role-based versions
export async function getBookingById(id: string, userRole?: Role, userId?: string): Promise<any> {
	// If role and userId are provided, use role-based version
	if (userRole && userId) {
	const booking = await prisma.booking.findUnique({
		where: { id },
		include: {
			room: {
				select: {
					id: true,
					room_number: true,
					type: true,
					floor: true,
					amenities: true,
					images: true,
				},
			},
			guest: {
				select: {
					id: true,
					first_name: true,
					last_name: true,
					email: true,
					phone: true,
				},
			},
			payments: {
				select: {
					id: true,
					amount: true,
					payment_method: true,
					status: true,
					paid_at: true,
				},
			},
			stay_record: {
				select: {
					id: true,
				},
			},
		},
	});

	if (!booking) {
		throw new Error('Booking not found');
	}

		// Role-based access control
		if (userRole === 'guest' && booking.guest_id !== userId) {
			throw new Error('Access denied');
		}

		return booking;
	}

	// Simple version - no role check (used by checkIn, checkOut)
	return prisma.booking.findUnique({
		where: { id },
		select: {
			id: true,
			room_id: true,
			guest_id: true,
			check_in_date: true,
			check_out_date: true,
			guests: true,
			status: true,
			total_amount: true,
			paid_amount: true,
			special_requests: true,
			created_at: true,
			updated_at: true,
			room: { select: { id: true, room_number: true, type: true } },
		},
	}) as any;
}

// Overloaded function - handles both simple and role-based versions
export async function createBooking(
	dataOrPayload: CreateBookingData | {
		room_id: string;
		guest_id: string;
		check_in_date: Date;
		check_out_date: Date;
		guests: number;
		special_requests?: string;
	},
	userRole?: Role,
	userId?: string
): Promise<any> {
	// If role and userId are provided, use role-based version
	if (userRole && userId && 'check_in_date' in dataOrPayload) {
		const data = dataOrPayload as CreateBookingData;
		// Validate dates
		if (data.check_in_date >= data.check_out_date) {
			throw new Error('Check-in date must be before check-out date');
		}

		if (data.check_in_date < new Date()) {
			throw new Error('Check-in date cannot be in the past');
		}

		// Check room availability
		const isAvailable = await checkRoomAvailability(data.room_id, data.check_in_date, data.check_out_date);
		if (!isAvailable) {
			throw new Error('Room is not available for the selected dates');
		}

		// Get room details for pricing
		const room = await prisma.room.findUnique({
			where: { id: data.room_id },
			select: { price_per_night: true, capacity: true },
		});

		if (!room) {
			throw new Error('Room not found');
		}

		// Check capacity
		if (data.guests > room.capacity) {
			throw new Error(`Room capacity is ${room.capacity}, but ${data.guests} guests requested`);
		}

		// Calculate total amount
		const nights = Math.ceil((data.check_out_date.getTime() - data.check_in_date.getTime()) / (1000 * 60 * 60 * 24));
		const total_amount = Number(room.price_per_night) * nights;

		// Generate confirmation code
		const confirmation_code = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

		// Create booking
		const booking = await prisma.booking.create({
			data: {
				room_id: data.room_id,
				guest_id: data.guest_id,
				check_in_date: data.check_in_date,
				check_out_date: data.check_out_date,
				guests: data.guests,
				total_amount,
				special_requests: data.special_requests,
				confirmation_code,
			},
			include: {
				room: {
					select: {
						id: true,
						room_number: true,
						type: true,
						floor: true,
					},
				},
				guest: {
					select: {
						id: true,
						first_name: true,
						last_name: true,
						email: true,
						phone: true,
					},
				},
			},
		});

		return booking;
	}

	// Simple version - no role check
	const payload = dataOrPayload as {
		room_id: string;
		guest_id: string;
		check_in_date: Date;
		check_out_date: Date;
		guests: number;
		special_requests?: string;
	};
	if (+payload.check_out_date <= +payload.check_in_date) throw BadRequest('check_out_date must be after check_in_date');
	const room = await prisma.room.findUnique({ where: { id: payload.room_id }, select: { id: true, price_per_night: true, capacity: true } });
	if (!room) throw NotFound('Room not found');
	if (payload.guests > room.capacity) throw BadRequest('Guests exceed room capacity');
	await assertRoomAvailable(payload.room_id, payload.check_in_date, payload.check_out_date);
	const nights = nightsBetween(payload.check_in_date, payload.check_out_date);
	const total = (room.price_per_night as unknown as number) * nights;
	const confirmation = Math.random().toString(36).slice(2, 8).toUpperCase();
	const booking = await prisma.booking.create({
		data: {
			room_id: payload.room_id,
			guest_id: payload.guest_id,
			check_in_date: payload.check_in_date,
			check_out_date: payload.check_out_date,
			guests: payload.guests,
			status: 'pending',
			total_amount: total,
			paid_amount: 0,
			special_requests: payload.special_requests,
			confirmation_code: confirmation,
		},
		select: { id: true, confirmation_code: true, total_amount: true, status: true },
	});
	return booking;
}

// Get bookings with filtering and pagination (role-based)
export async function getBookings(
	filters: BookingFilters = {},
	pagination: PaginationOptions = {},
	userRole: Role,
	userId: string
): Promise<BookingListResponse> {
	const {
		status,
		guest_id,
		room_id,
		check_in_date_from,
		check_in_date_to,
		check_out_date_from,
		check_out_date_to,
		guests,
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
	if (room_id) where.room_id = room_id;
	if (guests) where.guests = guests;

	// Date range filters
	if (check_in_date_from || check_in_date_to) {
		where.check_in_date = {};
		if (check_in_date_from) where.check_in_date.gte = check_in_date_from;
		if (check_in_date_to) where.check_in_date.lte = check_in_date_to;
	}

	if (check_out_date_from || check_out_date_to) {
		where.check_out_date = {};
		if (check_out_date_from) where.check_out_date.gte = check_out_date_from;
		if (check_out_date_to) where.check_out_date.lte = check_out_date_to;
	}

	// Role-based filtering
	if (userRole === 'guest') {
		where.guest_id = userId;
	}

	if (guest_id && userRole !== 'guest') {
		where.guest_id = guest_id;
	}

	// Calculate pagination
	const skip = (page - 1) * limit;

	// Build order by clause
	const orderBy: any = {};
	orderBy[sortBy] = sortOrder;

	// Execute queries
	const [bookings, total] = await Promise.all([
		prisma.booking.findMany({
			where,
			include: {
				room: {
					select: {
						id: true,
						room_number: true,
						type: true,
						floor: true,
					},
				},
				guest: {
					select: {
						id: true,
						first_name: true,
						last_name: true,
						email: true,
					},
				},
			},
			orderBy,
			skip,
			take: limit,
		}),
		prisma.booking.count({ where }),
	]);

	const totalPages = Math.ceil(total / limit);
	const hasNext = page < totalPages;
	const hasPrev = page > 1;

	return {
		bookings,
		total,
		page,
		limit,
		totalPages,
		hasNext,
		hasPrev,
	};
}

// Overloaded function - handles both simple and role-based versions
export async function updateBooking(
	id: string,
	dataOrChanges: UpdateBookingData | Partial<{ check_in_date: Date; check_out_date: Date; guests: number; status: any; special_requests?: string; paid_amount?: number }>,
	userRole?: Role,
	userId?: string
): Promise<any> {
	// If role and userId are provided, use role-based version
	if (userRole && userId && 'check_in_date' in (dataOrChanges || {})) {
		const data = dataOrChanges as UpdateBookingData;
		// Get existing booking
		const existingBooking = await prisma.booking.findUnique({
			where: { id },
			include: { room: true },
		});

		if (!existingBooking) {
			throw new Error('Booking not found');
		}

		// Role-based access control
		if (userRole === 'guest' && existingBooking.guest_id !== userId) {
			throw new Error('Access denied');
		}

		// Validate dates if being updated
		if (data.check_in_date || data.check_out_date) {
			const check_in = data.check_in_date || existingBooking.check_in_date;
			const check_out = data.check_out_date || existingBooking.check_out_date;

			if (check_in >= check_out) {
				throw new Error('Check-in date must be before check-out date');
			}

			if (check_in < new Date()) {
				throw new Error('Check-in date cannot be in the past');
			}

			// Check room availability for new dates
			const isAvailable = await checkRoomAvailability(
				existingBooking.room_id,
				check_in,
				check_out,
				id
			);
			if (!isAvailable) {
				throw new Error('Room is not available for the selected dates');
			}

			// Recalculate total amount if dates changed
			if (data.check_in_date || data.check_out_date) {
				const nights = Math.ceil((check_out.getTime() - check_in.getTime()) / (1000 * 60 * 60 * 24));
				data.total_amount = Number(existingBooking.room.price_per_night) * nights;
			}
		}

		// Update booking
		const booking = await prisma.booking.update({
			where: { id },
			data: {
				check_in_date: data.check_in_date,
				check_out_date: data.check_out_date,
				guests: data.guests,
				status: data.status,
				special_requests: data.special_requests,
				total_amount: data.total_amount,
			},
			include: {
				room: {
					select: {
						id: true,
						room_number: true,
						type: true,
						floor: true,
					},
				},
				guest: {
					select: {
						id: true,
						first_name: true,
						last_name: true,
						email: true,
					},
				},
			},
		});

		return booking;
	}

	// Simple version - no role check
	const changes = dataOrChanges as Partial<{ check_in_date: Date; check_out_date: Date; guests: number; status: any; special_requests?: string; paid_amount?: number }>;
	const existing = await prisma.booking.findUnique({ where: { id }, select: { id: true, room_id: true, status: true } });
	if (!existing) throw NotFound('Booking not found');
	if (changes.check_in_date && changes.check_out_date && +changes.check_out_date <= +changes.check_in_date) throw BadRequest('check_out_date must be after check_in_date');
	const from = changes.check_in_date ?? undefined;
	const to = changes.check_out_date ?? undefined;
	if (from && to) await assertRoomAvailable(existing.room_id, from, to, id);
	const updated = await prisma.booking.update({ where: { id }, data: changes, select: { id: true, status: true } });
	return updated;
}

// Overloaded function - handles both simple and role-based versions
export async function cancelBooking(
	id: string,
	reasonOrRole?: string | Role,
	userId?: string
): Promise<{ id?: string; status?: string; message?: string }> {
	// If userId is provided and reasonOrRole is a Role, use role-based version
	if (userId && typeof reasonOrRole === 'string' && (reasonOrRole === 'admin' || reasonOrRole === 'staff' || reasonOrRole === 'guest')) {
		const userRole = reasonOrRole as Role;
		const booking = await prisma.booking.findUnique({ where: { id }, select: { id: true, guest_id: true, status: true, check_in_date: true } });
		if (!booking) throw new Error('Booking not found');
		if (userRole === 'guest' && booking.guest_id !== userId) throw new Error('Access denied');
		if (booking.status === 'checked_in' || booking.status === 'checked_out') throw new Error('Cannot cancel a booking that is already checked in or completed');
		if (booking.status === 'cancelled') throw new Error('Booking is already cancelled');
		const checkInTime = new Date(booking.check_in_date).getTime();
		const now = new Date().getTime();
		const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);
		if (hoursUntilCheckIn < 24) throw new Error('Cannot cancel booking within 24 hours of check-in');
		await prisma.booking.update({ where: { id }, data: { status: 'cancelled' } });
		return { message: 'Booking cancelled successfully' };
	}

	// Simple version - reason is optional string
	const reason = reasonOrRole as string | undefined;
	const existing = await prisma.booking.findUnique({ where: { id }, select: { id: true, status: true } });
	if (!existing) throw NotFound('Booking not found');
	if (existing.status === 'checked_in' || existing.status === 'checked_out') throw BadRequest('Cannot cancel after check-in');
	return prisma.booking.update({ where: { id }, data: { status: 'cancelled' }, select: { id: true, status: true } });
}

export async function checkIn(booking_id: string, notes?: string, at?: Date) {
	const booking = await prisma.booking.findUnique({ where: { id: booking_id }, select: { id: true, status: true } });
	if (!booking) throw NotFound('Booking not found');
	if (booking.status !== 'confirmed' && booking.status !== 'pending') throw BadRequest('Booking not eligible for check-in');
	await prisma.$transaction([
		prisma.booking.update({ where: { id: booking_id }, data: { status: 'checked_in' } }),
		prisma.stayRecord.upsert({
			where: { booking_id },
			create: { booking_id, actual_check_in_time: at ?? new Date(), notes },
			update: { actual_check_in_time: at ?? new Date(), notes },
		}),
	]);
	return { success: true } as const;
}

export async function checkOut(booking_id: string, data: { notes?: string; at?: Date; additional_charges?: Array<{ description: string; amount: number }> }) {
	const booking = await prisma.booking.findUnique({ where: { id: booking_id }, select: { id: true, status: true } });
	if (!booking) throw NotFound('Booking not found');
	if (booking.status !== 'checked_in') throw BadRequest('Booking not eligible for check-out');
	await prisma.$transaction([
		prisma.booking.update({ where: { id: booking_id }, data: { status: 'checked_out' } }),
		prisma.stayRecord.update({ where: { booking_id }, data: { actual_check_out_time: data.at ?? new Date(), notes: data.notes, additional_charges: data.additional_charges } }),
	]);
	return { success: true } as const;
}

export async function stats(date_from?: Date, date_to?: Date) {
	const where: any = {};
	if (date_from || date_to) where.created_at = {};
	if (date_from) where.created_at.gte = date_from;
	if (date_to) where.created_at.lte = date_to;

	const [total, pending, confirmed, checked_in, checked_out, cancelled, revenue] = await prisma.$transaction([
		prisma.booking.count({ where }),
		prisma.booking.count({ where: { ...where, status: 'pending' } }),
		prisma.booking.count({ where: { ...where, status: 'confirmed' } }),
		prisma.booking.count({ where: { ...where, status: 'checked_in' } }),
		prisma.booking.count({ where: { ...where, status: 'checked_out' } }),
		prisma.booking.count({ where: { ...where, status: 'cancelled' } }),
		prisma.booking.aggregate({ _sum: { total_amount: true }, where }),
	]);
	const totalRevenue = Number(revenue._sum.total_amount ?? 0);
	const avg = total > 0 ? totalRevenue / total : 0;
	return {
		total_bookings: total,
		pending_bookings: pending,
		confirmed_bookings: confirmed,
		checked_in_bookings: checked_in,
		checked_out_bookings: checked_out,
		cancelled_bookings: cancelled,
		total_revenue: totalRevenue,
		average_booking_value: avg,
		occupancy_rate: 0,
	} as const;
}

export async function arrivals(date?: Date) {
	const target = date ?? new Date();
	const start = new Date(target);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(end.getDate() + 1);
	return prisma.booking.findMany({
		where: { check_in_date: { gte: start, lt: end }, status: { in: ['pending', 'confirmed'] } },
		select: { id: true, room_id: true, guest_id: true, check_in_date: true, status: true },
	});
}

export async function departures(date?: Date) {
	const target = date ?? new Date();
	const start = new Date(target);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(end.getDate() + 1);
	return prisma.booking.findMany({
		where: { check_out_date: { gte: start, lt: end }, status: { in: ['checked_in'] } },
		select: { id: true, room_id: true, guest_id: true, check_out_date: true, status: true },
	});
}

// Delete booking (Admin/Staff only)
export async function deleteBooking(id: string, userRole: Role): Promise<{ message: string }> {
	if (userRole === 'guest') throw new Error('Access denied');
	const booking = await prisma.booking.findUnique({ where: { id }, select: { id: true, status: true } });
	if (!booking) throw new Error('Booking not found');
	if (booking.status === 'checked_in' || booking.status === 'checked_out') throw new Error('Cannot delete a booking that is already checked in or completed');
	await prisma.booking.delete({ where: { id } });
	return { message: 'Booking deleted successfully' };
}

// Get booking statistics
export async function getBookingStats(userRole: Role, userId: string): Promise<any> {
	const where: any = {};

	// Role-based filtering
	if (userRole === 'guest') {
		where.guest_id = userId;
	}

	const [
		totalBookings,
		pendingBookings,
		confirmedBookings,
		checkedInBookings,
		completedBookings,
		cancelledBookings,
		bookingsByStatus,
	] = await Promise.all([
		prisma.booking.count({ where }),
		prisma.booking.count({ where: { ...where, status: 'pending' } }),
		prisma.booking.count({ where: { ...where, status: 'confirmed' } }),
		prisma.booking.count({ where: { ...where, status: 'checked_in' } }),
		prisma.booking.count({ where: { ...where, status: 'completed' } }),
		prisma.booking.count({ where: { ...where, status: 'cancelled' } }),
		prisma.booking.groupBy({
			by: ['status'],
			_count: { status: true },
			where,
		}),
	]);

	return {
		total: totalBookings,
		pending: pendingBookings,
		confirmed: confirmedBookings,
		checkedIn: checkedInBookings,
		completed: completedBookings,
		cancelled: cancelledBookings,
		byStatus: bookingsByStatus,
	};
}
