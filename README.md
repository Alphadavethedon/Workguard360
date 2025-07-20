# 🚨 WorkGuard360 Backend

### Smart Workplace Security & Compliance System - Backend API

A production-ready, secure, and scalable backend API for the WorkGuard360 workplace security and compliance monitoring system.

## 🚀 Features

### 🔐 Authentication & Authorization

- JWT-based authentication with secure token management
- Role-based access control (Admin, HR, Security, Employee)
- Password hashing with bcrypt
- Protected routes with middleware

### 📊 Real-time Monitoring

- Socket.IO integration for real-time updates
- Live access log streaming
- Instant security alerts
- Dashboard activity feeds

### 🛡️ Security Features

- Rate limiting and DDoS protection
- Input validation and sanitization
- XSS and NoSQL injection protection
- Helmet.js security headers
- CORS configuration

### 📈 Comprehensive API

- User management with CRUD operations
- Access log tracking and violation detection
- Alert system with severity levels
- Shift and floor management
- Advanced reporting with PDF/CSV export

### 🔍 Advanced Analytics

- Dashboard statistics and metrics
- Security compliance scoring
- Violation trend analysis
- User activity patterns

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Validation**: express-validator
- **File Processing**: Multer
- **Reports**: PDFKit, json2csv
- **Testing**: Jest, Supertest

## 📦 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd workguard360-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database Setup**

```bash
# Seed the database with sample data
npm run seed
```

5. **Start the server**

```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRE=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Frontend URL
CLIENT_URL=https://workguard360.vercel.app
```

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register     - Register new user
POST /api/auth/login        - User login
GET  /api/auth/me          - Get current user
PUT  /api/auth/profile     - Update profile
PUT  /api/auth/change-password - Change password
```

### User Management

```
GET    /api/users          - Get all users (HR/Admin)
GET    /api/users/:id      - Get user by ID
POST   /api/users          - Create new user
PUT    /api/users/:id      - Update user
DELETE /api/users/:id      - Delete user
```

### Access Logs

```
GET  /api/access-logs      - Get access logs
POST /api/access-logs      - Create access log
GET  /api/access-logs/:id  - Get specific log
GET  /api/access-logs/violations - Get violations
```

### Alerts

```
GET    /api/alerts         - Get all alerts
POST   /api/alerts         - Create alert
GET    /api/alerts/:id     - Get alert by ID
PATCH  /api/alerts/:id/acknowledge - Acknowledge alert
PATCH  /api/alerts/:id/resolve - Resolve alert
```

### Dashboard

```
GET /api/dashboard/stats    - Get dashboard statistics
GET /api/dashboard/activity - Get activity feed
GET /api/dashboard/security - Get security overview
```

### Reports

```
GET /api/reports/access     - Generate access report
GET /api/reports/security   - Generate security report
GET /api/reports/compliance - Generate compliance report
```

## 🏗️ Project Structure

```
src/
├── models/           # Mongoose models
│   ├── User.js
│   ├── AccessLog.js
│   ├── Alert.js
│   ├── Shift.js
│   └── Floor.js
├── routes/           # Express routes
│   ├── auth.js
│   ├── users.js
│   ├── accessLogs.js
│   ├── alerts.js
│   ├── dashboard.js
│   └── reports.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   ├── validation.js
│   ├── errorHandler.js
│   └── notFound.js
├── utils/           # Utility functions
│   └── seedData.js
├── scripts/         # Utility scripts
│   └── seed.js
└── server.js        # Main server file
```

## 🔒 Security Features

### Authentication & Authorization

- JWT tokens with configurable expiration
- Role-based access control
- Password hashing with bcrypt
- Protected routes middleware

### Input Validation

- Request validation with express-validator
- MongoDB injection prevention
- XSS protection
- File upload restrictions

### Rate Limiting

- Configurable rate limits per IP
- Different limits for different endpoints
- DDoS protection

### Security Headers

- Helmet.js for security headers
- CORS configuration
- Content Security Policy

## 📊 Database Models

### User Model

- Personal information and credentials
- Role-based permissions
- Shift assignments
- Authorized floor access

### AccessLog Model

- Entry/exit tracking
- Violation detection
- Device and method tracking
- Geolocation support

### Alert Model

- Security incident tracking
- Severity levels
- Assignment and resolution
- Related entity references

### Shift Model

- Work schedule management
- Time-based access control
- Overtime tracking

### Floor Model

- Building layout management
- Security level classification
- Access point configuration

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

## 🚀 Deployment

### Render Deployment

1. **Create Render Account**

   - Sign up at [render.com](https://render.com)
2. **Create Web Service**

   - Connect your GitHub repository
   - Choose "Web Service"
   - Set build command: `npm install`
   - Set start command: `npm start`
3. **Environment Variables**

   - Add all required environment variables
   - Set `NODE_ENV=production`
4. **Database**

   - Use MongoDB Atlas for production database
   - Update `MONGO_URI` with production connection string

### Environment Setup for Production

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/workguard360
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://workguard360.vercel.app
```

## 📈 Performance Optimization

- Database indexing for frequently queried fields
- Pagination for large datasets
- Compression middleware
- Efficient aggregation pipelines
- Connection pooling

## 🔍 Monitoring & Logging

- Structured logging with Morgan
- Error tracking and handling
- Performance monitoring
- Health check endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Davis Wabwile**

- Portfolio: [davisportfolio.vercel.app](https://davisportfolio.vercel.app/)
- Email: daviswabwile@gmail.com

---

## 🎯 Demo Credentials

After seeding the database, use these credentials:

| Role     | Email                     | Password    |
| -------- | ------------------------- | ----------- |
| Admin    | admin@workguard360.com    | admin123    |
| HR       | hr@workguard360.com       | hr123       |
| Security | security@workguard360.com | security123 |
| Employee | john.doe@workguard360.com | employee123 |

---

**Built with ❤️ for enterprise security and compliance**
