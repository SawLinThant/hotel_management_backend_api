# 📅 Booking & Stay Record Management API Testing Guide

## Overview

The booking and stay record management system provides comprehensive operations for hotel reservations, guest check-ins, check-outs, and stay tracking with role-based access control for admin, staff, and guest users.

## 🔗 **API Endpoints**

### **Base URL**: `http://localhost:3000/api`

---

## 📅 **1. Booking Management APIs**

### **Create Booking**
**URL**: `POST /api/bookings`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer your_access_token
```

**Request Body**:
```json
{
  "room_id": "room_id_here",
  "guest_id": "guest_id_here",
  "check_in_date": "2024-01-15T14:00:00.000Z",
  "check_out_date": "2024-01-18T11:00:00.000Z",
  "guests": 2,
  "special_requests": "Early check-in preferred, extra towels"
}
```

**Expected Success Response (201)**:
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "booking_id_here",
    "room_id": "room_id_here",
    "guest_id": "guest_id_here",
    "check_in_date": "2024-01-15T14:00:00.000Z",
    "check_out_date": "2024-01-18T11:00:00.000Z",
    "guests": 2,
    "status": "pending",
    "total_amount": "450.00",
    "paid_amount": "0.00",
    "special_requests": "Early check-in preferred, extra towels",
    "confirmation_code": "BK1705320000ABC12",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "room": {
      "id": "room_id_here",
      "room_number": "101",
      "type": "single",
      "floor": 1
    },
    "guest": {
      "id": "guest_id_here",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890"
    }
  }
}
```

---

### **Get All Bookings**
**URL**: `GET /api/bookings`

**Headers**:
```
Authorization: Bearer your_access_token
```

**Query Parameters**:
```
?page=1&limit=10&sortBy=check_in_date&sortOrder=desc
?status=confirmed&guest_id=guest_id_here
?room_id=room_id_here&check_in_date_from=2024-01-01T00:00:00.000Z
?check_out_date_to=2024-01-31T23:59:59.000Z&guests=2
```

**Expected Success Response (200)**:
```json
{
  "message": "Bookings retrieved successfully",
  "bookings": [
    {
      "id": "booking_id_here",
      "room_id": "room_id_here",
      "guest_id": "guest_id_here",
      "check_in_date": "2024-01-15T14:00:00.000Z",
      "check_out_date": "2024-01-18T11:00:00.000Z",
      "guests": 2,
      "status": "confirmed",
      "total_amount": "450.00",
      "paid_amount": "0.00",
      "special_requests": "Early check-in preferred",
      "confirmation_code": "BK1705320000ABC12",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "room": {
        "id": "room_id_here",
        "room_number": "101",
        "type": "single",
        "floor": 1
      },
      "guest": {
        "id": "guest_id_here",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "hasNext": true,
  "hasPrev": false
}
```

---

### **Get Booking by ID**
**URL**: `GET /api/bookings/:id`

**Headers**:
```
Authorization: Bearer your_access_token
```

**Expected Success Response (200)**:
```json
{
  "booking": {
    "id": "booking_id_here",
    "room_id": "room_id_here",
    "guest_id": "guest_id_here",
    "check_in_date": "2024-01-15T14:00:00.000Z",
    "check_out_date": "2024-01-18T11:00:00.000Z",
    "guests": 2,
    "status": "confirmed",
    "total_amount": "450.00",
    "paid_amount": "0.00",
    "special_requests": "Early check-in preferred",
    "confirmation_code": "BK1705320000ABC12",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "room": {
      "id": "room_id_here",
      "room_number": "101",
      "type": "single",
      "floor": 1,
      "amenities": {
        "wifi": true,
        "tv": true,
        "ac": true
      },
      "images": [
        "https://example.com/room101-1.jpg"
      ]
    },
    "guest": {
      "id": "guest_id_here",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890"
    },
    "payments": [
      {
        "id": "payment_id_here",
        "amount": "225.00",
        "payment_method": "credit_card",
        "status": "completed",
        "paid_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "stay_record": {
      "id": "stay_record_id_here",
      "check_in_time": "2024-01-15T14:30:00.000Z",
      "check_out_time": null,
      "notes": "Guest arrived on time",
      "room_condition": "Good",
      "amenities_used": ["wifi", "tv"],
      "incidents": []
    }
  }
}
```

