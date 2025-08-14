# 🏠 Room Management API Testing Guide

## Overview

The room management system provides comprehensive CRUD operations for hotel rooms with advanced filtering, pagination, and role-based access control.

## 🔗 **API Endpoints**

### **Base URL**: `http://localhost:3000/api`

---

## 📋 **1. Get All Rooms (Public)**

**URL**: `GET /api/rooms`

**Headers**: None required

**Query Parameters**:
```
?page=1&limit=10&sortBy=price_per_night&sortOrder=desc
?status=available&capacity=2&type=single
?price_per_night_min=50&price_per_night_max=200
?search=suite&floor=3
```

**Expected Success Response (200)**:
```json
{
  "message": "Rooms retrieved successfully",
  "rooms": [
    {
      "id": "room_id_here",
      "room_number": "101",
      "type": "single",
      "status": "available",
      "capacity": 2,
      "price_per_night": "150.00",
      "description": "Comfortable single room with city view",
      "amenities": {
        "wifi": true,
        "tv": true,
        "ac": true,
        "breakfast": false
      },
      "images": [
        "https://example.com/room101-1.jpg",
        "https://example.com/room101-2.jpg"
      ],
      "floor": 1,
      "size_sqm": "25.50",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "_count": {
        "bookings": 0
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

## 🔍 **2. Get Room by ID (Public)**

**URL**: `GET /api/rooms/:id`

**Headers**: None required

**Expected Success Response (200)**:
```json
{
  "room": {
    "id": "room_id_here",
    "room_number": "101",
    "type": "single",
    "status": "available",
    "capacity": 2,
    "price_per_night": "150.00",
    "description": "Comfortable single room with city view",
    "amenities": {
      "wifi": true,
      "tv": true,
      "ac": true,
      "breakfast": false
    },
    "images": [
      "https://example.com/room101-1.jpg",
      "https://example.com/room101-2.jpg"
    ],
    "floor": 1,
    "size_sqm": "25.50",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "_count": {
      "bookings": 0
    }
  }
}
```

**Error Response (404)**:
```json
{
  "message": "Room not found"
}
```

---

## ➕ **3. Create Room (Admin Only)**

**URL**: `POST /api/rooms`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer your_admin_access_token
```

**Request Body**:
```json
{
  "room_number": "201",
  "type": "double",
  "capacity": 4,
  "price_per_night": 250.00,
  "description": "Spacious double room with balcony",
  "amenities": {
    "wifi": true,
    "tv": true,
    "ac": true,
    "breakfast": true,
    "balcony": true,
    "minibar": true
  },
  "images": [
    "https://example.com/room201-1.jpg",
    "https://example.com/room201-2.jpg"
  ],
  "floor": 2,
  "size_sqm": 35.00
}
```

**Expected Success Response (201)**:
```json
{
  "message": "Room created successfully",
  "room": {
    "id": "new_room_id",
    "room_number": "201",
    "type": "double",
    "status": "available",
    "capacity": 4,
    "price_per_night": "250.00",
    "description": "Spacious double room with balcony",
    "amenities": {
      "wifi": true,
      "tv": true,
      "ac": true,
      "breakfast": true,
      "balcony": true,
      "minibar": true
    },
    "images": [
      "https://example.com/room201-1.jpg",
      "https://example.com/room201-2.jpg"
    ],
    "floor": 2,
    "size_sqm": "35.00",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (409)**:
```json
{
  "message": "Room number already exists"
}
```

**Error Response (401)**:
```json
{
  "message": "Unauthorized"
}
```

**Error Response (403)**:
```json
{
  "message": "Forbidden"
}
```

---

## ✏️ **4. Update Room (Admin Only)**

**URL**: `PUT /api/rooms/:id`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer your_admin_access_token
```

**Request Body**:
```json
{
  "price_per_night": 275.00,
  "status": "maintenance",
  "description": "Updated description for maintenance",
  "amenities": {
    "wifi": true,
    "tv": true,
    "ac": true,
    "breakfast": true,
    "balcony": true,
    "minibar": true,
    "room_service": true
  }
}
```

