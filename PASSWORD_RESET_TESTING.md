# 🔐 Password Reset API Testing Guide

## Overview

The password reset system provides a secure way for users to reset their passwords when they forget them. The process involves three main steps:

1. **Request Password Reset** - User requests a reset link via email
2. **Validate Reset Token** - Frontend validates the token from the reset link
3. **Reset Password** - User sets a new password using the valid token

---

## 🔗 **API Endpoints**

### **Base URL**: `http://localhost:3000/api`

---

## 📧 **1. Request Password Reset**

**URL**: `POST /api/password-reset/request`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
    "email": "user@example.com"
}
```

**Expected Success Response (200)**:
```json
{
    "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Error Response (400)**:
```json
{
    "message": "Invalid email format",
    "errors": [
        {
            "code": "invalid_string",
            "message": "Invalid email",
            "path": ["email"]
        }
    ]
}
```

**Error Response (500)**:
```json
{
    "message": "Failed to process password reset request"
}
```

---

## ✅ **2. Validate Reset Token**

**URL**: `POST /api/password-reset/validate`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
    "token": "your_reset_token_here"
}
```

**Expected Success Response (200)**:
```json
{
    "message": "Token is valid",
    "user": {
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
}
```

**Error Response (400)**:
```json
{
    "message": "Invalid or expired reset token"
}
```

---

## 🔄 **3. Reset Password**

**URL**: `POST /api/password-reset/reset`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
    "token": "your_reset_token_here",
    "password": "newPassword123",
    "confirmPassword": "newPassword123"
}
```

**Expected Success Response (200)**:
```json
{
    "message": "Password has been reset successfully. Please log in with your new password."
}
```

**Error Response (400) - Passwords don't match**:
```json
{
    "message": "Invalid input data",
    "errors": [
        {
            "code": "custom",
            "message": "Passwords don't match",
            "path": ["confirmPassword"]
        }
    ]
}
```

**Error Response (400) - Invalid token**:
```json
{
    "message": "Invalid or expired reset token"
}
```

**Error Response (400) - Password too short**:
```json
{
    "message": "Invalid input data",
    "errors": [
        {
            "code": "too_small",
            "minimum": 8,
            "type": "string",
            "inclusive": true,
            "exact": false,
            "message": "Password must be at least 8 characters long",
            "path": ["password"]
        }
    ]
}
```

---

## 🧪 **Testing Workflow**

### **Step 1: Request Password Reset**
```bash
# Request password reset for an existing user
POST http://localhost:3000/api/password-reset/request
{
    "email": "test@example.com"
}
```

**Check the console output** for the reset token and link:
```
Password reset email sent to test@example.com:
Reset link: http://localhost:3000/reset-password?token=abc123...
Token: abc123...
```

### **Step 2: Validate the Reset Token**
```bash
# Validate the token from Step 1
POST http://localhost:3000/api/password-reset/validate
{
    "token": "abc123..."
}
```

### **Step 3: Reset the Password**
```bash
# Reset password using the valid token
POST http://localhost:3000/api/password-reset/reset
{
    "token": "abc123...",
    "password": "newSecurePassword123",
    "confirmPassword": "newSecurePassword123"
}
```

### **Step 4: Test Login with New Password**
```bash
# Try logging in with the new password
POST http://localhost:3000/api/auth/guest/login
{
    "email": "test@example.com",
    "password": "newSecurePassword123"
}
```

---

## 🔄 **Frontend Integration Example**

### **Password Reset Request Component**
```typescript
// components/ForgotPasswordForm.tsx
import React, { useState } from 'react';

export const ForgotPasswordForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/password-reset/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to request password reset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Forgot Password</h2>
            <p>Enter your email address and we'll send you a reset link.</p>
            
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            
            <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};
```

### **Password Reset Form Component**
```typescript
// components/ResetPasswordForm.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const ResetPasswordForm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        if (token) {
            validateToken();
        }
    }, [token]);

    const validateToken = async () => {
        try {
            const response = await fetch('/api/password-reset/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
            } else {
                setError('Invalid or expired reset link');
            }
        } catch (err) {
            setError('Failed to validate reset link');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/password-reset/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                // Redirect to login page after successful reset
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return <div>Invalid reset link</div>;
    }

    if (error && !user) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Reset Password</h2>
            {user && (
                <p>Reset password for: {user.email}</p>
            )}
            
            <input
                type="password"
                placeholder="New Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
            />
            
            <input
                type="password"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
            />
            
            <button type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};
```

---

## 🛡️ **Security Features**

### **1. Token Security**
- **Cryptographically secure** random tokens (32 bytes)
- **Time-limited** tokens (1 hour expiration)
- **Single-use** tokens (consumed after use)
- **Database storage** for token validation and revocation

### **2. Privacy Protection**
- **No email enumeration** - Same response for existing/non-existing emails
- **No user information leakage** in error messages
- **Secure token transmission** via email links

### **3. Rate Limiting**
- All endpoints protected by rate limiting
- Prevents brute force attacks
- Prevents email spam

### **4. Automatic Cleanup**
- Expired tokens automatically deleted
- Consumed tokens marked as used
- All user sessions logged out after password reset

---

## 📋 **Testing Scenarios**

### **✅ Valid Scenarios**
- [ ] Request reset for existing user
- [ ] Validate valid reset token
- [ ] Reset password with valid token
- [ ] Login with new password
- [ ] Old password no longer works

### **❌ Error Scenarios**
- [ ] Request reset for non-existing email
- [ ] Validate expired token
- [ ] Validate consumed token
- [ ] Validate invalid token
- [ ] Reset password with mismatched passwords
- [ ] Reset password with short password
- [ ] Reset password with expired token

### **🔄 Edge Cases**
- [ ] Multiple reset requests for same user
- [ ] Token validation after password reset
- [ ] Rate limiting on endpoints
- [ ] Concurrent password reset attempts

---

## 🔧 **Environment Setup**

Add to your `.env` file:
```env
FRONTEND_URL=http://localhost:3000
```

---

## 📝 **Implementation Notes**

### **Email Service Integration**
The current implementation logs reset links to the console. In production, you should:

1. **Install an email service**:
   ```bash
   npm install nodemailer
   # or
   npm install @sendgrid/mail
   # or
   npm install @aws-sdk/client-ses
   ```

2. **Configure email settings** in your config
3. **Implement actual email sending** in `sendPasswordResetEmail()`

### **Frontend URL Configuration**
Update the `FRONTEND_URL` in your environment variables to match your frontend application URL.

### **Token Expiration**
Tokens expire after 1 hour. You can adjust this in the `requestPasswordReset` function by changing:
```typescript
const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
```

---

## 🚀 **Production Considerations**

1. **Email Service**: Implement proper email sending
2. **HTTPS**: Ensure all communications are over HTTPS
3. **Rate Limiting**: Configure appropriate rate limits
4. **Monitoring**: Add logging and monitoring for security events
5. **Backup**: Ensure database backups include password reset tokens
6. **Audit**: Log password reset attempts for security auditing
