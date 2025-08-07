# WorkGuard360 Backend

Enterprise-grade security management backend built with Node.js, Express, and MongoDB. Production-ready with comprehensive security features, real-time capabilities, and seamless frontend integration.

## 🚀 Features

### Core Features

- **JWT Authentication** - Secure token-based authentication with refresh capabilities
- **Role-Based Access Control** - Admin, Security Manager, Security Guard, Employee roles
- **Real-time Alerts** - Socket.IO integration for live notifications
- **Comprehensive API** - Users, Alerts, Reports, Dashboard endpoints
- **Advanced Security** - Rate limiting, CORS, Helmet, input validation
- **Production Logging** - Winston logger with file and console output
- **Database Optimization** - MongoDB indexing and aggregation pipelines
- **Health Monitoring** - Detailed health check endpoints

### Security Features

- **Password Hashing** - bcrypt with configurable salt rounds
- **Account Lockout** - Protection against brute force attacks
- **Input Validation** - Comprehensive request validation
- **SQL Injection Prevention** - Parameterized queries and sanitization
- **CORS Configuration** - Precise origin control for production
- **Rate Limiting** - IP-based request limiting

## 🏗️ Architecture

```
├── server.js              # Main application entry point
├── middleware/             # Custom middleware
│   ├── auth.js            # JWT authentication
│   ├── authorize.js       # Role-based authorization
│   └── errorHandler.js    # Global error handling
├── models/                # Mongoose data models
│   ├── User.js           # User schema with roles
│   └── Alert.js          # Alert/incident schema
├── routes/                # API route handlers
│   ├── auth.js           # Authentication endpoints
│   ├── users.js          # User management
│   ├── alerts.js         # Alert management
│   ├── reports.js        # Reporting system
│   ├── dashboard.js      # Dashboard data
│   └── health.js         # Health monitoring
├── utils/                 # Utility functions
│   └── logger.js         # Winston logging configuration
└── scripts/               # Database and deployment scripts
    └── seed.js           # Database seeding
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Environment variables configured

### Installation

1. **Clone and Install**

```bash
git clone <your-repo>
cd workguard360-backend
npm install
```

2. **Environment Setup**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Seeding**

```bash
npm run seed
```

4. **Start Development**

```bash
npm run dev
```

5. **Production Start**

```bash
npm start
```

## 🌍 Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Frontend URL
CLIENT_URL=https://workguard360.vercel.app

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/workguard360

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Security
BCRYPT_SALT_ROUNDS=12

# Logging
LOG_LEVEL=info
```

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password
- `POST /api/auth/logout` - User logout

### Users Management

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Alerts & Incidents

- `GET /api/alerts` - Get alerts with filtering
- `GET /api/alerts/:id` - Get alert details
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert
- `POST /api/alerts/:id/comments` - Add comment

### Dashboard & Reports

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/recent` - Recent activities
- `GET /api/reports/alerts` - Alert reports
- `GET /api/reports/users` - User reports
- `GET /api/reports/export` - Export data

### Health Monitoring

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status

## 👥 User Roles & Permissions

### Admin (`admin`)

- Full system access
- User management
- System configuration
- All CRUD operations

### Security Manager (`security_manager`)

- User management (limited)
- Alert management
- Report generation
- Team oversight

### Security Guard (`security_guard`)

- Alert creation/updates
- Incident reporting
- Basic dashboard access

### Employee (`employee`)

- Dashboard viewing
- Personal profile updates
- Basic alert viewing

## 🔐 Security Implementation

### Authentication Flow

1. User submits credentials
2. Server validates against database
3. JWT token generated and returned
4. Token required for protected routes
5. Token validation on each request

### Password Security

- bcrypt hashing with 12 salt rounds
- Minimum 6 character requirement
- Account lockout after 5 failed attempts
- Password update with current password verification

### Request Security

- Rate limiting (100 requests/15 minutes)
- Input validation with express-validator
- CORS configuration for specific origins
- Helmet security headers
- Request size limiting

## 📈 Monitoring & Logging

### Winston Logging

- Console output for development
- File logging for production
- Log rotation and size management
- Structured logging with timestamps

### Health Checks

- Database connectivity monitoring
- Memory usage tracking
- Uptime monitoring
- Service status verification

## 🚀 Deployment on Render

### Automatic Deployment

1. Connect GitHub repository to Render
2. Environment variables configured automatically
3. Build and start commands:
   - **Build**: `npm install`
   - **Start**: `npm start`

### Environment Configuration

- All environment variables set in Render dashboard
- Database connection string configured
- CORS origins set for production

### Monitoring

- Health endpoint: `https://your-app.onrender.com/api/health`
- Logs available in Render dashboard
- Automatic deployment on git push

## 🛠️ Development

### Database Seeding

```bash
npm run seed
```

Creates:

- 5 Demo users with different roles
- 25 Sample alerts with realistic data
- Complete permission structure
- 7 days of historical data

### Demo Credentials

- **Admin**: admin@workguard360.com / demo123
- **Manager**: manager@workguard360.com / demo123
- **Guard**: guard1@workguard360.com / demo123
- **Employee**: employee@workguard360.com / demo123

### Testing

```bash
npm test
```

### Development Mode

```bash
npm run dev  # Uses nodemon for auto-restart
```

## 🎯 Production Features

### Performance

- Response compression (gzip)
- Database connection pooling
- Efficient indexing strategy
- Optimized aggregation queries

### Scalability

- Stateless JWT authentication
- Horizontal scaling ready
- Connection pooling
- Caching strategies

### Reliability

- Graceful shutdown handling
- Connection retry logic
- Error boundary implementation
- Comprehensive error logging

## 📞 Support

For technical support or questions:

- Check health endpoint: `/api/health/detailed`
- Review application logs
- Verify environment configuration
- Confirm database connectivity

---

**WorkGuard360** - Enterprise Security Management Platform
Built for scalability, security, and performance.
