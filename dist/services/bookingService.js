import { PrismaClient, BookingStatus, Role } from '../../generated/prisma/index.js';
const prisma = new PrismaClient();
// Check room availability for given dates
export async function checkRoomAvailability(room_id, check_in_date, check_out_date, exclude_booking_id) {
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
// Create a new booking
export async function createBooking(data, userRole, userId) {
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
// Get booking by ID
export async function getBookingById(id, userRole, userId) {
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
// Get bookings with filtering and pagination
export async function getBookings(filters = {}, pagination = {}, userRole, userId) {
    const { status, guest_id, room_id, check_in_date_from, check_in_date_to, check_out_date_from, check_out_date_to, guests, } = filters;
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', } = pagination;
    // Build where clause for filtering
    const where = {};
    if (status)
        where.status = status;
    if (room_id)
        where.room_id = room_id;
    if (guests)
        where.guests = guests;
    // Date range filters
    if (check_in_date_from || check_in_date_to) {
        where.check_in_date = {};
        if (check_in_date_from)
            where.check_in_date.gte = check_in_date_from;
        if (check_in_date_to)
            where.check_in_date.lte = check_in_date_to;
    }
    if (check_out_date_from || check_out_date_to) {
        where.check_out_date = {};
        if (check_out_date_from)
            where.check_out_date.gte = check_out_date_from;
        if (check_out_date_to)
            where.check_out_date.lte = check_out_date_to;
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
    const orderBy = {};
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
// Update booking
export async function updateBooking(id, data, userRole, userId) {
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
        const isAvailable = await checkRoomAvailability(existingBooking.room_id, check_in, check_out, id);
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
// Cancel booking
export async function cancelBooking(id, userRole, userId) {
    const booking = await prisma.booking.findUnique({ where: { id }, select: { id: true, guest_id: true, status: true, check_in_date: true } });
    if (!booking)
        throw new Error('Booking not found');
    if (userRole === 'guest' && booking.guest_id !== userId)
        throw new Error('Access denied');
    if (booking.status === 'checked_in' || booking.status === 'checked_out')
        throw new Error('Cannot cancel a booking that is already checked in or completed');
    if (booking.status === 'cancelled')
        throw new Error('Booking is already cancelled');
    const checkInTime = new Date(booking.check_in_date).getTime();
    const now = new Date().getTime();
    const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);
    if (hoursUntilCheckIn < 24)
        throw new Error('Cannot cancel booking within 24 hours of check-in');
    await prisma.booking.update({ where: { id }, data: { status: 'cancelled' } });
    return { message: 'Booking cancelled successfully' };
}
// Delete booking (Admin/Staff only)
export async function deleteBooking(id, userRole) {
    if (userRole === 'guest')
        throw new Error('Access denied');
    const booking = await prisma.booking.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!booking)
        throw new Error('Booking not found');
    if (booking.status === 'checked_in' || booking.status === 'checked_out')
        throw new Error('Cannot delete a booking that is already checked in or completed');
    await prisma.booking.delete({ where: { id } });
    return { message: 'Booking deleted successfully' };
}
// Get booking statistics
export async function getBookingStats(userRole, userId) {
    const where = {};
    // Role-based filtering
    if (userRole === 'guest') {
        where.guest_id = userId;
    }
    const [totalBookings, pendingBookings, confirmedBookings, checkedInBookings, completedBookings, cancelledBookings, bookingsByStatus,] = await Promise.all([
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
//# sourceMappingURL=bookingService.js.map