**Expected Success Response (200)**:
```json
{
  "message": "Room updated successfully",
  "room": {
    "id": "room_id_here",
    "room_number": "201",
    "type": "double",
    "status": "maintenance",
    "capacity": 4,
    "price_per_night": "275.00",
    "description": "Updated description for maintenance",
    "amenities": {
      "wifi": true,
      "tv": true,
      "ac": true,
      "breakfast": true,
      "balcony": true,
      "minibar": true,
      "room_service": true
    },
    "images": [
      "https://example.com/room201-1.jpg",
      "https://example.com/room201-2.jpg"
    ],
    "floor": 2,
    "size_sqm": "35.00",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## 🗑️ **5. Delete Room (Admin Only)**

**URL**: `DELETE /api/rooms/:id`

**Headers**:
```
Authorization: Bearer your_admin_access_token
```

**Expected Success Response (200)**:
```json
{
  "message": "Room deleted successfully"
}
```

**Error Response (409)**:
```json
{
  "message": "Cannot delete room with active bookings"
}
```

---

## 📊 **6. Get Room Statistics (Admin Only)**

**URL**: `GET /api/rooms/stats/overview`

**Headers**:
```
Authorization: Bearer your_admin_access_token
```

**Expected Success Response (200)**:
```json
{
  "message": "Room statistics retrieved successfully",
  "stats": {
    "total": 50,
    "available": 35,
    "occupied": 10,
    "maintenance": 3,
    "cleaning": 2,
    "byType": [
      {
        "type": "single",
        "_count": {
          "type": 20
        }
      },
      {
        "type": "double",
        "_count": {
          "type": 15
        }
      },
      {
        "type": "suite",
        "_count": {
          "type": 10
        }
      },
      {
        "type": "deluxe",
        "_count": {
          "type": 5
        }
      }
    ],
    "occupancyRate": "20.00"
  }
}
```

---

## 🧪 **Testing Workflow**

### **Step 1: Get All Rooms (Public)**
```bash
# Get all rooms with default pagination
GET http://localhost:3000/api/rooms

# Get rooms with filters
GET http://localhost:3000/api/rooms?status=available&type=single&capacity=2

# Get rooms with price range
GET http://localhost:3000/api/rooms?price_per_night_min=100&price_per_night_max=300

# Get rooms with search
GET http://localhost:3000/api/rooms?search=suite&floor=3

# Get rooms with pagination
GET http://localhost:3000/api/rooms?page=2&limit=5&sortBy=price_per_night&sortOrder=asc
```

### **Step 2: Get Room by ID (Public)**
```bash
# Get specific room
GET http://localhost:3000/api/rooms/room_id_here
```

### **Step 3: Create Room (Admin Only)**
```bash
# First, login as admin to get access token
POST http://localhost:3000/api/auth/staff/login
{
  "email": "admin@hotel.com",
  "password": "adminpass123",
  "role": "staff"
}

# Then create a room
POST http://localhost:3000/api/rooms
Authorization: Bearer your_admin_access_token
{
  "room_number": "301",
  "type": "suite",
  "capacity": 6,
  "price_per_night": 500.00,
  "description": "Luxury suite with panoramic view",
  "amenities": {
    "wifi": true,
    "tv": true,
    "ac": true,
    "breakfast": true,
    "balcony": true,
    "minibar": true,
    "room_service": true,
    "jacuzzi": true
  },
  "images": [
    "https://example.com/suite301-1.jpg",
    "https://example.com/suite301-2.jpg"
  ],
  "floor": 3,
  "size_sqm": 75.00
}
```

### **Step 4: Update Room (Admin Only)**
```bash
# Update room details
PUT http://localhost:3000/api/rooms/room_id_here
Authorization: Bearer your_admin_access_token
{
  "price_per_night": 550.00,
  "status": "available",
  "description": "Updated luxury suite description"
}
```

### **Step 5: Get Room Statistics (Admin Only)**
```bash
# Get room statistics
GET http://localhost:3000/api/rooms/stats/overview
Authorization: Bearer your_admin_access_token
```

### **Step 6: Delete Room (Admin Only)**
```bash
# Delete room (only if no active bookings)
DELETE http://localhost:3000/api/rooms/room_id_here
Authorization: Bearer your_admin_access_token
```

---

## 🔄 **Frontend Integration Example**

### **Room List Component with Infinite Scroll**
```typescript
// components/RoomList.tsx
import React, { useState, useEffect } from 'react';

interface Room {
  id: string;
  room_number: string;
  type: string;
  status: string;
  capacity: number;
  price_per_night: string;
  description?: string;
  amenities: Record<string, any>;
  images?: string[];
  floor?: number;
  size_sqm?: string;
}

