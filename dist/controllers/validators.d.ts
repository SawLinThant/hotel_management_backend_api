import { z } from 'zod';
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    page?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export declare const roomCreateSchema: z.ZodObject<{
    room_number: z.ZodString;
    type: z.ZodEnum<["single", "double", "suite", "deluxe"]>;
    capacity: z.ZodNumber;
    price_per_night: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
    amenities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    floor: z.ZodOptional<z.ZodNumber>;
    size_sqm: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "single" | "double" | "suite" | "deluxe";
    price_per_night: number;
    capacity: number;
    room_number: string;
    amenities: string[];
    images?: string[] | undefined;
    floor?: number | undefined;
    description?: string | undefined;
    size_sqm?: number | undefined;
}, {
    type: "single" | "double" | "suite" | "deluxe";
    price_per_night: number;
    capacity: number;
    room_number: string;
    images?: string[] | undefined;
    floor?: number | undefined;
    description?: string | undefined;
    amenities?: string[] | undefined;
    size_sqm?: number | undefined;
}>;
export declare const roomUpdateSchema: z.ZodObject<{
    room_number: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["single", "double", "suite", "deluxe"]>>;
    capacity: z.ZodOptional<z.ZodNumber>;
    price_per_night: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    amenities: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    images: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    floor: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    size_sqm: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["available", "occupied", "maintenance", "cleaning"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "single" | "double" | "suite" | "deluxe" | undefined;
    status?: "available" | "occupied" | "maintenance" | "cleaning" | undefined;
    images?: string[] | undefined;
    price_per_night?: number | undefined;
    capacity?: number | undefined;
    floor?: number | undefined;
    room_number?: string | undefined;
    description?: string | undefined;
    amenities?: string[] | undefined;
    size_sqm?: number | undefined;
}, {
    type?: "single" | "double" | "suite" | "deluxe" | undefined;
    status?: "available" | "occupied" | "maintenance" | "cleaning" | undefined;
    images?: string[] | undefined;
    price_per_night?: number | undefined;
    capacity?: number | undefined;
    floor?: number | undefined;
    room_number?: string | undefined;
    description?: string | undefined;
    amenities?: string[] | undefined;
    size_sqm?: number | undefined;
}>;
export declare const roomAvailabilityQuerySchema: z.ZodObject<{
    check_in_date: z.ZodDate;
    check_out_date: z.ZodDate;
    guests: z.ZodOptional<z.ZodNumber>;
    room_type: z.ZodOptional<z.ZodEnum<["single", "double", "suite", "deluxe"]>>;
}, "strip", z.ZodTypeAny, {
    check_in_date: Date;
    check_out_date: Date;
    guests?: number | undefined;
    room_type?: "single" | "double" | "suite" | "deluxe" | undefined;
}, {
    check_in_date: Date;
    check_out_date: Date;
    guests?: number | undefined;
    room_type?: "single" | "double" | "suite" | "deluxe" | undefined;
}>;
export declare const bookingCreateSchema: z.ZodObject<{
    room_id: z.ZodString;
    check_in_date: z.ZodDate;
    check_out_date: z.ZodDate;
    guests: z.ZodNumber;
    guest_info: z.ZodObject<{
        first_name: z.ZodString;
        last_name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        date_of_birth: z.ZodOptional<z.ZodString>;
        nationality: z.ZodOptional<z.ZodString>;
        passport_number: z.ZodOptional<z.ZodString>;
        id_card_number: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        first_name: string;
        last_name: string;
        phone?: string | undefined;
        address?: string | undefined;
        city?: string | undefined;
        country?: string | undefined;
        date_of_birth?: string | undefined;
        nationality?: string | undefined;
        passport_number?: string | undefined;
        id_card_number?: string | undefined;
    }, {
        email: string;
        first_name: string;
        last_name: string;
        phone?: string | undefined;
        address?: string | undefined;
        city?: string | undefined;
        country?: string | undefined;
        date_of_birth?: string | undefined;
        nationality?: string | undefined;
        passport_number?: string | undefined;
        id_card_number?: string | undefined;
    }>;
    special_requests: z.ZodOptional<z.ZodString>;
    payment_method: z.ZodOptional<z.ZodEnum<["cash", "card", "online", "bank_transfer"]>>;
}, "strip", z.ZodTypeAny, {
    room_id: string;
    check_in_date: Date;
    check_out_date: Date;
    guests: number;
    guest_info: {
        email: string;
        first_name: string;
        last_name: string;
        phone?: string | undefined;
        address?: string | undefined;
        city?: string | undefined;
        country?: string | undefined;
        date_of_birth?: string | undefined;
        nationality?: string | undefined;
        passport_number?: string | undefined;
        id_card_number?: string | undefined;
    };
    special_requests?: string | undefined;
    payment_method?: "cash" | "card" | "online" | "bank_transfer" | undefined;
}, {
    room_id: string;
    check_in_date: Date;
    check_out_date: Date;
    guests: number;
    guest_info: {
        email: string;
        first_name: string;
        last_name: string;
        phone?: string | undefined;
        address?: string | undefined;
        city?: string | undefined;
        country?: string | undefined;
        date_of_birth?: string | undefined;
        nationality?: string | undefined;
        passport_number?: string | undefined;
        id_card_number?: string | undefined;
    };
    special_requests?: string | undefined;
    payment_method?: "cash" | "card" | "online" | "bank_transfer" | undefined;
}>;
export declare const bookingUpdateSchema: z.ZodObject<{
    check_in_date: z.ZodOptional<z.ZodDate>;
    check_out_date: z.ZodOptional<z.ZodDate>;
    guests: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "checked_in", "checked_out", "cancelled"]>>;
    special_requests: z.ZodOptional<z.ZodString>;
    paid_amount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | undefined;
    check_in_date?: Date | undefined;
    check_out_date?: Date | undefined;
    guests?: number | undefined;
    paid_amount?: number | undefined;
    special_requests?: string | undefined;
}, {
    status?: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | undefined;
    check_in_date?: Date | undefined;
    check_out_date?: Date | undefined;
    guests?: number | undefined;
    paid_amount?: number | undefined;
    special_requests?: string | undefined;
}>;
export declare const checkInSchema: z.ZodObject<{
    booking_id: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    actual_check_in_time: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    booking_id: string;
    notes?: string | undefined;
    actual_check_in_time?: Date | undefined;
}, {
    booking_id: string;
    notes?: string | undefined;
    actual_check_in_time?: Date | undefined;
}>;
export declare const checkOutSchema: z.ZodObject<{
    booking_id: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    actual_check_out_time: z.ZodOptional<z.ZodDate>;
    additional_charges: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        amount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        description: string;
        amount: number;
    }, {
        description: string;
        amount: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    booking_id: string;
    notes?: string | undefined;
    actual_check_out_time?: Date | undefined;
    additional_charges?: {
        description: string;
        amount: number;
    }[] | undefined;
}, {
    booking_id: string;
    notes?: string | undefined;
    actual_check_out_time?: Date | undefined;
    additional_charges?: {
        description: string;
        amount: number;
    }[] | undefined;
}>;
export declare const userAdminCreateSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["guest", "staff", "admin"]>>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    role?: "admin" | "staff" | "guest" | undefined;
    phone?: string | undefined;
}, {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    role?: "admin" | "staff" | "guest" | undefined;
    phone?: string | undefined;
}>;
export declare const userAdminUpdateSchema: z.ZodObject<{
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["guest", "staff", "admin"]>>;
    is_active: z.ZodOptional<z.ZodBoolean>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role?: "admin" | "staff" | "guest" | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    phone?: string | undefined;
    is_active?: boolean | undefined;
}, {
    role?: "admin" | "staff" | "guest" | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    phone?: string | undefined;
    is_active?: boolean | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map