---

### **Update Booking**
**URL**: `PUT /api/bookings/:id`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer your_access_token
```

**Request Body**:
```json
{
  "check_in_date": "2024-01-16T14:00:00.000Z",
  "check_out_date": "2024-01-19T11:00:00.000Z",
  "guests": 3,
  "status": "confirmed",
  "special_requests": "Updated special requests"
}
```

**Expected Success Response (200)**:
```json
{
  "message": "Booking updated successfully",
  "booking": {
    "id": "booking_id_here",
    "room_id": "room_id_here",
    "guest_id": "guest_id_here",
    "check_in_date": "2024-01-16T14:00:00.000Z",
    "check_out_date": "2024-01-19T11:00:00.000Z",
    "guests": 3,
    "status": "confirmed",
    "total_amount": "675.00",
    "paid_amount": "0.00",
    "special_requests": "Updated special requests",
    "confirmation_code": "BK1705320000ABC12",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "room": {
      "id": "room_id_here",
      "room_number": "101",
      "type": "single",
      "floor": 1
    },
    "guest": {
      "id": "guest_id_here",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com"
    }
  }
}
```

---

### **Cancel Booking**
**URL**: `POST /api/bookings/:id/cancel`

**Headers**:
```
Authorization: Bearer your_access_token
```

**Expected Success Response (200)**:
```json
{
  "message": "Booking cancelled successfully"
}
```

---

### **Delete Booking (Admin/Staff only)**
**URL**: `DELETE /api/bookings/:id`

**Headers**:
```
Authorization: Bearer your_access_token
```

**Expected Success Response (200)**:
```json
{
  "message": "Booking deleted successfully"
}
```

---

### **Get Booking Statistics**
**URL**: `GET /api/bookings/stats/overview`

**Headers**:
```
Authorization: Bearer your_access_token
```

**Expected Success Response (200)**:
```json
{
  "message": "Booking statistics retrieved successfully",
  "stats": {
    "total": 100,
    "pending": 15,
    "confirmed": 25,
    "checkedIn": 10,
    "completed": 40,
    "cancelled": 10,
    "byStatus": [
      {
        "status": "pending",
        "_count": {
          "status": 15
        }
      },
      {
        "status": "confirmed",
        "_count": {
          "status": 25
        }
      }
    ]
  }
}
```

---

## 🏨 **2. Stay Record Management APIs**

### **Create Stay Record (Check-in)**
**URL**: `POST /api/stay-records`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer your_access_token
```

**Request Body**:
```json
{
  "booking_id": "booking_id_here",
  "check_in_time": "2024-01-15T14:30:00.000Z",
  "notes": "Guest arrived on time, room ready",
  "room_condition": "Excellent",
  "amenities_used": ["wifi", "tv", "ac"],
  "incidents": []
}
```

**Expected Success Response (201)**:
```json
{
  "message": "Guest checked in successfully",
  "stayRecord": {
    "id": "stay_record_id_here",
    "booking_id": "booking_id_here",
    "check_in_time": "2024-01-15T14:30:00.000Z",
    "check_out_time": null,
    "notes": "Guest arrived on time, room ready",
    "room_condition": "Excellent",
    "amenities_used": ["wifi", "tv", "ac"],
    "incidents": [],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "booking": {
      "room": {
        "id": "room_id_here",
        "room_number": "101",
        "type": "single",
        "floor": 1
      },
      "guest": {
        "id": "guest_id_here",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      }
    }
  }
}
```

---

### **Get All Stay Records**
**URL**: `GET /api/stay-records`

**Headers**:
```
Authorization: Bearer your_access_token
```

**Query Parameters**:
```
?page=1&limit=10&sortBy=check_in_time&sortOrder=desc
?booking_id=booking_id_here&guest_id=guest_id_here
?room_id=room_id_here&has_incidents=true
?check_in_date_from=2024-01-01T00:00:00.000Z&check_in_date_to=2024-01-31T23:59:59.000Z
```

