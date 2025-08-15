import { PrismaClient, Role, BookingStatus } from '../../generated/prisma/index.js';
const prisma = new PrismaClient();
// Create a new stay record (check-in)
export async function createStayRecord(data, userRole, userId) {
    // Get booking details
    const booking = await prisma.booking.findUnique({
        where: { id: data.booking_id },
        include: {
            room: true,
            guest: true,
        },
    });
    if (!booking) {
        throw new Error('Booking not found');
    }
    // Role-based access control
    if (userRole === 'guest' && booking.guest_id !== userId) {
        throw new Error('Access denied');
    }
    // Check if stay record already exists
    const existingStayRecord = await prisma.stayRecord.findUnique({
        where: { booking_id: data.booking_id },
    });
    if (existingStayRecord) {
        throw new Error('Stay record already exists for this booking');
    }
    // Validate booking status
    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
        throw new Error('Booking must be confirmed or pending to create stay record');
    }
    // Set check-in time if not provided
    const actual_check_in_time = data.check_in_time || new Date();
    // Create stay record
    const stayRecord = await prisma.stayRecord.create({
        data: {
            booking_id: data.booking_id,
            actual_check_in_time,
            notes: data.notes ?? null,
            additional_charges: undefined,
        },
        include: {
            booking: {
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
            },
        },
    });
    // Update booking status to checked_in
    await prisma.booking.update({
        where: { id: data.booking_id },
        data: { status: 'checked_in' },
    });
    // Update room status to occupied
    await prisma.room.update({
        where: { id: booking.room_id },
        data: { status: 'occupied' },
    });
    return stayRecord;
}
// Get stay record by ID
export async function getStayRecordById(id, userRole, userId) {
    const stayRecord = await prisma.stayRecord.findUnique({
        where: { id },
        include: {
            booking: {
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
                    payments: {
                        select: {
                            id: true,
                            amount: true,
                            payment_method: true,
                            status: true,
                            paid_at: true,
                        },
                    },
                },
            },
        },
    });
    if (!stayRecord) {
        throw new Error('Stay record not found');
    }
    // Role-based access control
    if (userRole === 'guest' && stayRecord.booking.guest_id !== userId) {
        throw new Error('Access denied');
    }
    return stayRecord;
}
// Get stay records with filtering and pagination
export async function getStayRecords(filters = {}, pagination = {}, userRole, userId) {
    const { booking_id, guest_id, room_id, check_in_date_from, check_in_date_to, check_out_date_from, check_out_date_to, has_incidents, } = filters;
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', } = pagination;
    // Build where clause for filtering
    const where = {};
    if (booking_id)
        where.booking_id = booking_id;
    // Date range filters map to actual_* fields
    if (check_in_date_from || check_in_date_to) {
        where.actual_check_in_time = {};
        if (check_in_date_from)
            where.actual_check_in_time.gte = check_in_date_from;
        if (check_in_date_to)
            where.actual_check_in_time.lte = check_in_date_to;
    }
    if (check_out_date_from || check_out_date_to) {
        where.actual_check_out_time = {};
        if (check_out_date_from)
            where.actual_check_out_time.gte = check_out_date_from;
        if (check_out_date_to)
            where.actual_check_out_time.lte = check_out_date_to;
    }
    // Incidents field not present in schema; skip filter
    if (has_incidents !== undefined) {
        // No-op or adapt if you later add incidents array
    }
    // Role-based filtering
    if (userRole === 'guest') {
        where.booking = { guest_id: userId };
    }
    else {
        if (guest_id)
            where.booking = { guest_id };
        if (room_id)
            where.booking = { room_id };
    }
    // Calculate pagination
    const skip = (page - 1) * limit;
    // Build order by clause
    const orderBy = {};
    orderBy[sortBy === 'check_in_time' ? 'actual_check_in_time' : sortBy === 'check_out_time' ? 'actual_check_out_time' : 'created_at'] = sortOrder;
    // Execute queries
    const [stayRecords, total] = await Promise.all([
        prisma.stayRecord.findMany({
            where,
            include: {
                booking: {
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
                },
            },
            orderBy,
            skip,
            take: limit,
        }),
        prisma.stayRecord.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    return {
        stayRecords,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
    };
}
// Update stay record
export async function updateStayRecord(id, data, userRole, userId) {
    // Get existing stay record
    const existingStayRecord = await prisma.stayRecord.findUnique({
        where: { id },
        include: {
            booking: {
                select: {
                    id: true,
                    guest_id: true,
                    status: true,
                },
            },
        },
    });
    if (!existingStayRecord) {
        throw new Error('Stay record not found');
    }
    // Role-based access control
    if (userRole === 'guest' && existingStayRecord.booking.guest_id !== userId) {
        throw new Error('Access denied');
    }
    // Update stay record
    const stayRecord = await prisma.stayRecord.update({
        where: { id },
        data: {
            actual_check_in_time: data.check_in_time,
            actual_check_out_time: data.check_out_time,
            notes: data.notes,
            // additional fields could be updated here when added to schema
        },
        include: {
            booking: {
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
            },
        },
    });
    return stayRecord;
}
// Check-out guest (complete stay)
export async function checkOutGuest(id, userRole, userId, checkOutData) {
    // Get existing stay record
    const existingStayRecord = await prisma.stayRecord.findUnique({
        where: { id },
        include: {
            booking: {
                select: {
                    id: true,
                    guest_id: true,
                    room_id: true,
                    status: true,
                },
            },
        },
    });
    if (!existingStayRecord) {
        throw new Error('Stay record not found');
    }
    // Role-based access control
    if (userRole === 'guest' && existingStayRecord.booking.guest_id !== userId) {
        throw new Error('Access denied');
    }
    // Check if already checked out
    if (existingStayRecord.actual_check_out_time) {
        throw new Error('Guest is already checked out');
    }
    // Set check-out time
    const actual_check_out_time = checkOutData?.check_out_time || new Date();
    // Update stay record
    const stayRecord = await prisma.stayRecord.update({
        where: { id },
        data: {
            actual_check_out_time,
            notes: checkOutData?.notes,
        },
        include: {
            booking: {
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
            },
        },
    });
    // Update booking status to completed
    await prisma.booking.update({
        where: { id: existingStayRecord.booking.id },
        data: { status: 'completed' },
    });
    // Update room status to cleaning
    await prisma.room.update({
        where: { id: existingStayRecord.booking.room_id },
        data: { status: 'cleaning' },
    });
    return stayRecord;
}
// Delete stay record (Admin/Staff only)
export async function deleteStayRecord(id, userRole) {
    if (userRole === 'guest') {
        throw new Error('Access denied');
    }
    const stayRecord = await prisma.stayRecord.findUnique({
        where: { id },
        select: { id: true, actual_check_out_time: true },
    });
    if (!stayRecord) {
        throw new Error('Stay record not found');
    }
    // Cannot delete if guest is checked out
    if (stayRecord.actual_check_out_time) {
        throw new Error('Cannot delete stay record for checked-out guest');
    }
    await prisma.stayRecord.delete({
        where: { id },
    });
    return { message: 'Stay record deleted successfully' };
}
// Get stay record statistics
export async function getStayRecordStats(userRole, userId) {
    const where = {};
    // Role-based filtering
    if (userRole === 'guest') {
        where.booking = { guest_id: userId };
    }
    const [totalStayRecords, activeStays, completedStays, staysWithIncidents,] = await Promise.all([
        prisma.stayRecord.count({ where }),
        prisma.stayRecord.count({
            where: { ...where, actual_check_out_time: null },
        }),
        prisma.stayRecord.count({
            where: { ...where, actual_check_out_time: { not: null } },
        }),
        // If incidents tracking is added, adjust this filter
        prisma.stayRecord.count({ where }),
    ]);
    return {
        total: totalStayRecords,
        active: activeStays,
        completed: completedStays,
        withIncidents: staysWithIncidents,
    };
}
//# sourceMappingURL=stayRecordService.js.map