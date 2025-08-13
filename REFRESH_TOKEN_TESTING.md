# 🔄 Refresh Token Testing Guide

## New Endpoints Added

### 1. **Refresh Access Token**
**URL**: `POST http://localhost:3000/api/auth/refresh`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
    "refresh_token": "your_refresh_token_here"
}
```

**Expected Success Response (200)**:
```json
{
    "access_token": "new_access_token_here",
    "token_type": "Bearer",
    "expires_in": 900
}
```

**Error Response (401)**:
```json
{
    "message": "Invalid refresh token"
}
```

---

### 2. **Logout (Single Session)**
**URL**: `POST http://localhost:3000/api/auth/logout`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
    "refresh_token": "your_refresh_token_here"
}
```

**Expected Success Response (200)**:
```json
{
    "message": "Logged out successfully"
}
```

---

### 3. **Logout All Sessions**
**URL**: `POST http://localhost:3000/api/auth/logout-all`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer your_access_token_here
```

**Request Body**: None required

**Expected Success Response (200)**:
```json
{
    "message": "All sessions logged out successfully"
}
```

**Error Response (401)**:
```json
{
    "message": "Unauthorized"
}
```

---

## 🧪 Testing Workflow

### **Step 1: Register/Login to Get Tokens**
```bash
# Register a new user
POST http://localhost:3000/api/auth/guest/register
{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password": "password123"
}
```

**Save the response tokens:**
- `access_token`
- `refresh_token`

### **Step 2: Test Refresh Token**
```bash
# Use the refresh token to get a new access token
POST http://localhost:3000/api/auth/refresh
{
    "refresh_token": "your_refresh_token_from_step_1"
}
```

### **Step 3: Test Logout**
```bash
# Logout using the refresh token
POST http://localhost:3000/api/auth/logout
{
    "refresh_token": "your_refresh_token_from_step_1"
}
```

### **Step 4: Test Logout All Sessions**
```bash
# First, login again to get new tokens
POST http://localhost:3000/api/auth/guest/login
{
    "email": "test@example.com",
    "password": "password123"
}

# Then logout all sessions (requires authentication)
POST http://localhost:3000/api/auth/logout-all
Authorization: Bearer your_new_access_token
```

---

## 🔄 Frontend Integration Example

### **Updated Auth Service**
```typescript
// services/authService.ts
export const authService = {
  // ... existing methods ...

  // Refresh token
  async refreshToken(refreshToken: string) {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  },

  // Logout
  async logout(refreshToken: string) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of server response
      localStorage.removeItem('access_token');
      Cookies.remove('refresh_token');
    }
  },

  // Logout all sessions
  async logoutAllSessions(accessToken: string) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Logout all sessions error:', error);
    } finally {
      localStorage.removeItem('access_token');
      Cookies.remove('refresh_token');
    }
  },
};
```

### **Updated Axios Interceptor**
```typescript
// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Call refresh token endpoint
        const response = await authService.refreshToken(refreshToken);
        const { access_token } = response;

        // Update access token
        localStorage.setItem('access_token', access_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        authService.logout(Cookies.get('refresh_token') || '');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 🛡️ Security Features

### **1. Token Validation**
- Refresh tokens are validated against the database
- Expired tokens are automatically deleted
- Invalid tokens return 401 errors

### **2. User Status Check**
- Disabled accounts cannot refresh tokens
- Inactive users are blocked from token refresh

### **3. Session Management**
- Individual logout deletes specific refresh token
- Logout all sessions deletes all user's refresh tokens
- Secure token storage and transmission

### **4. Rate Limiting**
- All endpoints are protected by rate limiting
- Prevents brute force attacks

---

## 📋 Error Handling

### **Common Error Scenarios**

1. **Invalid Refresh Token**
   ```json
   {
     "message": "Invalid refresh token"
   }
   ```

2. **Expired Refresh Token**
   ```json
   {
     "message": "Refresh token expired"
   }
   ```

3. **Account Disabled**
   ```json
   {
     "message": "Account disabled"
   }
   ```

4. **Unauthorized Access**
   ```json
   {
     "message": "Unauthorized"
   }
   ```

---

## 🚀 Testing Checklist

- [ ] Register new user and get tokens
- [ ] Use refresh token to get new access token
- [ ] Verify new access token works for API calls
- [ ] Test logout with refresh token
- [ ] Test logout all sessions with access token
- [ ] Verify tokens are invalidated after logout
- [ ] Test error handling for invalid tokens
- [ ] Test error handling for expired tokens
- [ ] Test rate limiting on endpoints

---

## 🔧 Environment Setup

Make sure your `.env` file includes:
```env
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
STAFF_REGISTRATION_KEY=your_staff_key_here
```

---

## 📝 Notes

- Refresh tokens are stored in the database with expiration dates
- Access tokens are short-lived (15 minutes)
- Refresh tokens are long-lived (7 days)
- All tokens are automatically cleaned up when expired
- The system supports multiple concurrent sessions per user