**Expected Success Response (200)**:
```json
{
  "message": "Stay records retrieved successfully",
  "stayRecords": [
    {
      "id": "stay_record_id_here",
      "booking_id": "booking_id_here",
      "check_in_time": "2024-01-15T14:30:00.000Z",
      "check_out_time": null,
      "notes": "Guest arrived on time",
      "room_condition": "Excellent",
      "amenities_used": ["wifi", "tv", "ac"],
      "incidents": [],
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "booking": {
        "room": {
          "id": "room_id_here",
          "room_number": "101",
          "type": "single",
          "floor": 1
        },
        "guest": {
          "id": "guest_id_here",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@example.com"
        }
      }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": false
}
```

---

### **Get Stay Record by ID**
**URL**: `GET /api/stay-records/:id`

**Headers**:
```
Authorization: Bearer your_access_token
```

**Expected Success Response (200)**:
```json
{
  "stayRecord": {
    "id": "stay_record_id_here",
    "booking_id": "booking_id_here",
    "check_in_time": "2024-01-15T14:30:00.000Z",
    "check_out_time": null,
    "notes": "Guest arrived on time",
    "room_condition": "Excellent",
    "amenities_used": ["wifi", "tv", "ac"],
    "incidents": [],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "booking": {
      "room": {
        "id": "room_id_here",
        "room_number": "101",
        "type": "single",
        "floor": 1,
        "amenities": {
          "wifi": true,
          "tv": true,
          "ac": true
        }
      },
      "guest": {
        "id": "guest_id_here",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890"
      },
      "payments": [
        {
          "id": "payment_id_here",
          "amount": "225.00",
          "payment_method": "credit_card",
          "status": "completed",
          "paid_at": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

---

### **Update Stay Record**
**URL**: `PUT /api/stay-records/:id`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer your_access_token
```

**Request Body**:
```json
{
  "notes": "Updated notes about guest stay",
  "room_condition": "Good",
  "amenities_used": ["wifi", "tv", "ac", "minibar"],
  "incidents": ["Minor issue with TV remote"]
}
```

**Expected Success Response (200)**:
```json
{
  "message": "Stay record updated successfully",
  "stayRecord": {
    "id": "stay_record_id_here",
    "booking_id": "booking_id_here",
    "check_in_time": "2024-01-15T14:30:00.000Z",
    "check_out_time": null,
    "notes": "Updated notes about guest stay",
    "room_condition": "Good",
    "amenities_used": ["wifi", "tv", "ac", "minibar"],
    "incidents": ["Minor issue with TV remote"],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "booking": {
      "room": {
        "id": "room_id_here",
        "room_number": "101",
        "type": "single",
        "floor": 1
      },
      "guest": {
        "id": "guest_id_here",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      }
    }
  }
}
```

---

