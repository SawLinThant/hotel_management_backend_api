# 🏨 Hotel Management Backend API

A robust, secure, and scalable Node.js backend API for hotel management systems built with TypeScript, Express, Prisma, and PostgreSQL.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Guest, Staff, Admin)
- **Secure password reset** functionality
- **Session management** with multi-device support
- **Rate limiting** for API protection

### 👥 User Management
- **Guest registration and login**
- **Staff registration** with secure registration keys
- **Email verification** system
- **Password reset** with secure token-based flow
- **User profile management**

### 🏠 Hotel Operations
- **Room management** with different types and statuses
- **Booking system** with availability tracking
- **Payment processing** with multiple payment methods
- **Stay records** for guest tracking
- **Room amenities** and pricing management

### 🛡️ Security Features
- **Input validation** with Zod schemas
- **SQL injection protection** with Prisma ORM
- **XSS protection** with Helmet middleware
- **CORS configuration** for cross-origin requests
- **Rate limiting** to prevent abuse
- **Secure token storage** and management

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hotel_management_backend_api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/hotel_management"

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secure_access_secret_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
STAFF_REGISTRATION_KEY=your_staff_registration_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed the database
npm run prisma:seed
```

### 5. Build the Project
```bash
npm run build
```

### 6. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📁 Project Structure

```
hotel_management_backend_api/
├── src/
│   ├── app.ts                 # Main application entry point
│   ├── config/
│   │   └── index.ts          # Configuration management
│   ├── controllers/
│   │   ├── authController.ts # Authentication controllers
│   │   └── passwordResetController.ts # Password reset controllers
│   ├── middleware/
│   │   ├── authMiddleware.ts # JWT authentication middleware
│   │   └── rateLimit.ts      # Rate limiting middleware
│   ├── routes/
│   │   ├── authRoutes.ts     # Authentication routes
│   │   └── passwordResetRoutes.ts # Password reset routes
│   ├── services/
│   │   ├── authService.ts    # Authentication business logic
│   │   └── passwordResetService.ts # Password reset logic
│   └── utils/
│       └── logger.ts         # Logging utilities
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── generated/
│   └── prisma/              # Generated Prisma client
├── dist/                    # Compiled TypeScript output
├── package.json
├── tsconfig.json
└── README.md
```

## 🔗 API Endpoints

### Authentication Endpoints

#### Guest Registration
```http
POST /api/auth/guest/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "phone": "+1234567890"
}
```

#### Staff Registration
```http
POST /api/auth/staff/register
Content-Type: application/json

{
  "first_name": "Manager",
  "last_name": "Smith",
  "email": "manager@hotel.com",
  "password": "staffPassword123",
  "registration_key": "your_staff_key_here",
  "phone": "+1987654321"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "guest"
}
```

#### Token Management
```http
# Refresh access token
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}

# Logout
POST /api/auth/logout
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}

# Logout all sessions
POST /api/auth/logout-all
Authorization: Bearer your_access_token
```

### Password Reset Endpoints

#### Request Password Reset
```http
POST /api/password-reset/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Validate Reset Token
```http
POST /api/password-reset/validate
Content-Type: application/json

{
  "token": "reset_token_here"
}
```

#### Reset Password
```http
POST /api/password-reset/reset
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

## 🧪 Testing

### Manual Testing with Postman

1. **Import the collection** from the `postman` folder
2. **Set up environment variables** in Postman
3. **Test the endpoints** following the workflow

### Automated Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build the project
npm start           # Start production server

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Seed the database

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

### Code Quality

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Zod** for runtime validation

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `JWT_ACCESS_SECRET` | JWT access token secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - |
| `STAFF_REGISTRATION_KEY` | Staff registration key | - |
| `CORS_ORIGIN` | Allowed CORS origins | http://localhost:3000 |
| `FRONTEND_URL` | Frontend URL for reset links | http://localhost:3000 |

## 🗄️ Database Schema

### Core Models

- **User**: Guest and staff accounts
- **Room**: Hotel rooms with types and statuses
- **Booking**: Room reservations
- **Payment**: Payment transactions
- **StayRecord**: Guest stay tracking

### Security Models

- **RefreshToken**: JWT refresh tokens
- **EmailVerificationToken**: Email verification
- **PasswordResetToken**: Password reset tokens

## 🛡️ Security Considerations

### Authentication Security
- **JWT tokens** with short expiration times
- **Refresh token rotation** for enhanced security
- **Secure password hashing** with bcrypt
- **Rate limiting** to prevent brute force attacks

### Data Protection
- **Input validation** with Zod schemas
- **SQL injection protection** with Prisma ORM
- **XSS protection** with Helmet middleware
- **CORS configuration** for cross-origin security

### Token Management
- **Secure token storage** in database
- **Automatic token cleanup** for expired tokens
- **Session invalidation** on password reset
- **Multi-device session support**

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   DATABASE_URL=your_production_db_url
   JWT_ACCESS_SECRET=your_production_secret
   JWT_REFRESH_SECRET=your_production_secret
   ```

2. **Database Migration**
   ```bash
   npm run prisma:migrate:deploy
   ```

3. **Build and Start**
   ```bash
   npm run build
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

### Logging
The application uses Winston for structured logging:
- **Error logging** with stack traces
- **Request logging** with timing
- **Security event logging**

### Health Checks
```http
GET /api/health
```

### Metrics
- **Request/response times**
- **Error rates**
- **Database connection status**

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow **TypeScript** best practices
- Write **comprehensive tests** for new features
- Update **documentation** for API changes
- Follow **conventional commits** format

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

1. **Database Connection Issues**
   - Verify `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Check database permissions

2. **JWT Token Issues**
   - Verify JWT secrets in `.env`
   - Check token expiration times
   - Ensure proper token format

3. **CORS Issues**
   - Update `CORS_ORIGIN` in `.env`
   - Check frontend URL configuration

### Getting Help

- **Documentation**: Check the API documentation
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions

## 🔮 Roadmap

### Planned Features
- [ ] **Email service integration** (SendGrid/Nodemailer)
- [ ] **File upload** for room images
- [ ] **Real-time notifications** with WebSockets
- [ ] **Advanced reporting** and analytics
- [ ] **Multi-language support**
- [ ] **Mobile app API** endpoints
- [ ] **Payment gateway integration**
- [ ] **Automated testing** suite

### Performance Improvements
- [ ] **Database query optimization**
- [ ] **Caching layer** (Redis)
- [ ] **API response compression**
- [ ] **CDN integration** for static assets

---

**Built with ❤️ using TypeScript, Express, Prisma, and PostgreSQL**