interface RoomListResponse {
  rooms: Room[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    capacity: '',
    price_min: '',
    price_max: '',
    search: '',
  });

  const fetchRooms = async (pageNum: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...filters,
      });

      const response = await fetch(`/api/rooms?${queryParams}`);
      const data: RoomListResponse = await response.json();

      if (reset) {
        setRooms(data.rooms);
      } else {
        setRooms(prev => [...prev, ...data.rooms]);
      }

      setHasNext(data.hasNext);
      setPage(data.page);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(1, true);
  }, [filters]);

  const loadMore = () => {
    if (!loading && hasNext) {
      fetchRooms(page + 1);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
          <option value="cleaning">Cleaning</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
          <option value="deluxe">Deluxe</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filters.price_min}
          onChange={(e) => handleFilterChange('price_min', e.target.value)}
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.price_max}
          onChange={(e) => handleFilterChange('price_max', e.target.value)}
        />

        <input
          type="text"
          placeholder="Search rooms..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>

      {/* Room List */}
      <div className="room-grid">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <img
              src={room.images?.[0] || '/default-room.jpg'}
              alt={`Room ${room.room_number}`}
            />
            <div className="room-info">
              <h3>Room {room.room_number}</h3>
              <p className="room-type">{room.type}</p>
              <p className="room-status">{room.status}</p>
              <p className="room-capacity">Capacity: {room.capacity}</p>
              <p className="room-price">${room.price_per_night}/night</p>
              {room.description && <p className="room-description">{room.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasNext && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="load-more-btn"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};
```

### **Room Management Component (Admin)**
```typescript
// components/RoomManagement.tsx
import React, { useState } from 'react';

export const RoomManagement: React.FC = () => {
  const [formData, setFormData] = useState({
    room_number: '',
    type: 'single',
    capacity: 1,
    price_per_night: '',
    description: '',
    amenities: {},
    images: [],
    floor: '',
    size_sqm: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Room created successfully!');
        // Reset form or redirect
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Room</h2>
      
      <input
        type="text"
        placeholder="Room Number"
        value={formData.room_number}
        onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
        required
      />

      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        required
      >
        <option value="single">Single</option>
        <option value="double">Double</option>
        <option value="suite">Suite</option>
        <option value="deluxe">Deluxe</option>
      </select>

      <input
        type="number"
        placeholder="Capacity"
        value={formData.capacity}
        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
        min="1"
        max="10"
        required
      />

      <input
        type="number"
        placeholder="Price per Night"
        value={formData.price_per_night}
        onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
        step="0.01"
        required
      />

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <button type="submit">Create Room</button>
    </form>
  );
};
```

---

## 🛡️ **Security Features**

### **1. Role-Based Access Control**
- **Public endpoints**: Get rooms, get room by ID
- **Admin-only endpoints**: Create, update, delete rooms, get statistics
- **Authentication required**: All admin operations
- **Role verification**: Only admin users can perform CRUD operations

### **2. Input Validation**
- **Zod schemas** for all input validation
- **Type checking** for all parameters
- **Range validation** for numeric values
- **URL validation** for image links
- **Required field validation**

### **3. Business Logic Protection**
- **Room number uniqueness** validation
- **Active booking check** before deletion
- **Status validation** for room updates
- **Capacity limits** enforcement

### **4. Performance Optimization**
- **Database indexing** on frequently queried fields
- **Pagination** to limit result sets
- **Efficient queries** with proper joins
- **Rate limiting** on all endpoints

---

## 📋 **Query Parameters Reference**

### **Filter Parameters**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Room status filter | `?status=available` |
| `capacity` | number | Exact capacity match | `?capacity=2` |
| `floor` | number | Floor number filter | `?floor=3` |
| `price_per_night_min` | number | Minimum price | `?price_per_night_min=100` |
| `price_per_night_max` | number | Maximum price | `?price_per_night_max=300` |
| `type` | string | Room type filter | `?type=single` |
| `search` | string | Search in room number/description | `?search=suite` |

### **Pagination Parameters**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page (max 100) | 10 |
| `sortBy` | string | Sort field | `created_at` |
| `sortOrder` | string | Sort direction (`asc`/`desc`) | `desc` |

---

## 🚀 **Performance Tips**

1. **Use pagination** for large datasets
2. **Combine filters** to reduce result sets
3. **Cache frequently accessed data**
4. **Use appropriate indexes** on database
5. **Implement lazy loading** in frontend
6. **Optimize image sizes** for room images

---

## 📝 **Error Handling**

### **Common Error Responses**
- **400**: Validation errors, invalid parameters
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Room not found
- **409**: Conflict (room number exists, active bookings)
- **500**: Internal server error

The room management API is now ready for production use with comprehensive security, validation, and performance optimizations! 🎉