### **Check-out Guest**
**URL**: `POST /api/stay-records/:id/checkout`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer your_access_token
```

**Request Body**:
```json
{
  "check_out_time": "2024-01-18T11:00:00.000Z",
  "notes": "Guest checked out on time, room in good condition",
  "room_condition": "Good",
  "incidents": ["Minor issue with TV remote resolved"]
}
```

**Expected Success Response (200)**:
```json
{
  "message": "Guest checked out successfully",
  "stayRecord": {
    "id": "stay_record_id_here",
    "booking_id": "booking_id_here",
    "check_in_time": "2024-01-15T14:30:00.000Z",
    "check_out_time": "2024-01-18T11:00:00.000Z",
    "notes": "Guest checked out on time, room in good condition",
    "room_condition": "Good",
    "amenities_used": ["wifi", "tv", "ac", "minibar"],
    "incidents": ["Minor issue with TV remote resolved"],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "booking": {
      "room": {
        "id": "room_id_here",
        "room_number": "101",
        "type": "single",
        "floor": 1
      },
      "guest": {
        "id": "guest_id_here",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      }
    }
  }
}
```

---

### **Delete Stay Record (Admin/Staff only)**
**URL**: `DELETE /api/stay-records/:id`

**Headers**:
```
Authorization: Bearer your_access_token
```

**Expected Success Response (200)**:
```json
{
  "message": "Stay record deleted successfully"
}
```

---

### **Get Stay Record Statistics**
**URL**: `GET /api/stay-records/stats/overview`

**Headers**:
```
Authorization: Bearer your_access_token
```

**Expected Success Response (200)**:
```json
{
  "message": "Stay record statistics retrieved successfully",
  "stats": {
    "total": 75,
    "active": 15,
    "completed": 60,
    "withIncidents": 5,
    "averageDuration": {
      "_avg": {
        "check_in_time": "2024-01-01T00:00:00.000Z",
        "check_out_time": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

---

## 🧪 **Testing Workflow**

### **Step 1: Create a Booking**
```bash
# First, login to get access token
POST http://localhost:3000/api/auth/guest/login
{
  "email": "guest@example.com",
  "password": "guestpass123",
  "role": "guest"
}

# Then create a booking
POST http://localhost:3000/api/bookings
Authorization: Bearer your_access_token
{
  "room_id": "room_id_here",
  "guest_id": "guest_id_here",
  "check_in_date": "2024-01-15T14:00:00.000Z",
  "check_out_date": "2024-01-18T11:00:00.000Z",
  "guests": 2,
  "special_requests": "Early check-in preferred"
}
```

### **Step 2: Check-in Guest (Create Stay Record)**
```bash
# Create stay record for check-in
POST http://localhost:3000/api/stay-records
Authorization: Bearer your_access_token
{
  "booking_id": "booking_id_from_step_1",
  "check_in_time": "2024-01-15T14:30:00.000Z",
  "notes": "Guest arrived on time, room ready",
  "room_condition": "Excellent",
  "amenities_used": ["wifi", "tv", "ac"],
  "incidents": []
}
```

### **Step 3: Update Stay Record**
```bash
# Update stay record during stay
PUT http://localhost:3000/api/stay-records/stay_record_id_here
Authorization: Bearer your_access_token
{
  "notes": "Guest is comfortable, requested extra towels",
  "amenities_used": ["wifi", "tv", "ac", "minibar"],
  "incidents": ["Minor issue with TV remote"]
}
```

### **Step 4: Check-out Guest**
```bash
# Check-out guest
POST http://localhost:3000/api/stay-records/stay_record_id_here/checkout
Authorization: Bearer your_access_token
{
  "check_out_time": "2024-01-18T11:00:00.000Z",
  "notes": "Guest checked out on time, room in good condition",
  "room_condition": "Good",
  "incidents": ["Minor issue with TV remote resolved"]
}
```

### **Step 5: View All Records**
```bash
# Get all bookings
GET http://localhost:3000/api/bookings?status=completed&page=1&limit=10

# Get all stay records
GET http://localhost:3000/api/stay-records?has_incidents=false&page=1&limit=10

# Get statistics
GET http://localhost:3000/api/bookings/stats/overview
GET http://localhost:3000/api/stay-records/stats/overview
```

---

## 🔄 **Frontend Integration Examples**

### **Booking Management Component**
```typescript
// components/BookingManagement.tsx
import React, { useState, useEffect } from 'react';

interface Booking {
  id: string;
  room: { room_number: string; type: string; floor: number };
  guest: { first_name: string; last_name: string; email: string };
  check_in_date: string;
  check_out_date: string;
  guests: number;
  status: string;
  total_amount: string;
  confirmation_code: string;
}

export const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    guest_id: '',
    room_id: '',
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/bookings?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: any) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(bookingData),
      });
      
      if (response.ok) {
        alert('Booking created successfully!');
        fetchBookings();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        alert('Booking cancelled successfully!');
        fetchBookings();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  return (
    <div>
      <h2>Booking Management</h2>
      
      {/* Filters */}
      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked In</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="bookings-list">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            <h3>Booking #{booking.confirmation_code}</h3>
            <p>Room: {booking.room.room_number} ({booking.room.type})</p>
            <p>Guest: {booking.guest.first_name} {booking.guest.last_name}</p>
            <p>Check-in: {new Date(booking.check_in_date).toLocaleDateString()}</p>
            <p>Check-out: {new Date(booking.check_out_date).toLocaleDateString()}</p>
            <p>Status: {booking.status}</p>
            <p>Total: ${booking.total_amount}</p>
            
            {booking.status === 'confirmed' && (
              <button onClick={() => cancelBooking(booking.id)}>
                Cancel Booking
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **Stay Record Management Component**
```typescript
// components/StayRecordManagement.tsx
import React, { useState, useEffect } from 'react';

interface StayRecord {
  id: string;
  booking: {
    room: { room_number: string; type: string; floor: number };
    guest: { first_name: string; last_name: string; email: string };
  };
  check_in_time: string;
  check_out_time: string | null;
  notes: string;
  room_condition: string;
  amenities_used: string[];
  incidents: string[];
}

export const StayRecordManagement: React.FC = () => {
  const [stayRecords, setStayRecords] = useState<StayRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStayRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stay-records', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      setStayRecords(data.stayRecords);
    } catch (error) {
      console.error('Failed to fetch stay records:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkInGuest = async (stayRecordData: any) => {
    try {
      const response = await fetch('/api/stay-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(stayRecordData),
      });
      
      if (response.ok) {
        alert('Guest checked in successfully!');
        fetchStayRecords();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to check in guest:', error);
    }
  };

  const checkOutGuest = async (stayRecordId: string, checkOutData: any) => {
    try {
      const response = await fetch(`/api/stay-records/${stayRecordId}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(checkOutData),
      });
      
      if (response.ok) {
        alert('Guest checked out successfully!');
        fetchStayRecords();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to check out guest:', error);
    }
  };

  useEffect(() => {
    fetchStayRecords();
  }, []);

  return (
    <div>
      <h2>Stay Record Management</h2>
      
      {/* Stay Records List */}
      <div className="stay-records-list">
        {stayRecords.map((record) => (
          <div key={record.id} className="stay-record-card">
            <h3>Room {record.booking.room.room_number}</h3>
            <p>Guest: {record.booking.guest.first_name} {record.booking.guest.last_name}</p>
            <p>Check-in: {new Date(record.check_in_time).toLocaleString()}</p>
            <p>Check-out: {record.check_out_time ? new Date(record.check_out_time).toLocaleString() : 'Not checked out'}</p>
            <p>Status: {record.check_out_time ? 'Completed' : 'Active'}</p>
            <p>Notes: {record.notes}</p>
            <p>Room Condition: {record.room_condition}</p>
            <p>Amenities Used: {record.amenities_used.join(', ')}</p>
            {record.incidents.length > 0 && (
              <p>Incidents: {record.incidents.join(', ')}</p>
            )}
            
            {!record.check_out_time && (
              <button onClick={() => checkOutGuest(record.id, { notes: 'Guest checked out' })}>
                Check Out
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🛡️ **Security Features**

### **1. Role-Based Access Control**
- **All endpoints require authentication**
- **Guests can only access their own bookings and stay records**
- **Staff and Admin can access all records**
- **Delete operations restricted to Admin/Staff only**

### **2. Business Logic Protection**
- **Room availability checking** before booking creation
- **Date validation** for check-in/check-out
- **Status validation** for operations
- **Capacity checking** for room bookings

### **3. Data Validation**
- **Zod schemas** for all input validation
- **Date format validation** for all date fields
- **Required field validation**
- **Business rule enforcement**

---

## 📋 **Query Parameters Reference**

### **Booking Filters**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Booking status filter | `?status=confirmed` |
| `guest_id` | string | Guest ID filter | `?guest_id=guest_123` |
| `room_id` | string | Room ID filter | `?room_id=room_456` |
| `check_in_date_from` | string | Check-in date from | `?check_in_date_from=2024-01-01T00:00:00.000Z` |
| `check_in_date_to` | string | Check-in date to | `?check_in_date_to=2024-01-31T23:59:59.000Z` |
| `check_out_date_from` | string | Check-out date from | `?check_out_date_from=2024-01-01T00:00:00.000Z` |
| `check_out_date_to` | string | Check-out date to | `?check_out_date_to=2024-01-31T23:59:59.000Z` |
| `guests` | number | Number of guests | `?guests=2` |

### **Stay Record Filters**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `booking_id` | string | Booking ID filter | `?booking_id=booking_123` |
| `guest_id` | string | Guest ID filter | `?guest_id=guest_456` |
| `room_id` | string | Room ID filter | `?room_id=room_789` |
| `has_incidents` | boolean | Incidents filter | `?has_incidents=true` |

---

## 🚀 **Performance Tips**

1. **Use pagination** for large datasets
2. **Combine filters** to reduce result sets
3. **Cache frequently accessed data**
4. **Use appropriate indexes** on database
5. **Implement lazy loading** in frontend

---

## 📝 **Error Handling**

### **Common Error Responses**
- **400**: Validation errors, invalid parameters
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **409**: Conflict (room unavailable, already checked in/out)
- **500**: Internal server error

The booking and stay record management APIs are now ready for production use with comprehensive security, validation, and role-based access control! 🎉
